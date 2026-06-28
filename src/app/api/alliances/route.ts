import { NextResponse } from 'next/server';
// Sesuai arsitektur proyek, gunakan client MongoDB bawaan Anda atau dbConnect global Anda jika ada.
// Sebagai standar Next.js global, berikut skema parsing teraman untuk database Anda:

import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI || "";
const client = new MongoClient(uri);

async function getCollection() {
  await client.connect();
  const db = client.db('freedom_clan'); // Sesuaikan nama database Anda
  return db.collection('alliances');
}

// 1. Ambil Data Aliansi Secara Publik
export async function GET() {
  try {
    const collection = await getCollection();
    const alliances = await collection.find({}).sort({ order: 1 }).toArray();
    return NextResponse.json(alliances, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Gagal memuat database aliansi.' }, { status: 500 });
  }
}

// 2. Tambah Aliansi Baru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password, name, owner, network, createdDate, philosophy, slogan, logoUrl, order } = body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Akses Ditolak!' }, { status: 401 });
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
  } catch (err) {
    return NextResponse.json({ error: 'Gagal memproses penambahan.' }, { status: 500 });
  }
}

// 3. Edit Data Aliansi atau Urutan Posisi
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, password, name, owner, network, createdDate, philosophy, slogan, logoUrl, order } = body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Akses Ditolak!' }, { status: 401 });
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
  } catch (err) {
    return NextResponse.json({ error: 'Gagal memperbarui data aliansi.' }, { status: 500 });
  }
}

// 4. Hapus Aliansi
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id, password } = body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Akses Ditolak!' }, { status: 401 });
    }

    const collection = await getCollection();
    await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Gagal menghapus aliansi.' }, { status: 500 });
  }
}
