<?php
require __DIR__ . '/lib.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_response(['error'=>'Method not allowed'],405);
$data=json_input(); $email=strtolower(trim((string)($data['email']??''))); $password=(string)($data['password']??'');
if(!filter_var($email,FILTER_VALIDATE_EMAIL)||$password==='') json_response(['error'=>'Email dan password wajib diisi.'],400);
foreach(users() as $user){
    if(strtolower($user['email'])===$email && password_verify($password,$user['password'])){
        if($user['status']!=='approved') json_response(['error'=>$user['status']==='pending'?'Akun masih menunggu persetujuan admin.':'Akun tidak disetujui.'],403);
        session_regenerate_id(true); $_SESSION['user_id']=$user['id'];
        json_response(['ok'=>true,'user'=>public_user($user)]);
    }
}
json_response(['error'=>'Email atau password salah.'],401);
