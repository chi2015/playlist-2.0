<?php
    include_once("config.php");
    
    function pl_get($pl_date) {
        
        if (!preg_match('/^[0-9]{4}-[0-1]{1}[0-9]{1}-[0-3]{1}[0-9]{1}$/', $pl_date)) return ['error' => 'Wrong playlist date format'];

        global $host, $user, $pass, $dbname;

        $link = mysql_connect($host, $user, $pass);
        if (!$link) return ["error" => "Could not connect : " . mysql_error()];
        
        $sel_db = mysql_select_db($dbname);
        if (!$sel_db) {
        	mysql_close($link);
        	return ["error" => "Could not select database"];
        }
        
        $query_pl_songs = "SELECT songs.id, songs.artist, songs.title, songs.date_appear, playlist.score
		FROM songs
		LEFT JOIN playlist ON songs.id = playlist.song_id
		WHERE playlist.pl_date = '$pl_date'
		ORDER BY playlist.score DESC , songs.artist ASC";

		$result_pl_songs = mysql_query($query_pl_songs);
		if (!$result_pl_songs) { 
			$mysql_err = mysql_error();
			mysql_close($link);
			return ["error" => "Select query failed " . $mysql_err];
		}
		
		$res = ["ok" => true, "date" => $pl_date, "list" => []];
		
		while ($line_pl_songs = mysql_fetch_assoc($result_pl_songs))
			array_push($res["list"], $line_pl_songs);
		mysql_close($link);	
		return $res;
    }
    
    function pl_last($current_date = "", $latest = true) {
       if ($current_date!=="" && !preg_match('/^[0-9]{4}-[0-1]{1}[0-9]{1}-[0-3]{1}[0-9]{1}$/', $current_date)) 
       	return ['error' => 'Wrong playlist date format'];
       
       global $host, $user, $pass, $dbname;

        $link = mysql_connect($host, $user, $pass);
        if (!$link) return ["error" => "Could not connect : " . mysql_error()];
        
        $sel_db = mysql_select_db($dbname);
        if (!$sel_db) {
        	mysql_close($link);
        	return ["error" => "Could not select database"];
        }
        
    
    $query_select_date = $latest ? "SELECT MAX(pl_date)
									FROM playlist" :
								   "SELECT DISTINCT pl_date
									FROM playlist
									WHERE pl_date <= ".($current_date ? "'$current_date'" : "NOW()")." ORDER BY pl_date DESC LIMIT 1";

	$result_select_date = mysql_query($query_select_date);
	if (!$result_select_date)
	{
		$mysql_err = mysql_error();
		return ["error" => "Select query failed: ".$mysql_err];
	}
	
	if (mysql_num_rows($result_select_date)==0)
	{
		mysql_close($link);
		return ["error" => "Playlist dated $current date does not exist"];
	}

	$last_date = mysql_fetch_row($result_select_date);
	mysql_close($link);
	return pl_get($last_date[0]);
    
    }
    
    function pl_next($pl_date, $is_prev = false) {
       if (!preg_match('/^[0-9]{4}-[0-1]{1}[0-9]{1}-[0-3]{1}[0-9]{1}$/', $pl_date)) return ['error' => 'Wrong playlist date format'];
       
       global $host, $user, $pass, $dbname;

        $link = mysql_connect($host, $user, $pass);
        if (!$link) return ["error" => "Could not connect : " . mysql_error()];
        
        $sel_db = mysql_select_db($dbname);
        if (!$sel_db) {
        	mysql_close($link);
        	return ["error" => "Could not select database"];
        }
        
    $less_or_more = $is_prev ? "<" : ">";
    $sort_order = $is_prev ? "DESC" : "ASC";
    
    $query_select_date =  
								   "SELECT DISTINCT pl_date
									FROM playlist
									WHERE pl_date $less_or_more '$pl_date' ORDER BY pl_date $sort_order LIMIT 1";

	$result_select_date = mysql_query($query_select_date);
	if (!$result_select_date)
	{
		$mysql_err = mysql_error();
		return ["error" => "Select query failed: ".$mysql_err];
	}
	
	if (mysql_num_rows($result_select_date)==0)
	{
		return ["error" => "This is the ".($is_prev ? "oldest" : "latest")." playlist"];
	}

	$last_date = mysql_fetch_row($result_select_date);
	mysql_close($link);
	return pl_get($last_date[0]);
    }
    
    function insert_playlist($songs_array, $pl_date)
{ 
	if (!preg_match('/^[0-9]{4}-[0-1]{1}[0-9]{1}-[0-3]{1}[0-9]{1}$/', $pl_date)) return ['error' => 'Wrong playlist date format'];

        global $host, $user, $pass, $dbname;

         $link = mysql_connect($host, $user, $pass);
        if (!$link) return ["error" => "Could not connect : " . mysql_error()];
        
        $sel_db = mysql_select_db($dbname);
        if (!$sel_db) {
        	mysql_close($link);
        	return ["error" => "Could not select database"];
        }
        
	
	$query_check_exist = "SELECT COUNT(pl_date) FROM playlist WHERE pl_date='$pl_date'";
	$result_check_exist = mysql_query($query_check_exist);
	$count = mysql_fetch_row($result_check_exist);
	if ($count[0]>0)
	{
		mysql_close($link);	
		return ["error" => "Playlist dated $pl_date is already exists!"];
	}

	$num_songs = count($songs_array);

	for ($i=0; $i<$num_songs; $i++)
	{	
		if (($songs_array[$i]["title"]=="") || ($songs_array[$i]["artist"]==""))
		{
			mysql_close($link);	
			return ["error" => "Error: At least one of artists or songs is empty: ".$songs_array[$i]["artist"]." - ".$songs_array[$i]["title"]];
		}

		for ($j=0; $j<$i; $j++)
			if (($songs_array[$i]["title"]==$songs_array[$j]["title"]) && ($songs_array[$i]["artist"]==$songs_array[$j]["artist"]))
			{
				mysql_close($link);	
				return ["error" => "playlist contains 2 or more the same songs: ".$songs_array[$i]["artist"]." - ".$songs_array[$i]["title"]];
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
			$mysql_err = mysql_error();
			mysql_close($link);	
			return ["error" => "Invalid query $query_select_id: ".$mysql_err];
		}

		if (mysql_num_rows($result_select_id)==0)
		{
			$query_insert_new_song = "INSERT INTO songs (artist, title, date_appear) VALUES('$current_artist','$current_title', '$pl_date')";
			$result_insert_new_song = mysql_query($query_insert_new_song);
			if (!$result_insert_new_song)
			{
				$mysql_err = mysql_error();
				mysql_close($link);	
				return ["error" => "Invalid query $query_insert_new_song ".$mysql_err];
			}

			mysql_free_result($result_select_id);
			$result_select_id = mysql_query($query_select_id);
			if (!$result_select_id)
			{
				$mysql_err = mysql_error();
				mysql_close($link);	
				return ["error" => "Invalid query $query_select_id ".$mysql_err];
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
				$mysql_err = mysql_error();
				mysql_close($link);	
				return ["error" => "Invalid query $query_update_new_song ".$mysql_err];
			}
		}

		$current_score = $songs_array[$i]["score"];
		$query_insert_playlist = "INSERT INTO playlist (song_id, pl_date, score) VALUES ('$song_id','$pl_date','$current_score')";
		$result_insert_pl = mysql_query($query_insert_playlist);
		if (!$result_insert_pl)
		{
			$mysql_err = mysql_error();
			mysql_close($link);	
			return ["error" => "Insert query failed $query_insert_playlist: ".$mysql_err];
		}
	}

	mysql_close($link);	
	return ["ok" => true];
}

