<?php
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Headers: Content-Type');

  include_once("db.func.php");
  include_once("func_read_playlist.php");
  
  $postData = file_get_contents('php://input');
  $data = json_decode($postData, true);

  if (strlen($data['data']) > 5120) {
    echo json_encode(["status" => "error", "error" => "Playlist file size cannot be more than 5KB"]);
    die();
  }
  
  $loaded_playlist = loadPlaylistFromData($data['data']);
    
  if (isset($loaded_playlist["error"])) {
  	echo json_encode(["status" => "error", "error" => $loaded_playlist["error"]]);
  	die();
  }
  
  $prepared_playlist = preparePlaylistToInsert($loaded_playlist);
  $pl_date = $loaded_playlist["pl_date"];
  
  $ins_res = insert_playlist($prepared_playlist, $pl_date);
  
  if ($ins_res["ok"]) echo json_encode(["status" => "ok", "pl_date" => $pl_date]);
  else if ($ins_res["error"]) echo json_encode(["status" => "error", "error" => $ins_res["error"]]);
  else echo json_encode(["status" => "error", "error" => "Error uploading playlist"]);
    
?>