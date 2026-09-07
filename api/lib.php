<?php

declare(strict_types=1);

session_name('bocordata_session');
session_set_cookie_params(['lifetime'=>0,'path'=>'/','secure'=>!empty($_SERVER['HTTPS'])&&$_SERVER['HTTPS']!=='off','httponly'=>true,'samesite'=>'Lax']);
session_start();

const DEFAULT_ADMIN_EMAIL='admin@example.com';
const DEFAULT_ADMIN_PASSWORD='admin123';
function storage_dir():string{return dirname(__DIR__).'/storage';}
function users_file():string{return storage_dir().'/users.json';}
function activity_file():string{return storage_dir().'/activity.json';}
function ensure_storage():void{
 $dir=storage_dir(); if(!is_dir($dir)) @mkdir($dir,0750,true);
 $deny=$dir.'/.htaccess'; if(!file_exists($deny)) @file_put_contents($deny,"Require all denied\nOptions -Indexes\n");
 $file=users_file(); if(!file_exists($file)){
  $admin=[['id'=>bin2hex(random_bytes(8)),'name'=>'Administrator','email'=>DEFAULT_ADMIN_EMAIL,'password'=>password_hash(DEFAULT_ADMIN_PASSWORD,PASSWORD_DEFAULT),'role'=>'admin','status'=>'approved','created_at'=>date('c')]];
  @file_put_contents($file,json_encode($admin,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE),LOCK_EX); @chmod($file,0600);
 }
 $activity=activity_file(); if(!file_exists($activity)){@file_put_contents($activity,'[]',LOCK_EX);@chmod($activity,0600);}
}
function users():array{ensure_storage();$data=json_decode((string)@file_get_contents(users_file()),true);return is_array($data)?$data:[];}
function save_users(array $users):void{ensure_storage();@file_put_contents(users_file(),json_encode(array_values($users),JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE),LOCK_EX);@chmod(users_file(),0600);}
function json_input():array{$data=json_decode((string)file_get_contents('php://input'),true);return is_array($data)?$data:[];}
function json_response(array $data,int $status=200):never{http_response_code($status);header('Content-Type: application/json; charset=utf-8');header('Cache-Control: no-store');echo json_encode($data,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);exit;}
function current_user():?array{if(empty($_SESSION['user_id']))return null;foreach(users() as $user)if(($user['id']??'')===$_SESSION['user_id'])return $user;return null;}
function require_login():array{$user=current_user();if(!$user||($user['status']??'')!=='approved')json_response(['error'=>'Silakan login dengan akun yang telah disetujui.'],401);return $user;}
function require_admin():array{$user=require_login();if(($user['role']??'')!=='admin')json_response(['error'=>'Akses admin diperlukan.'],403);return $user;}
function public_user(array $u):array{return ['id'=>$u['id'],'name'=>$u['name'],'email'=>$u['email'],'role'=>$u['role'],'status'=>$u['status'],'created_at'=>$u['created_at']];}
function log_activity(string $action,?array $user=null,?string $detail=null):void{
 ensure_storage(); $items=json_decode((string)@file_get_contents(activity_file()),true); if(!is_array($items))$items=[];
 $items[]=['id'=>bin2hex(random_bytes(8)),'user_id'=>$user['id']??null,'username'=>$user['name']??'Guest','action'=>$action,'detail'=>$detail,'ip'=>$_SERVER['REMOTE_ADDR']??'unknown','created_at'=>date('c')];
 if(count($items)>1000)$items=array_slice($items,-1000);
 @file_put_contents(activity_file(),json_encode($items,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES),LOCK_EX);@chmod(activity_file(),0600);
}
function user_activity(string $userId,int $limit=50):array{
 ensure_storage();$items=json_decode((string)@file_get_contents(activity_file()),true);if(!is_array($items))return [];
 $items=array_values(array_filter($items,fn($x)=>($x['user_id']??'')===$userId));return array_slice(array_reverse($items),0,max(1,min(100,$limit)));
}
