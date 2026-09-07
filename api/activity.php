<?php
require __DIR__ . '/lib.php';
$user=require_login();
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_response(['error'=>'Method not allowed'],405);
json_response(['ok'=>true,'activities'=>user_activity($user['id'],50)]);
