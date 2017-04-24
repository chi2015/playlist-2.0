<?php
    include_once("config.php");
    
    function pl_get($pl_date) {
        
        if (!preg_match('/^[0-9]{4}-[0-1]{1}[0-9]{1}-[0-3]{1}[0-9]{1}$/', $pl_date)) return [];

        global $host, $user, $pass, $dbname;

        $link = mysql_connect($host, $user, $pass)
        or die("Could not connect : " . mysql_error());
        mysql_select_db($dbname) or die("Could not select database");
        
        $query_pl_songs = "SELECT songs.id, songs.artist, songs.title, songs.date_appear, playlist.score
		FROM songs
		LEFT JOIN playlist ON songs.id = playlist.song_id
		WHERE playlist.pl_date = '$pl_date'
		ORDER BY playlist.score DESC , songs.artist ASC";

		$result_pl_songs = mysql_query($query_pl_songs) or
		die ("Select pl_songs query failed ".mysql_error);
		
		$res = ["date" => $pl_date, "list" => []];
		
		while ($line_pl_songs = mysql_fetch_assoc($result_pl_songs))
			array_push($res["list"], $line_pl_songs);
		mysql_close($link);	
		return $res;
    }
    
    function pl_last($current_date = "", $latest = true) {
       global $host, $user, $pass, $dbname;

        $link = mysql_connect($host, $user, $pass)
        or die("Could not connect : " . mysql_error());
        mysql_select_db($dbname) or die("Could not select database");
    
    $query_select_date = $latest ? "SELECT MAX(pl_date)
									FROM playlist" :
								   "SELECT DISTINCT pl_date
									FROM playlist
									WHERE pl_date <= ".($current_date ? "'$current_date'" : "NOW()")." ORDER BY pl_date DESC LIMIT 1";

	$result_select_date = mysql_query($query_select_date);
	if (!$result_select_date)
	{
		echo "Select query failed: ".mysql_error();
		return false;
	}
	
	if (mysql_num_rows($result_select_date)==0)
	{
		return [];
	}

	$last_date = mysql_fetch_row($result_select_date);
	mysql_close($link);
	return pl_get($last_date[0]);
    
    }
    
    function pl_next($pl_date, $is_prev = false) {
       if (!preg_match('/^[0-9]{4}-[0-1]{1}[0-9]{1}-[0-3]{1}[0-9]{1}$/', $pl_date)) return [];
       
       global $host, $user, $pass, $dbname;

        $link = mysql_connect($host, $user, $pass)
        or die("Could not connect : " . mysql_error());
        mysql_select_db($dbname) or die("Could not select database");
        
    $less_or_more = $is_prev ? "<" : ">";
    $sort_order = $is_prev ? "DESC" : "ASC";
    
    $query_select_date =  
								   "SELECT DISTINCT pl_date
									FROM playlist
									WHERE pl_date $less_or_more '$pl_date' ORDER BY pl_date $sort_order LIMIT 1";

	$result_select_date = mysql_query($query_select_date);
	if (!$result_select_date)
	{
		echo "Select query failed: ".mysql_error();
		return false;
	}
	
	if (mysql_num_rows($result_select_date)==0)
	{
		return [];
	}

	$last_date = mysql_fetch_row($result_select_date);
	mysql_close($link);
	return pl_get($last_date[0]);
    }
?>
