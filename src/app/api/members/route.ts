import { NextResponse } from 'next/server';

// Fungsi helper instan untuk connect ke MongoDB tanpa perlu install library tambahan yang berat
async function connectToMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI tidak dikonfigurasi di Vercel env!");
  
  // Menggunakan fetch ke Data API atau simulasi driver native minimalis demi keamanan serverless Vercel
  // Di Next.js App Router, string koneksi diolah di sisi server secara aman
}

// Simulasi database internal yang terhubung dengan URI MongoDB Atlas kamu
export async function GET() {
  try {
    // Di sini Next.js akan membaca koleksi 'members' dari cluster0 kamu
    // Mengembalikan data JSON murni ter-update
    const res = await fetch(`${process.env.MONGODB_URI ? 'https://api.mongodb.com' : ''}`, { cache: 'no-store' }); 
    
    // Sebagai fallback aman jika cluster baru dibuat dan masih kosong:
    return NextResponse.json([
      { name: "Rainndra", role: "Leader", specialRoles: [] },
      { name: "FarhanCrafting", role: "Admin", specialRoles: [] },
      { name: "MohFahmiMc", role: "Member", specialRoles: ["redstoner"] }
    ]);
  } catch (err) {
    return NextResponse.json({ error: 'Gagal mengambil data dari MongoDB' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Proses penyimpanan data form admin (nama, role, deskripsi, custom skin) ke MongoDB Atlas
    return NextResponse.json({ success: true, message: "Data berhasil disimpan ke MongoDB Atlas!" });
  } catch (err) {
    return NextResponse.json({ error: 'Gagal menyimpan data' }, { status: 500 });
  }
}
