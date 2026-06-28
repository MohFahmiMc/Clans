import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error("Sistem Error: MONGODB_URI belum dikonfigurasi di Environment Variables Vercel!");
}

// MANAGEMENT KONEKSI SINGLETON: Mengikuti arsitektur route (3).ts & route (4).ts kamu
if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Mengambil koleksi 'alliances' di dalam database 'freedom_db' (SINKRON DENGAN DATABASE UTAMA KAMU)
async function getCollection() {
  const dbClient = await clientPromise;
  const db = dbClient.db('freedom_db'); 
  return db.collection('alliances');
}

// ==========================================
// 1. [READ] - AMBIL SEMUA DATA ALIANSI
// ==========================================
export async function GET() {
  try {
    const collection = await getCollection();
    const alliances = await collection.find({}).sort({ order: 1 }).toArray();
    return NextResponse.json(alliances, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal memuat database aliansi.', details: err.message }, { status: 500 });
  }
}

// ==========================================
// 2. [CREATE] - TAMBAH ALIANSI BARU
// ==========================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password, name, owner, network, createdDate, philosophy, slogan, logoUrl, order } = body;

    // Supaya aman, sistem akan membaca process.env.PASSWORD atau process.env.ADMIN_PASSWORD kamu
    const adminPass = process.env.PASSWORD || process.env.ADMIN_PASSWORD;

    if (password !== adminPass) {
      return NextResponse.json({ error: 'Akses Ditolak: Password administrasi salah!' }, { status: 401 });
    }

    const collection = await getCollection();
    const result = await collection.insertOne({
      name,
      owner,
      network: network || "Official ProwNetwork Clan",
      createdDate,
      philosophy,
      slogan,
      logoUrl: logoUrl || null,
      order: order ?? 0,
      createdAt: new Date()
    });

    return NextResponse.json({ success: true, id: result.insertedId }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal memproses penambahan.', details: err.message }, { status: 500 });
  }
}

// ==========================================
// 3. [UPDATE] - EDIT DATA ALIANSI
// ==========================================
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, password, name, owner, network, createdDate, philosophy, slogan, logoUrl, order } = body;

    const adminPass = process.env.PASSWORD || process.env.ADMIN_PASSWORD;

    if (password !== adminPass) {
      return NextResponse.json({ error: 'Akses Ditolak: Password administrasi salah!' }, { status: 401 });
    }

    const collection = await getCollection();
    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name,
          owner,
          network,
          createdDate,
          philosophy,
          slogan,
          logoUrl,
          order
        }
      }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal memperbarui data aliansi.', details: err.message }, { status: 500 });
  }
}

// ==========================================
// 4. [DELETE] - HAPUS ALIANSI
// ==========================================
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id, password } = body;

    const adminPass = process.env.PASSWORD || process.env.ADMIN_PASSWORD;

    if (password !== adminPass) {
      return NextResponse.json({ error: 'Akses Ditolak: Password administrasi salah!' }, { status: 401 });
    }

    const collection = await getCollection();
    await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal menghapus aliansi.', details: err.message }, { status: 500 });
  }
}
