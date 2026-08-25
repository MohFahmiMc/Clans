import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || '';

function verifyPassword(req: Request) {
  const url = new URL(req.url);
  const password = url.searchParams.get('password') || req.headers.get('x-admin-password');
  const envPassword = process.env.ADMIN_PASSWORD;

  if (envPassword && password !== envPassword) {
    return false;
  }
  return true;
}

export async function GET(req: Request) {
  try {
    if (!verifyPassword(req)) {
      return NextResponse.json({ error: 'Akses ditolak: Password admin salah' }, { status: 401 });
    }

    if (!uri) {
      return NextResponse.json({ error: 'MONGODB_URI tidak ditemukan' }, { status: 500 });
    }

    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db();

    const collections = await db.listCollections().toArray();
    const backupData: Record<string, any[]> = {};

    for (const collectionInfo of collections) {
      const colName = collectionInfo.name;
      if (colName.startsWith('system.')) continue;

      const docs = await db.collection(colName).find({}).toArray();
      backupData[colName] = docs;
    }

    await client.close();

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

    if (!uri) {
      return NextResponse.json({ error: 'MONGODB_URI tidak ditemukan' }, { status: 500 });
    }

    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db();

    const collectionsData = data.collections;

    for (const [colName, docs] of Object.entries(collectionsData)) {
      if (!Array.isArray(docs)) continue;

      const collection = db.collection(colName);
      await collection.deleteMany({});

      if (docs.length > 0) {
        await collection.insertMany(docs);
      }
    }

    await client.close();

    return NextResponse.json({ 
      success: true, 
      message: 'Database berhasil dipulihkan total!',
      restoredCollections: Object.keys(collectionsData)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal me-restore database' }, { status: 500 });
  }
}
