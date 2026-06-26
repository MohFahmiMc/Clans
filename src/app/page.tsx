import { redirect } from 'next/navigation';

export default function RootPage() {
  // Mengarahkan pengguna yang mengakses '/' langsung ke '/main'
  redirect('/freedom/main');
}
