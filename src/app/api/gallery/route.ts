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
  return db.collection('gallery');
}

// ==========================================
// 1. [READ] - AMBIL SEMUA FOTO DI GALERI
// ==========================================
export async function GET() {
  try {
    const collection = await getCollection();
    // Ambil semua foto, urutkan dari yang paling baru diunggah (createdAt: -1)
    const data = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: 'DATABASE ERROR: Gagal mengambil berkas data galeri.',
      details: err.message 
    }, { status: 500 });
  }
}

// ==========================================
// 2. [CREATE] - UPLOAD FOTO BARU (ADMIN ONLY)
// ==========================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password, title, description, imageData } = body;

    // Proteksi Keamanan: Validasi password admin via env Vercel
    if (password !== process.env.PASSWORD) {
      return NextResponse.json({ success: false, error: 'VALIDASI ERROR: Password akses ditolak.' }, { status: 401 });
    }

    if (!imageData) {
      return NextResponse.json({ success: false, error: 'VALIDASI ERROR: Komponen data berkas gambar wajib dilampirkan.' }, { status: 400 });
    }

    const collection = await getCollection();
    const newGalleryItem = {
      title: title.trim() || 'Dokumentasi Freedom',
      description: description || '',
      imageUrl: imageData, // Menyimpan string base64 gambar secara langsung
      createdAt: new Date()
    };

    await collection.insertOne(newGalleryItem);

    return NextResponse.json({ 
      success: true, 
      message: 'NOTIFIKASI: Berkas gambar dokumentasi berhasil diabadikan ke dalam galeri clan.' 
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: 'SYSTEM ERROR: Gagal menyimpan data ke MongoDB Atlas Cluster0.',
      details: err.message 
    }, { status: 500 });
  }
}

// ==========================================
// 3. [DELETE] - HAPUS FOTO GALERI (ADMIN ONLY)
// ==========================================
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id, password } = body;

    if (password !== process.env.PASSWORD) {
      return NextResponse.json({ success: false, error: 'VALIDASI ERROR: Tindakan ilegal, password akses salah.' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'VALIDASI ERROR: ID Dokumen wajib disertakan.' }, { status: 400 });
    }

    const collection = await getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'ERROR: Berkas gambar tidak ditemukan atau sudah terhapus.' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'NOTIFIKASI: Gambar dokumentasi berhasil dihapus secara permanen dari basis data.' 
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: 'SYSTEM ERROR: Gagal mengeksekusi perintah penghapusan dokumen.',
      details: err.message 
    }, { status: 500 });
  }
}