function pl_top100($year) {
	global $host, $user, $pass, $dbname;

        $link = mysql_connect($host, $user, $pass);
        if (!$link) return ["error" => "Could not connect : " . mysql_error()];
        
        $sel_db = mysql_select_db($dbname);
        if (!$sel_db) {
        	mysql_close($link);
        	return ["error" => "Could not select database"];
        }
        
	
	$year = intval($year);
	$query_select_100 = "SELECT songs.artist AS artist, songs.title AS title, SUM( playlist.score ) + (
SELECT bonus
FROM bonuses
WHERE max_date < date_add( MAX( playlist.pl_date ) , INTERVAL 6
DAY )
ORDER BY max_date DESC
LIMIT 1 ) AS total,
MAX(playlist.score) AS max_score
FROM songs
INNER JOIN playlist ON playlist.song_id = songs.id
WHERE playlist.pl_date
BETWEEN '$year-01-01'
AND '$year-12-31'
GROUP BY songs.id
ORDER BY total DESC , artist ASC
LIMIT 100";
	$res_sel_100 = mysql_query($query_select_100);
	if (!$res_sel_100)
	{
			$mysql_err = mysql_error();
			mysql_close($link);
			return ["error" => "Select query failed: ".$mysql_err];
	}
	
	if (mysql_num_rows($res_sel_100)==0)
	{
		mysql_close($link);
		return ["error" => "No data for top 100 that year"];
	}
	
	$line_dates;

	$top100_arr = array();
	
	while ($line_100 = mysql_fetch_assoc($res_sel_100))
	{
		$top100_arr[] = array('artist' => $line_100["artist"], 
							  'title' => $line_100["title"],
		                      'total' => $line_100["total"],
		                      'max_score' => $line_100["max_score"]);
	}
	mysql_close($link);
	return array('ok' => true, 'year' => $year, 'list' => $top100_arr);
}

