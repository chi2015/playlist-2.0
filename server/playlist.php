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
    		case 'get': return isset($_POST['pl_date']) ? pl_get($_POST['pl_date']) : ['error' => 'No playlist date specified']; break;
    		case 'prev': return isset($_POST['pl_date']) ? pl_next($_POST['pl_date'], true) : ['error' => 'No playlist date specified']; break;
    		case 'next': return isset($_POST['pl_date']) ? pl_next($_POST['pl_date']) : ['error' => 'No playlist date specified']; break;
    		case 'top100': return isset($_POST['year']) ? pl_top100($_POST['year']) : ['error' => 'No year specified']; break;
    		case 'top10artists': return isset($_POST['year']) ? pl_top10artists($_POST['year']) : ['error' => 'No year specified']; break;
    		case 'delete': return isset($_POST['pl_date']) && isset($_POST['password']) ? pl_delete($_POST['pl_date'], $_POST['password']) :
    		['error' => 'No playlist date or password specified']; break;
    		default: return [];
    	}
    	return [];
  }
    
?>