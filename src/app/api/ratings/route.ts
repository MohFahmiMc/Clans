import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error("Sistem Error: MONGODB_URI belum dikonfigurasi di Environment Variables Vercel!");
}

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

async function getCollection() {
  const dbClient = await clientPromise;
  const db = dbClient.db('freedom_db'); 
  return db.collection('ratings');
}

// ==========================================
// 1. [READ] - AMBIL SEMUA DATA ULASAN RATING
// ==========================================
export async function GET() {
  try {
    const collection = await getCollection();
    const data = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: 'DATABASE ERROR: Gagal memuat data review aliansi.',
      details: err.message 
    }, { status: 500 });
  }
}

// ==========================================
// 2. [CREATE] - KIRIM ULASAN RATING BARU
// ==========================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, message, stars } = body;

    if (!name || name.trim() === "" || !stars) {
      return NextResponse.json({ success: false, error: 'VALIDASI ERROR: Parameter nama dan bobot bintang wajib diisi.' }, { status: 400 });
    }

    const collection = await getCollection();
    const newRatingItem = {
      name: name.trim(),
      message: message.trim() || 'Tidak ada pesan ulasan tertulis.',
      stars: Number(stars),
      createdAt: new Date()
    };

    await collection.insertOne(newRatingItem);

    return NextResponse.json({ 
      success: true, 
      message: 'NOTIFIKASI: Kontribusi evaluasi ulasan Anda telah resmi tersimpan ke dalam database.' 
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: 'SYSTEM ERROR: Gagal mengamankan data ulasan ke MongoDB Atlas.',
      details: err.message 
    }, { status: 500 });
  }
}

// ==========================================
// 3. [DELETE] - HAPUS ULASAN RATING (ADMIN ONLY)
// ==========================================
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id, password } = body;

    if (password !== process.env.PASSWORD) {
      return NextResponse.json({ success: false, error: 'VALIDASI ERROR: Hak akses ditolak, kredensial administrasi salah.' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'VALIDASI ERROR: ID Dokumen ulasan diperlukan.' }, { status: 400 });
    }

    const collection = await getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'ERROR: Data ulasan tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'NOTIFIKASI: Data ulasan rating telah berhasil dimoderasi dan dihapus secara permanen.' 
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: 'SYSTEM ERROR: Gagal mengeksekusi penghapusan data dokumen ulasan.',
      details: err.message 
    }, { status: 500 });
  }
}
