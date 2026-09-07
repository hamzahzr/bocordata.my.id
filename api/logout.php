<?php
require __DIR__ . '/lib.php';
$_SESSION=[];
if(ini_get('session.use_cookies')){ $p=session_get_cookie_params(); setcookie(session_name(),'',['expires'=>time()-42000,'path'=>$p['path'],'secure'=>$p['secure'],'httponly'=>$p['httponly'],'samesite'=>$p['samesite']??'Lax']); }
session_destroy(); json_response(['ok'=>true]);
