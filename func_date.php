<?php
function getPlaylistDate($str)
{         $date_str = substr(trim($str), 8);
         $date_els = explode(" ",$date_str);
         $day = intval($date_els[0]);
         $months = getMonthStrs();
         $month = isset($months[$date_els[1]]) ?  $months[$date_els[1]] : "01";
         $year = $date_els[2];
         return $year."-".$month."-".($day < 10 ? "0" : "").$day;
}

function getMonthStrs()
{	return array(
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

	);}

function formatDate($date)
{
	list($year, $month, $day) = explode('-', $date);
	$month_strs = getMonthStrs();
	$month_str = '';
	
	foreach ($month_strs as $key => $value)
		if ($value == $month) $month_str = $key;
	$day_str = 'th';
	
	switch ($day)
	{
		case '01':
		case '21':
		case '31': $day_str = 'st'; break;
		case '02':
		case '22': $day_str = 'nd'; break;
		case '03':
		case '23': $day_str = 'rd'; break;
		default: $day_str = 'th';
	}
	
	$date_str = intval($day).$day_str.' '.$month_str.' '.$year;
	return $date_str;
}

?>
