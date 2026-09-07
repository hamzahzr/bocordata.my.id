import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import crypto from 'crypto';

function validSession() {
  const token = cookies().get('bocordata_session')?.value;
  if (!token || !process.env.SESSION_SECRET) return false;
  const expected = crypto.createHmac('sha256', process.env.SESSION_SECRET).update('authenticated').digest('hex');
  return token.length === expected.length && crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export default function Home() {
  if (!validSession()) redirect('/login');
  redirect('/dashboard');
}
