import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error("Sistem Error: MONGODB_URI belum dikonfigurasi di Environment Variables Vercel!");
}

// MANAGEMENT KONEKSI SINGLETON: Mencegah kebocoran pool koneksi pada serverless Vercel
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

// Helper untuk mengambil koleksi 'members' di dalam database 'freedom_db'
async function getCollection() {
  const dbClient = await clientPromise;
  const db = dbClient.db('freedom_db'); 
  return db.collection('members');
}

// ==========================================
// 1. [READ] - AMBIL SEMUA DATA MEMBER ROSTER
// ==========================================
export async function GET() {
  try {
    const collection = await getCollection();
    // Ambil semua data dan ubah menjadi Array JSON
    const data = await collection.find({}).toArray();
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: 'DATABASE ERROR: Gagal mengambil data dari MongoDB Atlas.',
      details: err.message 
    }, { status: 500 });
  }
}

// ==========================================
// 2. [CREATE] - TAMBAH MEMBER CLAN BARU
// ==========================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, role, specialRoles, description, customSkinUrl } = body;

    // Validasi input wajib
    if (!name || name.trim() === "") {
      return NextResponse.json({ success: false, error: 'VALIDASI ERROR: Gamertag player tidak boleh kosong.' }, { status: 400 });
    }

    const collection = await getCollection();
    
    // Sistem Proteksi: Cek apakah gamertag sudah ada (Anti-Duplikat, tidak sensitif huruf besar/kecil)
    const isDuplicate = await collection.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (isDuplicate) {
      return NextResponse.json({ 
        success: false, 
        error: `DUPLIKAT ERROR: Gamertag "${name}" sudah terdaftar di database clan.` 
      }, { status: 400 });
    }

    const newMember = {
      name: name.trim(),
      role: role || 'Member',
      specialRoles: specialRoles || [],
      description: description || 'Player ini adalah petarung garis depan dari clan Freedom.',
      customSkinUrl: customSkinUrl || null,
      createdAt: new Date()
    };

    await collection.insertOne(newMember);

    return NextResponse.json({ 
      success: true, 
      message: `NOTIFIKASI: Anggota ${name} telah sukses didaftarkan ke dalam database FREEDOM CLAN.` 
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: 'SYSTEM ERROR: Gagal mengamankan data ke MongoDB Atlas Cluster0.',
      details: err.message 
    }, { status: 500 });
  }
}

// ==========================================
// 3. [UPDATE] - EDIT PROFIL & SKIN MEMBER LAMA
// ==========================================
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, role, specialRoles, description, customSkinUrl } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'VALIDASI ERROR: ID Dokumen diperlukan untuk pembaruan data.' }, { status: 400 });
    }

    const collection = await getCollection();

    const updatedData = {
      name: name.trim(),
      role: role,
      specialRoles: specialRoles || [],
      description: description,
      customSkinUrl: customSkinUrl || null,
      updatedAt: new Date()
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'ERROR: Player tidak ditemukan atau ID tidak valid.' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `NOTIFIKASI: Sinkronisasi berhasil. Profil dan berkas custom skin ${name} telah diperbarui.` 
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: 'SYSTEM ERROR: Gagal memperbarui data dokumen di MongoDB Atlas.',
      details: err.message 
    }, { status: 500 });
  }
}

// ==========================================
// 4. [DELETE] - HAPUS / KELUARKAN MEMBER
// ==========================================
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id, name } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'VALIDASI ERROR: ID Dokumen wajib disertakan untuk penghapusan.' }, { status: 400 });
    }

    const collection = await getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'ERROR: Data gagal dihapus atau player tidak ditemukan di database.' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `NOTIFIKASI: Gamertag ${name || 'Player'} telah resmi dihapus dari database roster FREEDOM.` 
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: 'SYSTEM ERROR: Gagal memproses penghapusan dokumen di MongoDB Atlas.',
      details: err.message 
    }, { status: 500 });
  }
}
