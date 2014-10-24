<?php
/*
 * DonimoD
 *
 * Copyright © 2014 Donatas Klimašauskas
 *
 * This file is part of DonimoD.
 *
 * DonimoD is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * DonimoD is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with DonimoD.  If not, see <https://www.gnu.org/licenses/>.
 */

ini_set("display_errors", "0");
ini_set("log_errors", "1");
//DEV//
ini_set("display_errors", "1");
ini_set("log_errors", "0");
ini_set("error_reporting", E_ALL | E_STRICT); // report all errors
//DEV//
ini_set("expose_php", "0");
mb_internal_encoding("UTF-8");

define("DB_HOST", "<YOURS>");
define("DB_USER", "<YOURS>");
define("DB_PASS", "<YOURS>");
define("DB_NAME", "<YOURS>");
define("GAMES_LIMIT", 2499);
define("ABUSERS_MAX", 100000);
define("DELAY_PULL_MIN", 5);
define("DELAY_PULL_MAX", 30);
define("STATE_EXIST_END", 0);
define("STATE_PLAYERA_PULL", 1);
define("STATE_PLAYERAB_TOOK_PULL", 2);
define("STATE_PLAYERAB_PUT_MOVE", 3);
define("PLAYERS_TILES_SUM", 14);
define("PLAYER_CNT", 2);
define("PROBLEM_TOO_MANY", 0);
define("PROBLEM_EXIST", 1);
define("PROBLEM_ABUSE", 2);
define("PROBLEM_DB_OPPONENT", 3);
define("DO_NOT_SEND", 0);
define("TILE_ENDS", 2);
define("TILE_TOTAL_CNT", 28);
define("TILE_MAX_IND", 27);
define("TILE_PIPS", 7);
define("TILE_HIDDEN", "h");
define("TILE_PLAYERA", "a");
define("TILE_PLAYERB", "b");
define("TILE_DOWN", "d");
define("TOOK_TILE", 1);
define("INT_32_MAX", 2147483647);
define("DBQ_IS_ABUSER", "SELECT ban_time FROM abusers WHERE ip = '%s'");
define("DBQ_GAMES_CNT", "SELECT COUNT(*) FROM games");
define("DBQ_DUO_EXIST", "SELECT duo, game_id FROM players WHERE duo = '%s' OR
duo = '%s'");
define("DBQ_IN_PLAYERA", "INSERT INTO games SET id = '%s', full_stock = %d,
harder = %d, numbers = %d;
INSERT INTO players SET duo = '%s', game_id = '%s', setup = '%s'");
define("DBQ_ABUSERS_CNT", "SELECT COUNT(*) FROM abusers");
define("DBQ_ABUSER_INSERT", "INSERT INTO abusers SET ip = '%s', line = %d");
define("DBQ_ABUSER_UPDATE", "UPDATE abusers SET ip = '%s', line = %d ORDER BY
ban_time ASC LIMIT 1");
define("DBQ_GAME", "SELECT * FROM games WHERE id = '%s'");
define("DBQ_IN_PLAYERB", "UPDATE games SET tiles = '%s' WHERE id = '%s';
INSERT INTO players SET duo = '%s', game_id = '%s', setup = '%s',
pull_time = NULL;
UPDATE players SET move = 1 WHERE duo = '%s';
UPDATE gauges SET total_waiting_time = total_waiting_time + %d");
define("DBQ_PLAYER", "SELECT * FROM players WHERE duo = '%s'");
define("DBQ_PLAYERS", "SELECT * FROM players WHERE game_id = '%s'");
define("DBQ_GET_TILES", "SELECT tiles FROM games WHERE id = '%s'");
define("DBQ_TOOK_TILE", "UPDATE games SET tiles = '%s' WHERE id = '%s';
UPDATE players SET opponent_took = opponent_took + 1 WHERE duo = '%s'");
define("DBQ_PULLED", "UPDATE players SET pull_time = NULL WHERE duo = '%s'");
define("DBQ_STORE_TILES", "UPDATE games SET tiles = '%s' WHERE id = '%s';
UPDATE players SET move = 0, pull_time = NULL WHERE duo = '%s';
UPDATE players SET move = 1, opponent_move = '%s' WHERE duo = '%s'");
define("DBQ_DONE_OPPONENT_MOVE", "UPDATE players SET opponent_move = '' WHERE
duo = '%s'");
define("DBQ_DONE_OPPONENT_TOOK", "UPDATE players SET opponent_took = 0 WHERE
duo = '%s'");
define("DBQ_STORE_ENDS", "UPDATE games SET down_ends = '%s' WHERE id = '%s'");
define("DBQ_GAME_OVER", "UPDATE players SET game_over = 1 WHERE
game_id = '%1\$s';
UPDATE gauges SET
games_played = games_played + 1,
full_stock = full_stock + %2\$d,
harder = harder + %3\$d,
numbers = numbers + %4\$d,
total_playing_time = total_playing_time + %5\$d,
average_waiting_time = total_waiting_time DIV games_played,
average_playing_time = total_playing_time DIV games_played,
shortest = CASE WHEN shortest > %5\$d THEN %5\$d ELSE shortest END,
longest = CASE WHEN longest < %5\$d THEN %5\$d ELSE longest END");
define("DBQ_DELETE_PLAYER", "DELETE FROM players WHERE duo = '%s'");
define("DBQ_DELETE_GAME", "DELETE FROM games WHERE id = '%s'");
define("DBQ_DELETE_ALL_ID", "DELETE FROM players, games USING players
INNER JOIN games WHERE players.game_id = games.id AND games.id = '%s'");
define("DBQ_DELETE_ALL_TIME", "DELETE FROM players, games USING players
INNER JOIN games WHERE players.game_id = games.id AND TIMESTAMPDIFF(SECOND,
games.start_time, NOW()) > %d");
define("DBQ_DELETE_OLD_ABUSERS", "DELETE FROM abusers WHERE
TIMESTAMPDIFF(SECOND, ban_time, NOW()) > %d");

$ip = $_SERVER["REMOTE_ADDR"];
//DEV//
$dbc; // DB connection
$dbr; // DB query result
$len; // length
$cnt; // count
//DEV//
$timers = array(
	"timers/game" => array(
		"delay" => 899, // 15 min. - 1 s
		"callback" => "delete_long_game",
	),
	"timers/abusers" => array(
		"delay" => 43199, // 12 h - 1 s
		"callback" => "delete_old_abusers",
	),
);
$clientdata = array(
	"s" => array(
	"min" => 1,
	"max" => 1,
	"rex" => '/[^0-3]/',
	),
	"u" => array(
	"min" => 16,
	"max" => 16,
	"rex" => '/[^0-9a-f]/',
	),
	"f" => array(
	"min" => 1,
	"max" => 1,
	"rex" => '/[^01]/',
	),
	"h" => array(
	"min" => 1,
	"max" => 1,
	"rex" => '/[^01]/',
	),
	"n" => array(
	"min" => 1,
	"max" => 1,
	"rex" => '/[^01]/',
	),
	"t" => array(
	"min" => 0,
	"max" => 2,
	"rex" => '/[^\d]/',
	),
	"l" => array(
	"min" => 1,
	"max" => 1,
	"rex" => '/[^01]/',
	),
	"a" => array(
	"min" => 1,
	"max" => 25,
	"rex" => '/[^\w]/',
	),
	"b" => array(
	"min" => 1,
	"max" => 25,
	"rex" => '/[^\w]/',
	),
);
//DEV//
$playera;
$playerb;
$uniqstr;
$rstarts;
$player;
$tiles;
$game;
$hand;
$tile;
$last;
$move;
$downends;
//DEV//

function send_response($data)
{
	header("Cache-Control: no-cache");
	header("Content-Type: application/json");
	header("Connection: close");
	echo json_encode($data);
}

function process_problem_exit($line, $msg = "DB tables cleared", $send = 1)
{
	if ($send)
		send_response(array(
			"s" => STATE_EXIST_END,
			"p" => PROBLEM_DB_OPPONENT,
			//DEV//
			"DEV" => "Error: $line: $msg",
			//DEV//
		));
	require("error.php");
	write_error_exit($line, $msg);
}

function generate_tiles()
{
	global $tiles;

	$tiles = array();
	$nexttileset = 0;

	for ($i = 0; $i < TILE_TOTAL_CNT; $i += $k) {
		for ($j = $nexttileset, $k = 0; $j < TILE_PIPS; $j++, $k++)
			$tiles[$i + $k] = array(
				"tile" => array($nexttileset, $j),
				"state" => TILE_HIDDEN,
			);
		$nexttileset++;
	}
}

function distribute_tiles()
{
	global $tiles;

	//DEV//
	$randint;
	//DEV//
	for ($i = 0; $i < PLAYERS_TILES_SUM; $i++) {
		$randint = mt_rand(0, TILE_MAX_IND);
		if ($tiles[$randint]["state"] !== TILE_HIDDEN) {
			$i--;
			continue;
		}
		if ($i % PLAYER_CNT)
			$tiles[$randint]["state"] = TILE_PLAYERA;
		else
			$tiles[$randint]["state"] = TILE_PLAYERB;
	}
}

function get_hand_tiles($setup)
{
	global $hand, $tiles;

	$hand = array();
	for ($i = 0; $i < TILE_TOTAL_CNT; $i++)
		if ($tiles[$i]["state"] === $setup)
			array_push($hand, $i);
	shuffle($hand);
}

function dml_query($query)
{
	global $dbc;

	$args = func_get_args();

	if (!mysqli_query($dbc, vsprintf($query, array_splice($args, 1))))
		process_problem_exit(__LINE__, mysqli_error($dbc));
}

function close_db_done()
{
	global $dbc;

	mysqli_close($dbc);
	exit;
}

function add_abuser_exit($line, $msg = "Abuser added")
{
	global $uniqstr, $dbr, $dbc, $cnt, $ip;

	if ($uniqstr)
		dml_query(DBQ_DELETE_ALL_ID, $uniqstr);
	$dbr = mysqli_query($dbc, DBQ_ABUSERS_CNT);
	$cnt = mysqli_fetch_row($dbr);
	$cnt = (int) $cnt[0];
	if ($cnt < ABUSERS_MAX)
		dml_query(DBQ_ABUSER_INSERT, $ip, $line);
	else
		dml_query(DBQ_ABUSER_UPDATE, $ip, $line);
	send_response(array(
		"s" => STATE_EXIST_END,
		"p" => PROBLEM_ABUSE,
		//DEV//
		"DEV" => "Error: $line: $msg",
		//DEV//
	));
	process_problem_exit($line, $msg, DO_NOT_SEND);
}

function run_timers()
{
	global $timers;

	foreach ($timers as $file => $options)
		if (time() - filemtime($file) > $options["delay"]) {
			if (!touch($file))
				exit(1);
			call_user_func($options["callback"]);
		}
}

function get_game_data()
{
	global $dbr, $dbc, $playera, $player, $uniqstr, $game, $tiles,
	$downends;

	$dbr = mysqli_query($dbc, sprintf(DBQ_PLAYER, $playera));
	$player = mysqli_fetch_assoc($dbr);
	if (!$player)
		process_problem_exit(__LINE__);
	if (!$player["move"] || $player["game_over"])
		add_abuser_exit(__LINE__);
	$dbr = mysqli_query($dbc, sprintf(DBQ_GAME, $uniqstr));
	$game = mysqli_fetch_assoc($dbr);
	$tiles = json_decode($game["tiles"], 1);
	$downends = json_decode($game["down_ends"], 1);
}

function get_time_delta(&$timestamp)
{
	return time() - strtotime($timestamp);
}

function get_game_time()
{
	global $game;

	return get_time_delta($game["start_time"]);
}

function dml_query_many($query)
{
	global $dbc;

	$args = func_get_args();

	mysqli_multi_query($dbc, vsprintf($query, array_splice($args, 1)));
	while (1) {
		if (!mysqli_store_result($dbc) && mysqli_errno($dbc))
			process_problem_exit(__LINE__, mysqli_error($dbc));
		if (mysqli_more_results($dbc))
			mysqli_next_result($dbc);
		else
			break;
	}
}

function over_game()
{
	global $uniqstr, $game;

	dml_query_many(DBQ_GAME_OVER, $uniqstr, (int) $game["full_stock"],
		       (int) $game["harder"], (int) $game["numbers"],
		       get_game_time());
}

function get_opponent_setup($setup)
{
	return $setup === TILE_PLAYERA ? TILE_PLAYERB : TILE_PLAYERA;
}

function has_more_tiles()
{
	global $hand;

	if (count($hand) - 1) // subtracting avoids regathering player tiles
		return 1;
	return 0;
}

function has_matching_tile($setup)
{
	global $cnt, $hand, $tiles, $downends;

	//DEV//
	$end;
	//DEV//
	get_hand_tiles($setup);
	$cnt = count($hand);
	for ($i = 0; $i < TILE_ENDS; $i++)
		for ($j = 0; $j < $cnt; $j++) {
			$end = $tiles[$hand[$j]]["tile"][$i];
			if ($end === $downends[0] || $end === $downends[1])
				return 1;
		}
}

function is_game_on($setup, $took = 0)
{
	global $game, $hand, $downends;

	if ($game["full_stock"]) {
		get_hand_tiles(TILE_HIDDEN);
		if (count($hand)) {
			return 1;
		} elseif ($took) {
			if (!$downends) // game just started
				return 1;
			return has_matching_tile($setup);
		} else {
			return has_matching_tile(get_opponent_setup($setup));
		}
	} else {
		return has_matching_tile(get_opponent_setup($setup));
	}
}

function process_put_tile()
{
	global $downends, $tiles, $tile, $last, $player, $uniqstr;

	if (!$downends) // game just started
		$downends = $tiles[$tile]["tile"];
	elseif ($downends[$last] === $tiles[$tile]["tile"][0])
		$downends[$last] = $tiles[$tile]["tile"][1];
	elseif ($downends[$last] === $tiles[$tile]["tile"][1])
		$downends[$last] = $tiles[$tile]["tile"][0];
	else
		add_abuser_exit(__LINE__);
	if (has_more_tiles() && is_game_on($player["setup"]))
		dml_query(DBQ_STORE_ENDS, json_encode($downends), $uniqstr);
	else
		over_game();
}

function set_tile_store($setup)
{
	global $tiles, $tile, $move, $last, $uniqstr, $playera, $playerb;

	$tiles[$tile]["state"] = $setup;
	if ($setup === TILE_DOWN) {
		$move = array(
			"s" => STATE_PLAYERAB_PUT_MOVE,
			"t" => $tile,
			"l" => $last,
		);
		dml_query_many(DBQ_STORE_TILES, json_encode($tiles), $uniqstr,
			       $playera, json_encode($move), $playerb);
		process_put_tile();
	} else {
		dml_query_many(DBQ_TOOK_TILE, json_encode($tiles), $uniqstr,
			       $playerb);
		if (is_game_on($setup, TOOK_TILE)) {
			return 1;
		} else {
			over_game();
			return 0;
		}
	}
}

function get_db_players()
{
	global $dbr, $dbc, $uniqstr, $cnt;

	$dbr = mysqli_query($dbc, sprintf(DBQ_PLAYERS, $uniqstr));
	$cnt = mysqli_num_rows($dbr);
}

function process_pull()
{
	global $cnt, $dbr, $playera, $player, $uniqstr;

	//DEV//
	$tmp;
	$opponent;
	//DEV//
	if (!$uniqstr)
		add_abuser_exit(__LINE__);
	get_db_players();
	if (!$cnt)
		process_problem_exit(__LINE__);
	while (($tmp = mysqli_fetch_assoc($dbr)))
		if ($tmp["duo"] === $playera)
			$player = $tmp;
		else
			$opponent = $tmp;
	if (!$player)
		add_abuser_exit(__LINE__);
	if (get_time_delta($player["pull_time"]) < DELAY_PULL_MIN)
		add_abuser_exit(__LINE__);
	if (isset($opponent) && $opponent["opponent_move"] &&
	    get_time_delta($opponent["pull_time"]) > DELAY_PULL_MAX) {
		dml_query(DBQ_DELETE_ALL_ID, $uniqstr);
		process_problem_exit(__LINE__, "Opponent is disconnected");
	}
	dml_query(DBQ_PULLED, $playera);
}

function delete_long_game()
{
	global $timers;

	dml_query(DBQ_DELETE_ALL_TIME, $timers["timers/game"]["delay"]);
}

function delete_old_abusers()
{
	global $timers;

	dml_query(DBQ_DELETE_OLD_ABUSERS, $timers["timers/abusers"]["delay"]);
}

function get_state($flag)
{
	return $flag ? STATE_PLAYERAB_PUT_MOVE : STATE_PLAYERAB_TOOK_PULL;
}

function fill_move_data()
{
	global $move, $player, $playera;

	$move["s"] = get_state($player["move"]);
	if (!$player["opponent_move"] && !$player["opponent_took"])
		return;
	if ($player["opponent_move"]) {
		$move = array_merge($move,
				    json_decode($player["opponent_move"], 1));
		dml_query(DBQ_DONE_OPPONENT_MOVE, $playera);
	}
	if ($player["opponent_took"]) {
		$move["q"] = (int) $player["opponent_took"];
		dml_query(DBQ_DONE_OPPONENT_TOOK, $playera);
	}
}

$dbc = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if (mysqli_connect_errno($dbc))
	process_problem_exit(__LINE__, mysqli_connect_error($dbc));
if (!mysqli_set_charset($dbc, "utf8"))
	process_problem_exit(__LINE__, mysqli_error($dbc));
$dbr = mysqli_query($dbc, sprintf(DBQ_IS_ABUSER, $ip));
if (mysqli_num_rows($dbr)) {
	send_response(array(
		"s" => STATE_EXIST_END,
		"p" => PROBLEM_ABUSE,
	));
	close_db_done();
}
mysqli_free_result($dbr);
run_timers();
foreach ($_POST as $key => $value) {
	if (!array_key_exists($key, $clientdata)) {
		if (strlen($key) > 1)
			$key = mb_substr($key, 0, 1) . "...";
		add_abuser_exit(__LINE__, "Wrong key: $key");
	}
	$len = strlen($value);
	if ($len < $clientdata[$key]["min"] ||
	    $len > $clientdata[$key]["max"] ||
	    preg_match($clientdata[$key]["rex"], $value))
		add_abuser_exit(__LINE__, "Wrong value: $value (key: $key)");
}
if (isset($_POST["u"]))
	$uniqstr = $_POST["u"];
if (!isset($_POST["s"], $_POST["a"], $_POST["b"]))
	add_abuser_exit(__LINE__);
if ($_POST["a"] === $_POST["b"])
	add_abuser_exit(__LINE__);
$playera = $_POST["a"] . $_POST["b"];
$playerb = $_POST["b"] . $_POST["a"];
switch ($_POST["s"]) {
	case STATE_EXIST_END:
	if (!isset($_POST["f"], $_POST["h"], $_POST["n"]))
		add_abuser_exit(__LINE__);
	$dbr = mysqli_query($dbc, DBQ_GAMES_CNT);
	$cnt = mysqli_fetch_row($dbr);
	$cnt = (int) $cnt[0];
	if ($cnt > GAMES_LIMIT) {
		send_response(array(
			"s" => STATE_EXIST_END,
			"p" => PROBLEM_TOO_MANY,
		));
		close_db_done();
	}
	$dbr = mysqli_query($dbc, sprintf(DBQ_DUO_EXIST, $playera, $playerb));
	$cnt = mysqli_num_rows($dbr);
	$player = mysqli_fetch_assoc($dbr);
	if ($cnt === 0) { // as First
		$uniqstr = sprintf("%08x%08x", mt_rand(0, INT_32_MAX),
				   mt_rand(0, INT_32_MAX));
		dml_query_many(DBQ_IN_PLAYERA, $uniqstr, $_POST["f"],
			       $_POST["h"], $_POST["n"], $playera, $uniqstr,
			       TILE_PLAYERA);
		send_response(array(
			"s" => STATE_PLAYERA_PULL,
			"u" => $uniqstr,
		));
	} elseif ($cnt === 1 && $player["duo"] !== $playera) { // as Second
		$uniqstr = $player["game_id"];
		$dbr = mysqli_query($dbc, sprintf(DBQ_GAME, $uniqstr));
		$game = mysqli_fetch_assoc($dbr);
		generate_tiles();
		distribute_tiles();
		if (mt_rand(0, 1))
			$rstarts = &$playera;
		else
			$rstarts = &$playerb;
		dml_query_many(DBQ_IN_PLAYERB, json_encode($tiles), $uniqstr,
			       $playera, $uniqstr, TILE_PLAYERB, $rstarts,
			       get_game_time());
		get_hand_tiles(TILE_PLAYERB);
		send_response(array(
			"s" => get_state($rstarts === $playera),
			"c" => $hand,
			"u" => $uniqstr,
			"f" => (int) $game["full_stock"],
			"h" => (int) $game["harder"],
			"n" => (int) $game["numbers"],
			"d" => get_game_time(),
		));
	} else {
		send_response(array(
			"s" => STATE_EXIST_END,
			"p" => PROBLEM_EXIST,
		));
	}
	break;
	case STATE_PLAYERA_PULL:
	process_pull();
	if ($cnt !== PLAYER_CNT) {
		send_response(array(
			"s" => STATE_PLAYERA_PULL,
		));
		break;
	}
	$dbr = mysqli_query($dbc, sprintf(DBQ_GET_TILES, $uniqstr));
	$tiles = mysqli_fetch_row($dbr);
	$tiles = json_decode($tiles[0], 1);
	get_hand_tiles($player["setup"]);
	$move = array(
		"c" => $hand,
	);
	fill_move_data();
	send_response($move);
	break;
	case STATE_PLAYERAB_TOOK_PULL:
	process_pull();
	if ($cnt === 1 && !$player["game_over"])
		add_abuser_exit(__LINE__);
	$move = array();
	fill_move_data();
	if ($player["opponent_move"] || $player["opponent_took"]) {
		if ($player["game_over"] && $player["opponent_move"])
			$move["s"] = STATE_PLAYERAB_TOOK_PULL;
	} elseif ($player["game_over"]) {
		$dbr = mysqli_query($dbc, sprintf(DBQ_GET_TILES, $uniqstr));
		$tiles = mysqli_fetch_row($dbr);
		$tiles = json_decode($tiles[0], 1);
		get_hand_tiles(get_opponent_setup($player["setup"]));
		//DEV//
		//sleep(4); // querying after deletion avoids racing conditions
		//DEV//
		dml_query(DBQ_DELETE_PLAYER, $playera);
		get_db_players();
		if (!$cnt)
			dml_query(DBQ_DELETE_GAME, $uniqstr);
		send_response(array(
			"s" => STATE_EXIST_END,
			"c" => $hand,
		));
		break;
	}
	send_response($move);
	break;
	case STATE_PLAYERAB_PUT_MOVE:
	if (!isset($uniqstr))
		add_abuser_exit(__LINE__);
	if (isset($_POST["t"]) && !isset($_POST["l"])) {
		get_game_data();
		if (!(int) $game["full_stock"])
			add_abuser_exit(__LINE__);
		get_hand_tiles(TILE_HIDDEN);
		$cnt = count($hand);
		if (!$cnt)
			add_abuser_exit(__LINE__);
		$tile = $hand[mt_rand(0, $cnt - 1)];
		send_response(array(
			"s" => get_state(set_tile_store($player["setup"])),
			"t" => $tile,
		));
		//DEV//
		//sleep(2); // slow to give tile from stock
		//DEV//
	} elseif (isset($_POST["t"], $_POST["l"])) {
		$tile = (int) $_POST["t"];
		$last = (int) $_POST["l"];
		if ($tile < 0 || $tile > TILE_MAX_IND)
			add_abuser_exit(__LINE__);
		get_game_data();
		get_hand_tiles($player["setup"]);
		if (!in_array($tile, $hand))
			add_abuser_exit(__LINE__);
		//DEV//
		//sleep(2); // busy processing putted tile
		//DEV//
		set_tile_store(TILE_DOWN);
		send_response(array(
			"s" => STATE_PLAYERAB_TOOK_PULL,
		));
	} else {
		add_abuser_exit(__LINE__);
	}
	break;
}
close_db_done();
?>
