import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

// Mencegah Next.js melakukan static caching pada API Route
export const dynamic = 'force-dynamic';

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI belum dikonfigurasi di Environment Variables Vercel.");
  }

  if (process.env.NODE_ENV === 'development') {
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };
    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    return globalWithMongo._mongoClientPromise;
  } else {
    if (!clientPromise) {
      client = new MongoClient(uri, options);
      clientPromise = client.connect();
    }
    return clientPromise;
  }
}

async function getCollection() {
  const dbClient = await getClientPromise();
  const db = dbClient.db('freedom_db'); 
  return db.collection('gallery');
}

// ==========================================
// 1. [READ] - AMBIL SEMUA FOTO DI GALERI
// ==========================================
export async function GET() {
  try {
    const collection = await getCollection();
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
    const { password, title, description, imageData, imageUrl } = body;

    const envPassword = process.env.PASSWORD;
    if (!envPassword || password !== envPassword) {
      return NextResponse.json({ success: false, error: 'VALIDASI ERROR: Password akses ditolak.' }, { status: 401 });
    }

    // Mendukung input Base64 (imageData) maupun Link Imgur (imageUrl)
    const finalImage = imageUrl || imageData;

    if (!finalImage) {
      return NextResponse.json({ success: false, error: 'VALIDASI ERROR: Berkas gambar atau URL wajib disertakan.' }, { status: 400 });
    }

    const collection = await getCollection();
    const newGalleryItem = {
      title: (title || '').trim() || 'Dokumentasi Freedom',
      description: description || '',
      imageUrl: finalImage,
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
      error: 'SYSTEM ERROR: Gagal menyimpan data ke MongoDB.',
      details: err.message 
    }, { status: 500 });
  }
}

// ==========================================
// 3. [UPDATE] - EDIT DATA FOTO (ADMIN ONLY)
// ==========================================
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, password, title, description, imageData, imageUrl } = body;

    const envPassword = process.env.PASSWORD;
    if (!envPassword || password !== envPassword) {
      return NextResponse.json({ success: false, error: 'VALIDASI ERROR: Password akses ditolak.' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'VALIDASI ERROR: ID dokumen wajib disertakan untuk melakukan update.' }, { status: 400 });
    }

    const collection = await getCollection();
    
    const updatePayload: any = {
      title: (title || '').trim(),
      description: description || '',
      updatedAt: new Date()
    };

    const finalImage = imageUrl || imageData;
    if (finalImage) {
      updatePayload.imageUrl = finalImage;
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatePayload }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'ERROR: Dokumen galeri tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'NOTIFIKASI: Arsip dokumentasi galeri berhasil diperbarui.' 
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: 'SYSTEM ERROR: Gagal memproses pembaruan dokumen di MongoDB.',
      details: err.message 
    }, { status: 500 });
  }
}

// ==========================================
// 4. [DELETE] - HAPUS FOTO GALERI (ADMIN ONLY)
// ==========================================
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id, password } = body;

    const envPassword = process.env.PASSWORD;
    if (!envPassword || password !== envPassword) {
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
