<?php

function loadPlaylistFromFile($filename)
{

      $handle = fopen($filename, "r");
		if (!$handle)
		{
			echo("Error opening file $dataFile");
           return array();
		}

		$file_string = fgets($handle);

		if (substr_count($file_string,"Playlist")<=0)
		{
			echo("Error file format");
             return array();
		}

		$alist = array();
		$blist = array();
		$clist = array();
		$pl_date = "";

		while (!feof($handle))
		{


           $file_string = fgets($handle);

		   if (substr_count($file_string,"Updated")>0)
		   {		   		$pl_date = getPlaylistDate($file_string);
		   }

           if (substr_count($file_string,"A-List")>0)
           {           	$alist = getPlaylistBlock($handle, 9);

           }

           if (substr_count($file_string,"B-List")>0)
           {
           	$blist = getPlaylistBlock($handle, 10);
           }

            if (substr_count($file_string,"C-List")>0)
           {
           	$clist = getPlaylistBlock($handle, 6);
           }
		}

		$res_playlist = array(
		     "pl_date" => $pl_date,
		      "alist_artist" => $alist["artist"],
		      "blist_artist" => $blist["artist"],
		      "clist_artist" => $clist["artist"],
		      "alist_title" => $alist["title"],
		      "blist_title" => $blist["title"],
		      "clist_title" => $clist["title"],
              "alist_is_new" => $alist["is_new"],
               "blist_is_new" => $blist["is_new"],
                "clist_is_new" => $clist["is_new"],

		);

		return $res_playlist;
}

function getPlaylistBlock(&$handle, $block_size)
{	   $file_string = fgets($handle);

		for ($i=0; $i<$block_size; $i++)
		{
			$file_string = trim(fgets($handle));
			$is_new[$i] = 0;

			if (substr($file_string, 0, 1) == "*")
			{				$file_string = str_replace("*","",$file_string);
				$is_new[$i] = 1;
			}

			$file_string = preg_replace("/(.+)(feat\.\s.+)(\s-\s.+)/","\\1\\3 (\\2)",$file_string);
			$artist_title = explode(" - ",$file_string);
			$artist[$i] = $artist_title[0];
			$title[$i] = $artist_title[1];
			if (substr_count($title[$i],"/")>0 )
			{
				$titles = explode("/",$clist_title[$i]);
				for ($j=0; $j<count($titles); $j++)
				{
					$artist[$i+$j] = $artist_title[0];
					$title[$i+$j] = $titles[$j];

				}
				$i+=count($titles)-1;
			}
		}

		$file_string = fgets($handle);

		return array("artist" => $artist,
					"title" => $title,
					"is_new" => $is_new );
}

function preparePlaylistToInsert($playlist_arr)
{	global $alist_score, $blist_score, $clist_score;

	$alist_artist = $playlist_arr["alist_artist"];
	$alist_title = $playlist_arr["alist_title"];
	$alist_is_new = $playlist_arr["alist_is_new"];
	$blist_artist = $playlist_arr["blist_artist"];
	$blist_title = $playlist_arr["blist_title"];
	$blist_is_new = $playlist_arr["blist_is_new"];
	$clist_artist = $playlist_arr["clist_artist"];
	$clist_title = $playlist_arr["clist_title"];
	$clist_is_new = $playlist_arr["clist_is_new"];

	  for ($i=0; $i<9; $i++)
		{
			$songs_array[$i]["artist"] = trim($alist_artist[$i]);
			$songs_array[$i]["title"] = trim($alist_title[$i]);
			$songs_array[$i]["score"] = $alist_score;
			$songs_array[$i]["is_new"] = $alist_is_new[$i];
		}

		for ($i=0; $i<10; $i++)
		{
			$songs_array[$i+9]["artist"] = trim($blist_artist[$i]);
			$songs_array[$i+9]["title"] = trim($blist_title[$i]);
			$songs_array[$i+9]["score"] = $blist_score;
			$songs_array[$i+9]["is_new"] = $blist_is_new[$i];
		}

		for ($i=0; $i<6; $i++)
		{
			$songs_array[$i+19]["artist"] = trim($clist_artist[$i]);
			$songs_array[$i+19]["title"] = trim($clist_title[$i]);
			$songs_array[$i+19]["score"] = $clist_score;
			$songs_array[$i+19]["is_new"] = $clist_is_new[$i];
		}

		return $songs_array;
}


function getPlaylistDate($str)
{        $date_str = substr(trim($str), 8);
         $date_els = explode(" ",$date_str);
         $day = intval($date_els[0]);
         $months = getMonthStrs();
         $month = isset($months[$date_els[1]]) ?  $months[$date_els[1]] : "01";
         $year = $date_els[2];
         return $year."-".$month."-".($day < 10 ? "0" : "").$day;
}

function getMonthStrs()
{	return array(
	"January" => "01",
	"February" => "02",
	"March" => "03",
	"April" => "04",
	"May" => "05",
	"June" => "06",
	"July" => "07",
	"August" => "08",
	"September" => "09",
	"October" => "10",
	"November" => "11",
	"December" => "12",

	);
}

?>
