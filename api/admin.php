<?php
require __DIR__ . '/lib.php';
require_admin();
if($_SERVER['REQUEST_METHOD']==='GET'){
  $out=[]; foreach(users() as $u) $out[]=public_user($u);
  usort($out,fn($a,$b)=>strcmp($a['created_at'],$b['created_at']));
  json_response(['users'=>$out]);
}
if($_SERVER['REQUEST_METHOD']!=='POST') json_response(['error'=>'Method not allowed'],405);
$data=json_input(); $id=(string)($data['id']??''); $action=(string)($data['action']??'');
if(!in_array($action,['approve','reject'],true)||$id==='') json_response(['error'=>'Aksi admin tidak valid.'],400);
$all=users(); $found=false;
foreach($all as &$u){ if($u['id']===$id && $u['role']!=='admin'){ $u['status']=$action==='approve'?'approved':'rejected'; $found=true; break; }} unset($u);
if(!$found) json_response(['error'=>'Pengguna tidak ditemukan atau tidak dapat diubah.'],404);
save_users($all); json_response(['ok'=>true]);
