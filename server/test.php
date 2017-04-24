<?php
    header('Access-Control-Allow-Origin: *');
	echo json_encode(["test" => "ok", "action" => $_POST['action'], "params" => $_POST["test"]]);

?>