function pl_top10artists($year) {
    
    global $host, $user, $pass, $dbname;

         $link = mysql_connect($host, $user, $pass);
        if (!$link) return ["error" => "Could not connect : " . mysql_error()];
        
        $sel_db = mysql_select_db($dbname);
        if (!$sel_db) {
        	mysql_close($link);
        	return ["error" => "Could not select database"];
        }
        
	
	$year = intval($year);
    
    $query_select_10 = "SELECT artist, SUM(total) AS artist_total, COUNT(title) AS songs FROM (SELECT songs.artist AS artist, songs.title AS title, SUM( playlist.score ) + (
SELECT bonus
FROM bonuses
WHERE max_date < date_add( MAX( playlist.pl_date ) , INTERVAL 6
DAY )
ORDER BY max_date DESC
LIMIT 1 ) AS total
FROM songs
INNER JOIN playlist ON playlist.song_id = songs.id
WHERE playlist.pl_date
BETWEEN '$year-01-01'
AND '$year-12-31'
GROUP BY songs.id
ORDER BY total DESC , artist ASC
) top100 GROUP BY top100.artist ORDER BY artist_total DESC LIMIT 10
";
	$res_sel_10 = mysql_query($query_select_10);
	if (!$res_sel_10)
	{
			$mysql_err = mysql_error();
			mysql_close($link);
			return ["error" => "Select query failed: ".$mysql_err];
	}
	
	if (mysql_num_rows($res_sel_10)==0)
	{
		mysql_close($link);
		return ["error" => "No data for top 10 that year"];
	}

	$top10_arr = [];
		while ($line_10 = mysql_fetch_assoc($res_sel_10))
			$top10_arr[] = $line_10;
	mysql_close($link);
    return array('ok' => true, 'year' => $year, 'list' => $top10_arr);

}

function pl_delete($pl_date, $password) {
	global $delete_pass;
	if ($delete_pass!==$password) return ['error' => 'Wrong password'];
	if (!preg_match('/^[0-9]{4}-[0-1]{1}[0-9]{1}-[0-3]{1}[0-9]{1}$/', $pl_date)) return ['error' => 'Wrong playlist date format'];

	  global $host, $user, $pass, $dbname;
	 
	 $link = mysql_connect($host, $user, $pass);
        if (!$link) return ["error" => "Could not connect : " . mysql_error()];
        
        $sel_db = mysql_select_db($dbname);
        if (!$sel_db) {
        	mysql_close($link);
        	return ["error" => "Could not select database"];
        }
        
	$query_delete = "DELETE FROM playlist WHERE pl_date='$pl_date'";
	$result_delete = mysql_query($query_delete);
	if (!$result_delete)
	{
		$mysql_err = mysql_error();
		mysql_close($link);
		return ["error" => "Delete query failed: ".$mysql_err];
	}

	$query_delete_song = "DELETE FROM songs WHERE id NOT IN (SELECT DISTINCT song_id FROM playlist)";

	$result_delete_song = mysql_query($query_delete_song);
	if (!$result_delete_song)
	{
		$mysql_err = mysql_error();
		mysql_close($link);
		return ["error" => "Delete song failed: ".$mysql_err];
	}
			
	return ['ok' => true];
}
?>
