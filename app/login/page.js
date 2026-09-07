'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login(){
 const router=useRouter(); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [loading,setLoading]=useState(false);
 async function submit(e){e.preventDefault();setError('');setLoading(true);try{const r=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});const d=await r.json();if(!r.ok){setError(d.error||'Login gagal');return;}router.replace('/dashboard');router.refresh();}catch{setError('Tidak dapat menghubungi server.')}finally{setLoading(false)}}
 return <main className="auth"><section className="auth-card"><div className="brand"><span className="logo">B</span><div><b>BocorData.my.id</b><small>Secure Data Intelligence</small></div></div><h1>Selamat datang</h1><p className="muted">Login untuk mengakses pemeriksaan data.</p><form onSubmit={submit}><label>Email</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@example.com"/><label>Password</label><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/><button disabled={loading}>{loading?'Memproses…':'Masuk ke Dashboard'}</button>{error&&<div className="error">{error}</div>}</form><p className="privacy">Akses hanya untuk pengguna terotorisasi.</p></section></main>
}
