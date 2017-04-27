<?php
  header('Access-Control-Allow-Origin: *');
  include_once("db.func.php");
  include_once("func_read_playlist.php");
  
  if (!is_dir("uploads")) mkdir("uploads");
  
  $data = $_POST['data'];
  $fileName = $_POST['name'];
  $dataFile = 'uploads/'.$fileName;
  
  $fp = fopen($dataFile,'w');
  fwrite($fp, $data);
  fclose($fp);
  
  $loaded_playlist = loadPlaylistFromFile($dataFile);
  $prepared_playlist = preparePlaylistToInsert($loaded_playlist);
  $pl_date = $loaded_playlist["pl_date"];
  
  unlink($dataFile);
  
  $ins_res = insert_playlist($prepared_playlist, $pl_date);
  
  if ($ins_res) echo json_encode(["status" => "ok", "pl_date" => $pl_date]);
    
?>