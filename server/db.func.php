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
    
    function insert_playlist($songs_array, $pl_date)
{ 
	if (!preg_match('/^[0-9]{4}-[0-1]{1}[0-9]{1}-[0-3]{1}[0-9]{1}$/', $pl_date)) return [];

        global $host, $user, $pass, $dbname;

        $link = mysql_connect($host, $user, $pass)
        or die("Could not connect : " . mysql_error());
        mysql_select_db($dbname) or die("Could not select database");
	
	$query_check_exist = "SELECT COUNT(pl_date) FROM playlist WHERE pl_date='$pl_date'";
	$result_check_exist = mysql_query($query_check_exist);
	$count = mysql_fetch_row($result_check_exist);
	if ($count[0]>0)
	{
		echo "Error: Playlist dated $pl_date is already exists!";
		mysql_close($link);	
		return false;
	}

	$num_songs = count($songs_array);

	for ($i=0; $i<$num_songs; $i++)
	{	
		if (($songs_array[$i]["title"]=="") || ($songs_array[$i]["artist"]==""))
		{
			echo "Error: At least one of artists or songs is empty";
			mysql_close($link);	
			return false;
		}

		for ($j=0; $j<$i; $j++)
			if (($songs_array[$i]["title"]==$songs_array[$j]["title"]) && ($songs_array[$i]["artist"]==$songs_array[$j]["artist"]))
			{
				echo "Error: playlist contains 2 or more the same songs!";
				mysql_close($link);	
				return false;
			}
	}

	for ($i=0; $i<$num_songs; $i++)
	{
		$songs_array[$i]["title"] = htmlspecialchars($songs_array[$i]["title"], ENT_QUOTES);
		$songs_array[$i]["artist"] = htmlspecialchars($songs_array[$i]["artist"], ENT_QUOTES);


		$current_title = $songs_array[$i]["title"];
		$current_artist = $songs_array[$i]["artist"];

		$query_select_id = "SELECT id FROM songs WHERE title = '$current_title' AND artist = '$current_artist'";
			$result_select_id = mysql_query($query_select_id);
		if (!$result_select_id)
		{
			echo "Invalid query $query_select_id ".mysql_error()."</p>";
			mysql_close($link);	
			return false;
		}

		if (mysql_num_rows($result_select_id)==0)
		{
			$query_insert_new_song = "INSERT INTO songs (artist, title, date_appear) VALUES('$current_artist','$current_title', '$pl_date')";
			$result_insert_new_song = mysql_query($query_insert_new_song);
			if (!$result_insert_new_song)
			{
				echo "Invalid query $query_insert_new_song ".mysql_error()."</p>";
				mysql_close($link);	
				return false;
			}

			mysql_free_result($result_select_id);
			$result_select_id = mysql_query($query_select_id);
			if (!$result_select_id)
			{
				echo "Invalid query $query_select_id ".mysql_error()."</p>";
				mysql_close($link);	
				return false;
			}


		}

		$line = mysql_fetch_row($result_select_id);
		$song_id = $line[0];

		$current_is_new = $songs_array[$i]["is_new"];

		if ($current_is_new == 1)
		{
			$query_update_new_song = "UPDATE songs SET date_appear = '$pl_date' WHERE id = $song_id";
			$result_update_new_song = mysql_query($query_update_new_song);
			if (!$query_update_new_song)
			{
				echo "Invalid query $query_update_new_song ".mysql_error()."</p>";
				mysql_close($link);	
				return false;
			}
		}

		$current_score = $songs_array[$i]["score"];
		$query_insert_playlist = "INSERT INTO playlist (song_id, pl_date, score) VALUES ('$song_id','$pl_date','$current_score')";
		$result_insert_pl = mysql_query($query_insert_playlist);
		if (!$result_insert_pl)
		{
			echo "Insert query failed $query_insert_playlist: ".mysql_error();
			mysql_close($link);	
			return false;
		}
	}

	mysql_close($link);	
	return true;
}
?>
