import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import crypto from 'crypto';

function auth(){const token=cookies().get('bocordata_session')?.value;const secret=process.env.SESSION_SECRET;if(!token||!secret)return false;const expected=crypto.createHmac('sha256',secret).update('authenticated').digest('hex');return token.length===expected.length&&crypto.timingSafeEqual(Buffer.from(token),Buffer.from(expected));}

export default function Dashboard(){if(!auth())redirect('/login');return <main className="shell"><nav className="nav"><a href="/dashboard"><b>● BocorData.my.id</b></a><form action="/api/auth/logout" method="post"><button type="submit">Logout</button></form></nav><section className="panel hero"><h1>Data Exposure Checker</h1><p>Periksa apakah identifier yang Anda masukkan terdeteksi dalam sumber kebocoran yang Anda otorisasi.</p><form className="check" action="/api/check" method="post"><input name="query" placeholder="Masukkan email, nomor, username, atau identifier" required/><button type="submit">🔎 Cek Data</button></form><div className="result"><b>Siap melakukan pemeriksaan</b><p className="muted">Endpoint API dapat dikonfigurasi melalui environment variable dan API key tetap berada di server.</p></div></section></main>}
