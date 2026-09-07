<?php
require __DIR__ . '/lib.php';
require_login();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_response(['error'=>'Method not allowed'],405);
$configFile=__DIR__.'/config.php';
if(!file_exists($configFile)) json_response(['error'=>'API belum dikonfigurasi di server.'],500);
$config=require $configFile;
$token=trim((string)($config['token']??''));
if($token===''||$token==='ISI_TOKEN_API_DI_SINI') json_response(['error'=>'Token API belum diisi di server.'],500);
$body=json_input(); $query=trim((string)($body['query']??''));
if($query==='') json_response(['error'=>'Query wajib diisi.'],400);
$payload=['token'=>$token,'request'=>$query,'limit'=>100,'lang'=>'en'];
$ch=curl_init('https://leakosintapi.com/');
curl_setopt_array($ch,[CURLOPT_POST=>true,CURLOPT_POSTFIELDS=>json_encode($payload),CURLOPT_HTTPHEADER=>['Content-Type: application/json'],CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>60]);
$response=curl_exec($ch); $curlError=curl_error($ch); $httpCode=(int)curl_getinfo($ch,CURLINFO_HTTP_CODE); curl_close($ch);
if($response===false) json_response(['error'=>'Gagal menghubungi API','detail'=>$curlError],502);
$data=json_decode($response,true);
if($data===null&&json_last_error()!==JSON_ERROR_NONE) json_response(['error'=>'API mengembalikan respons yang bukan JSON.'],502);
json_response(['status'=>'success','data'=>$data],$httpCode>=200&&$httpCode<300?200:($httpCode?:502));
