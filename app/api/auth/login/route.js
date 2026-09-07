import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req){
  try{
    const {email,password}=await req.json();
    if(!email||!password) return NextResponse.json({error:'Email dan password wajib diisi.'},{status:400});
    if(email!==process.env.ADMIN_EMAIL||password!==process.env.ADMIN_PASSWORD) return NextResponse.json({error:'Email atau password salah.'},{status:401});
    if(!process.env.SESSION_SECRET) return NextResponse.json({error:'SESSION_SECRET belum dikonfigurasi.'},{status:500});
    const token=crypto.createHmac('sha256',process.env.SESSION_SECRET).update('authenticated').digest('hex');
    const res=NextResponse.json({ok:true});
    res.cookies.set('bocordata_session',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*8});
    return res;
  }catch{return NextResponse.json({error:'Request tidak valid.'},{status:400});}
}
