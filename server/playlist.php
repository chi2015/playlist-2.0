<?php
  header('Access-Control-Allow-Origin: *');
  include_once("db.func.php");
  $response = getResponse();
  echo json_encode($response);
    
  function getResponse() {
    	if (!isset($_POST['action'])) return [];
    	switch ($_POST['action']) {
    		case 'current': return isset($_POST['current_date']) ? pl_last($_POST['current_date'], false) : pl_last("", false); break;
    		case 'latest': return pl_last(); break;
    		case 'get': return isset($_POST['pl_date']) ? pl_get($_POST['pl_date']) : []; break;
    		case 'prev': return isset($_POST['pl_date']) ? pl_next($_POST['pl_date'], true) : []; break;
    		case 'next': return isset($_POST['pl_date']) ? pl_next($_POST['pl_date']) : []; break;
    		default: return [];
    	}
    	return [];
  }
    
?>