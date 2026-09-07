<?php
require __DIR__ . '/lib.php';
$user=current_user();
if(!$user || $user['status']!=='approved') json_response(['authenticated'=>false]);
json_response(['authenticated'=>true,'user'=>public_user($user)]);
