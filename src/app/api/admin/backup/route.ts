import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Ganti dengan mekanisme koneksi DB Anda jika menggunakan helper tersendiri (misal: dbConnect())
async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) return;
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI tidak ditemukan di environment variable.');
  }
  await mongoose.connect(process.env.MONGODB_URI);
}

// Verifikasi password admin dari header atau query
function verifyPassword(req: Request) {
  const url = new URL(req.url);
  const password = url.searchParams.get('password') || req.headers.get('x-admin-password');
  const envPassword = process.env.ADMIN_PASSWORD;

  if (envPassword && password !== envPassword) {
    return false;
  }
  return true;
}

// GET: Backup Seluruh Database
export async function GET(req: Request) {
  try {
    if (!verifyPassword(req)) {
      return NextResponse.json({ error: 'Akses ditolak: Password admin salah' }, { status: 401 });
    }

    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: 'Koneksi database gagal' }, { status: 500 });
    }

    const collections = await db.listCollections().toArray();
    const backupData: Record<string, any[]> = {};

    for (const collectionInfo of collections) {
      const colName = collectionInfo.name;
      // Melewati sistem internal system.indexes jika ada
      if (colName.startsWith('system.')) continue;

      const docs = await db.collection(colName).find({}).toArray();
      backupData[colName] = docs;
    }

    const payload = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      collections: backupData,
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="database-backup-${Date.now()}.json"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal membuat backup database' }, { status: 500 });
  }
}

// POST: Restore Seluruh Database dari File JSON
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password, data } = body;

    const envPassword = process.env.ADMIN_PASSWORD;
    if (envPassword && password !== envPassword) {
      return NextResponse.json({ error: 'Akses ditolak: Password admin salah' }, { status: 401 });
    }

    if (!data || !data.collections || typeof data.collections !== 'object') {
      return NextResponse.json({ error: 'Format file backup tidak valid!' }, { status: 400 });
    }

    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: 'Koneksi database gagal' }, { status: 500 });
    }

    const collectionsData = data.collections;

    for (const [colName, docs] of Object.entries(collectionsData)) {
      if (!Array.isArray(docs)) continue;

      const collection = db.collection(colName);
      
      // Kosongkan koleksi lama sebelum me-restore
      await collection.deleteMany({});

      // Masukkan dokumen jika data tidak kosong
      if (docs.length > 0) {
        await collection.insertMany(docs);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database berhasil dipulihkan total!',
      restoredCollections: Object.keys(collectionsData)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal me-restore database' }, { status: 500 });
  }
}
