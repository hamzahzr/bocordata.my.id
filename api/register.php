<?php
require __DIR__ . '/lib.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_response(['error'=>'Method not allowed'],405);
$data=json_input(); $name=trim((string)($data['name']??'')); $email=strtolower(trim((string)($data['email']??''))); $password=(string)($data['password']??'');
if(mb_strlen($name)<2) json_response(['error'=>'Nama minimal 2 karakter.'],400);
if(!filter_var($email,FILTER_VALIDATE_EMAIL)) json_response(['error'=>'Format email tidak valid.'],400);
if(strlen($password)<8) json_response(['error'=>'Password minimal 8 karakter.'],400);
$all=users();
foreach($all as $u) if(strtolower($u['email'])===$email) json_response(['error'=>'Email sudah terdaftar.'],409);
$all[]=['id'=>bin2hex(random_bytes(8)),'name'=>$name,'email'=>$email,'password'=>password_hash($password,PASSWORD_DEFAULT),'role'=>'user','status'=>'pending','created_at'=>date('c')];
save_users($all);
json_response(['ok'=>true,'message'=>'Pendaftaran berhasil. Akun Anda menunggu persetujuan administrator.']);
