import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

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
  return db.collection('views');
}

// ==========================================
// 1. [READ] - AMBIL TOTAL PENGUNJUNG
// ==========================================
export async function GET() {
  try {
    const collection = await getCollection();
    let viewData = await collection.findOne({ _id: 'global_views' as any });

    if (!viewData) {
      await collection.insertOne({ _id: 'global_views' as any, count: 0 });
      return NextResponse.json({ views: 0 }, { status: 200 });
    }

    return NextResponse.json({ views: viewData.count }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: 'DATABASE ERROR: Gagal memuat data pengunjung.',
      details: err.message 
    }, { status: 500 });
  }
}

// ==========================================
// 2. [UPDATE] - TAMBAH PENGUNJUNG (+1)
// ==========================================
export async function POST() {
  try {
    const collection = await getCollection();

    // Increment atomic ke MongoDB Atlas
    await collection.updateOne(
      { _id: 'global_views' as any },
      { $inc: { count: 1 } },
      { upsert: true }
    );

    const updatedData = await collection.findOne({ _id: 'global_views' as any });
    const totalViews = updatedData ? updatedData.count : 1;

    return NextResponse.json({ 
      success: true, 
      views: totalViews,
      message: 'NOTIFIKASI: Jumlah pengunjung berhasil ditambahkan ke database.' 
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: 'SYSTEM ERROR: Gagal memperbarui data pengunjung ke MongoDB Atlas.',
      details: err.message 
    }, { status: 500 });
  }
}
