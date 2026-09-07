import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

function auth(){const token=cookies().get('bocordata_session')?.value;const secret=process.env.SESSION_SECRET;if(!token||!secret)return false;const expected=crypto.createHmac('sha256',secret).update('authenticated').digest('hex');return token.length===expected.length&&crypto.timingSafeEqual(Buffer.from(token),Buffer.from(expected));}

export async function POST(req){
 if(!auth()) return NextResponse.json({error:'Unauthorized.'},{status:401});
 try{
  const body=await req.formData(); const query=body.get('query');
  if(!query?.trim()) return NextResponse.json({error:'Query wajib diisi.'},{status:400});
  if(!process.env.DATA_API_URL) return NextResponse.json({error:'DATA_API_URL belum dikonfigurasi.'},{status:500});
  const headers={'Content-Type':'application/json'}; if(process.env.DATA_API_KEY) headers.Authorization=`Bearer ${process.env.DATA_API_KEY}`;
  const upstream=await fetch(process.env.DATA_API_URL,{method:'POST',headers,body:JSON.stringify({query:query.trim()})});
  const text=await upstream.text(); let data; try{data=JSON.parse(text)}catch{data={raw:text}};
  return NextResponse.json({status:upstream.ok?(data.status||'unknown'):'error',data},{status:upstream.ok?200:502});
 }catch{return NextResponse.json({error:'Tidak dapat menghubungi API pemeriksaan.'},{status:502});}
}
