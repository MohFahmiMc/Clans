import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error("MONGODB_URI belum dikonfigurasi.");
}

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & { _mongoClientPromise?: Promise<MongoClient> };
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

async function getDB() {
  const dbClient = await clientPromise;
  return dbClient.db('freedom_db');
}

// ==========================================
// 1. [READ] - AMBIL CONFIG ATAU DATA INBOX
// ==========================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdminMode = searchParams.get('admin') === 'true';
    const db = await getDB();

    // Perbaikan: Tambahkan tipe data `: any` agar fleksibel saat assignment objek baru
    let config: any = await db.collection('recruitment_config').findOne({});
    if (!config) {
      config = {
        status: "open",
        schedule: "Setiap Hari 24 Jam",
        note: "Pastikan Anda mengisi data ulasan formulir pendaftaran dengan jujur.",
        questions: [
          { id: "q1", label: "Gamertag / Nickname Minecraft", type: "text", placeholder: "Masukkan Nickname Bedrock/Java...", required: true },
          { id: "q2", label: "Umur Anda Saat Ini", type: "text", placeholder: "Contoh: 16 Tahun...", required: true },
          { id: "q3", label: "Alasan Ingin Bergabung dengan Freedom", type: "textarea", placeholder: "Tuliskan alasan rasional Anda...", required: true }
        ]
      };
      await db.collection('recruitment_config').insertOne(config);
    }

    if (isAdminMode) {
      const submissions = await db.collection('applications').find({}).sort({ createdAt: -1 }).toArray();
      return NextResponse.json({ config, submissions }, { status: 200 });
    }

    return NextResponse.json({ config }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ==========================================
// 2. [CREATE] - KIRIM JAWABAN PENDAFTARAN
// ==========================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, answers } = body;

    if (!name || !answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ success: false, error: 'Validasi Gagal: Parameter tidak lengkap.' }, { status: 400 });
    }

    const db = await getDB();
    const config = await db.collection('recruitment_config').findOne({});
    if (config && config.status === 'closed') {
      return NextResponse.json({ success: false, error: 'Akses Ditolak: Pendaftaran telah ditutup.' }, { status: 403 });
    }

    const newApplication = {
      name: name.trim(),
      answers,
      createdAt: new Date()
    };

    await db.collection('applications').insertOne(newApplication);
    return NextResponse.json({ success: true, message: 'Sukses! Berkas pendaftaran Anda telah resmi tersimpan ke database aliansi.' }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ==========================================
// 3. [UPDATE] - EDIT TATA LETAK SOAL FORM
// ==========================================
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { password, status, schedule, note, questions } = body;

    if (password !== process.env.PASSWORD) {
      return NextResponse.json({ success: false, error: 'Akses Ditolak: Password administrasi salah.' }, { status: 401 });
    }

    const db = await getDB();
    await db.collection('recruitment_config').updateOne(
      {},
      { $set: { status, schedule, note, questions, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: 'Berhasil! Tata letak konfigurasi soal formulir telah diperbarui.' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ==========================================
// 4. [DELETE] - HAPUS SUBMISSION INBOX
// ==========================================
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id, password } = body;

    if (password !== process.env.PASSWORD) {
      return NextResponse.json({ success: false, error: 'Akses Ditolak: Kredensial administrasi salah.' }, { status: 401 });
    }

    const db = await getDB();
    await db.collection('applications').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true, message: 'Dokumen pendaftaran pendaftar berhasil dihapus dari inbox.' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
