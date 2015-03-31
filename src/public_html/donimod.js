// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
/*
 * DonimoD is Domino game variant played versus computer or human.
 *
 * Copyright © 2014-2015 Donatas Klimašauskas
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

"use strict";

//DEV//
/*
//DEV//
(function()
{
//DEV//
*/
//DEV//
var COMPUTER = "Computer";
var HUMAN = "Human";
var UPPER = "Upper";
var LOWER = "Lower";
var OPPONENT = "Opponent";
var YOU = "You";
var TILE_TOTAL_CNT = 28;
var TILE_MAX_IND = TILE_TOTAL_CNT - 1;
var TILE_PIPS = 7;
var TILE_HIDDEN = "hidden";
var TILE_DOWN = "down";
var TILES_PER_PLAYER = 7;
var PRNG_MAX = 65535;
var MEND_BREAK = "_";
var CHAR_A = 65;
var CHAR_Z = 90;
var NAME_BREAK = ":";
var SERVER = "server";
var DELAY_MIN = 1e3;
var DELAY_MAX = 5e3;
var DELAY_PULL = 5e3;
var LONG_RESPONSE = 30e3;
var LONG_GAME = 900e3; // 15 min.
var LONG_GAME_NOTE = LONG_GAME / 3;
var SECOND = 1e3;
var MINUTE = 60e3;
var COLOR_FIRST = "#afa";
var COLOR_SECOND = "#faa";
var PLAYER_CNT = 2;
var PLAYERS_TILES_SUM = PLAYER_CNT * TILES_PER_PLAYER;
var MATCHING_ENDS = 2;
var MATCHING_ENDS_MAX = 4;
var HIDDEN = 1;
var WHICH_END = 1;
var WHICH_END_MARGIN = "0 1em";
var JSON_START = "{";
var NOT_SETUP = 1;
var HTTP_DONE = 4;
var STATE_EXIST_END_WAIT = 0;
var STATE_PLAYERA_PULL = 1;
var STATE_PLAYERAB_TOOK_PULL = 2;
var STATE_PLAYERAB_PUT_MOVE = 3;
var INDEX = "data-index";
var CTRLS_DISABLED = 1;
var OPACITY = ".5";
var EMPTY = null;
var FIRST = 0;
var T2D_GRID_ELS = 9;
var T2D_HORIZONTAL = 0;
var T2D_VERTICAL = 1;
var T2D_LAST = 1;
var T2D_BG_COLOR = "#000";
var T2D_FG_COLOR = "#fff";
var T2D_PIP_GRIDS = [
    [
	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 1, 0, 0, 0, 0],
	[0, 0, 1, 0, 0, 0, 1, 0, 0],
	[0, 0, 1, 0, 1, 0, 1, 0, 0],
	[1, 0, 1, 0, 0, 0, 1, 0, 1],
	[1, 0, 1, 0, 1, 0, 1, 0, 1],
	[1, 1, 1, 0, 0, 0, 1, 1, 1],
    ],
    [
	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 1, 0, 0, 0, 0],
	[1, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 1, 0, 0, 0, 1],
	[1, 0, 1, 0, 0, 0, 1, 0, 1],
	[1, 0, 1, 0, 1, 0, 1, 0, 1],
	[1, 0, 1, 1, 0, 1, 1, 0, 1],
    ],
];

var one;
var two;
var help;
var players;
var current;
var switched;
var lastgame;
var gamestate;
var get_random_int_typed; // stores crypto grade or insecure PRNG function
var play_computer; // stores reference to chosen gaming function
var process_down_tile; // stores game type specific task function
var ratedpips;
var ratepips;
var names;
var table;
var message;
var controls;
var controlnodes = {
    fullstock: null,
    harder: null,
    numbers: null,
};
var lid;
var stock;
var counters = {
    playerastarts: 0,
    playerawins: 0,
    playerapips: 0,
    playerbstarts: 0,
    playerbwins: 0,
    playerbpips: 0,
    playedgames: 0,
    playedfullstock: 0,
    playedharder: 0,
};
var tiles = [];
var tilebodies = [];
var showtiles;
var gameover;
var downends;
var tileshidden;
var fullstock;
var harder;
var numbers;
var question;
var choice;
var gamestart;
var last;
var matches;
var matchingends;
var choiceends = new Array(MATCHING_ENDS);
var tablecontent;
var device;
var mend;
var link;
var starttwo;
var timeleft;
var xhrs = []; // contains XMLHttpRequest objects
var delay; // stores milliseconds after Unix epoch or between two time points
var timeidgame;
var timeidpull;
var timeidshow;
var timeidleft;
var uniqstr;
var messages = {
    acceptedfirst: "You created the game",
    acceptedsecond: "You joined the game. ",
    chooseend: "Please, choose an end",
    choosetile: "Please, choose a tile",
    equals: "no one: equals",
    invalidchars: "Please, for names use Latin letters or numbers",
    linked: "Linked. Please, copy and send opponent the link address",
    longgame: "Game was too long. Please, try playing a bit faster",
    mended: "Mended",
    moved: " moved",
    connectionlack: "Cannot connect. Please, use other game modes",
    connectionlost: "Connection is lost. Please, try to restart",
    connectionslow: "Connection is too slow. Please, play tad later",
    nomatchingtile: "No matching tile was selected",
    nomend: "Cannot mend. Please, delete few characters and try again",
    nosamenames: "Please, names should not be the same",
    opponentjoined: "Opponent joined the game. ",
    problems: [
	"Too many players. Please, try again after few minutes",
	"Such players exist. Please, try changing a name",
	"Something went wrong. Please, try next day or so",
	"A problem was detected. Please, play a bit later",
    ],
    starts: " starts the game",
    starttwo: "Attempting to start...",
    tilewhere: "Where to put the tile?",
    tooktile: "Stock is used",
    turn: ". Your turn",
    next: " next",
    versus: " vs. ",
    wait: "Please, wait for your turn",
    waitingmove: "Waiting for opponent to make a move",
    waitingopponent: "Waiting for opponent to join the game",
    winneris: "The winner is ",
}

function Player(color)
{
    this.who;
    this.nameshown;
    this.nameset;
    this.node = null;
    this.color = color;
    this.tiles;
    this.input;
}

function id_(id)
{
    return document.getElementById(id);
}

function ce_(el)
{
    return document.createElement(el);
}

function stop_event(event)
{
    event.preventDefault();
    event.stopPropagation();
}

//DEV//
function log(msg)
{
    if (!msg)
	msg = "log(): no message found";
    console.log(msg);
}

function dev__log_player_tiles(player)
{
    var playertiles = player.tiles;
    var len = playertiles.length;

    for (var i = 0; i < len; i++)
	log(i + ":\t" + get_text_tile(tiles[playertiles[i]].tile));
}

function dev__log_all_tiles()
{
    for (var i = 0; i < TILE_TOTAL_CNT; i++)
	log(i + ":\t" + get_text_tile(tiles[i].tile) + "\t" + tiles[i].state);
}
//DEV//
function redraw_help_container(event)
{
    var helpcss;
    var lmarginthis;
    var lmarginlast;

    //DEV//
    var widthslefts = "help widths and left margins (px):";
    //DEV//
    if (event)
	stop_event(event);
    if (help.style.display !== "block")
	return;
    helpcss = getComputedStyle(help);
    while (true) {
	lmarginthis = parseInt(parseInt(helpcss.width) / 2 +
			       parseInt(helpcss.paddingLeft));
	if (lmarginthis === lmarginlast) {
	    break;
	} else {
	    help.style.marginLeft = -lmarginthis + "px";
	    lmarginlast = lmarginthis;
	}
	//DEV//
	widthslefts += " " + parseInt(helpcss.width) + "&-" + lmarginthis;
	//DEV//
    }
    //DEV//
    log(widthslefts);
    //DEV//
}

function handle_help(event)
{
    var helpcont = event.currentTarget;

    stop_event(event);
    if (help.innerHTML !== helpcont.firstElementChild.innerHTML ||
	help.style.display === "none") {
	help.innerHTML = helpcont.firstElementChild.innerHTML;
	helpcont.parentElement.insertBefore(help, helpcont.nextElementSibling);
	help.style.display = "block";
	redraw_help_container();
    } else {
	help.style.display = "none";
    }
}

function copy_array(arraytocopy, arraytopaste)
{
    var len;

    if (arraytocopy instanceof Array && arraytopaste instanceof Array &&
	arraytocopy.length === arraytopaste.length)
	len = arraytocopy.length;
    else
	return false;
    for (var i = 0; i < len; i++)
	arraytopaste[i] = arraytocopy[i];
    return true;
}

function get_random_int_crypto()
{
    return crypto.getRandomValues(new Uint16Array(1))[0];
}

function get_random_int_insecure(max)
{
    return Math.round(Math.random() * Math.pow(10, (max + "").length));
}

/*
 * Returns random integer between minimum and maximum positive integer
 * arguments (both included).
 */
function get_random_int(limmin, limmax)
{
    var offset;

    if (typeof limmin !== "number" || typeof limmax !== "number" ||
	limmin >= limmax || limmax > PRNG_MAX ||
	(limmin + "" + limmax).match(/\.|-/))
	return false;
    offset = limmin;
    limmin = 0;
    limmax += 1; // int % int
    limmax -= offset;
    return get_random_int_typed(limmax) % limmax + offset;
}

function process_game_change(thisgame)
{
    gamestart = 1;
    if (lastgame !== thisgame)
	lastgame = thisgame;
    else
	return;
    for (var counter in counters) {
	counters[counter] = 0;
	id_(counter).innerHTML = 0;
    }
    if (thisgame === HUMAN || thisgame === LOWER) {
	stock.removeEventListener("click", two_give_tile, false);
	stock.addEventListener("click", one_give_tile, false);
    } else {
	stock.removeEventListener("click", one_give_tile, false);
	stock.addEventListener("click", two_give_tile, false);
    }
}

function count_pips(playertiles)
{
    var len = playertiles.length;
    var count = 0;

    for (var i = 0; i < len; i++)
	for (var j = 0; j < MATCHING_ENDS; j++)
	    count += tiles[playertiles[i]].tile[j];
    return count;
}

function get_text_tile(tile)
{
    return "|" + tile.join("|") + "|";
}

function draw_text_tile(tile, color)
{
    var tiletext = ce_("span");

    tiletext.className = "tiletext";
    if (tile)
	tiletext.innerHTML = get_text_tile(tile);
    else
	tiletext.innerHTML = "|X|X|";
    if (color)
	tiletext.style.color = color;
    return tiletext;
}

function draw_t2d_tile(tile, node, vertical, last, color)
{
    var tilebody = ce_("div");
    var tileend;
    var tilemid;
    var pipbody;
    var pip;

    tilebody.className = "tilebody";
    if (vertical)
	tilebody.className += " tbvertical";
    else
	tilebody.className += " tbhorizontal";
    if (color)
	tilebody.style.borderColor = color;
    if (!tile)
	return tilebody;
    for (var i = 0; i < MATCHING_ENDS; i++) {
	tileend = ce_("div");
	tileend.className = "tileend";
	for (var j = 0; j < T2D_GRID_ELS; j++) {
	    pipbody = ce_("div");
	    pipbody.className = "pipbody";
	    if (T2D_PIP_GRIDS[vertical][tile[i]][j]) {
		pip = ce_("div");
		pip.className = "pip";
		if (color)
		    pip.style.backgroundColor = color;
		pipbody.appendChild(pip);
	    }
	    tileend.appendChild(pipbody);
	}
	if (i) {
	    tilemid = ce_("div");
	    tilemid.className = "tilemid";
	    if (vertical)
		tilemid.className += " tmvertical";
	    else
		tilemid.className += " tmhorizontal";
	    if (color)
		tilemid.style.backgroundColor = color;
	    tilebody.appendChild(tilemid);
	}
	tilebody.appendChild(tileend);
    }
    return tilebody;
}

function show_tiles()
{
    var len = tilebodies.length;

    for (var i = 0; i < len; i++)
	tilebodies[i].style.opacity = "1";
    tilebodies = [];
    showtiles = 0;
}

function draw_tile(tile, node, vertical, last, player)
{
    var tilebody;
    var color = player.node.style.color;

    if (numbers)
	tilebody = draw_text_tile(tile, color);
    else
	tilebody = draw_t2d_tile(tile, node, vertical, last, color);
    if (last)
	node.appendChild(tilebody);
    else
	node.insertBefore(tilebody, node.firstChild);
    tilebodies.push(tilebody);
    if (!showtiles) {
	showtiles = 1;
	setTimeout(show_tiles, 100); // ms for Firefox CSS transition to work
    }
    return tilebody;
}

function copy_tile(tileind, copyto)
{
    if (!copy_array(tiles[tileind].tile, copyto))
	throw Error("copy_tile()");
}

function do_first_action(tileind)
{
    copy_tile(tileind, downends);
    matches = [[downends[0], downends[1]]];
    matchingends = 1;
    last = 0;
    gamestart = 0;
}

function find_matching_ends(tileind)
{
    copy_tile(tileind, choiceends);
    matches = [];
    matchingends = 0;
    if (choiceends[0] === downends[0]) {
	matches.push([choiceends[1], choiceends[0]]);
	matchingends++;
	last = 0;
    }
    if (choiceends[0] === downends[1]) {
	matches.push([choiceends[0], choiceends[1]]);
	matchingends++;
	last = 1;
    }
    if (choiceends[1] === downends[0]) {
	matches.push([choiceends[0], choiceends[1]]);
	matchingends++;
	last = 0;
    }
    if (choiceends[1] === downends[1]) {
	matches.push([choiceends[1], choiceends[0]]);
	matchingends++;
	last = 1;
    }
    if (matchingends)
	return true;
    else
	return false;
}

function is_double_tile(tile)
{
    return tile[0] === tile[1];
}

function activate_tile(tile, index, whichend)
{
    if (whichend !== WHICH_END) {
	tile.id = index;
	tile.addEventListener("click", process_tile_choice, false);
    } else {
	tile.setAttribute(INDEX, index);
	tile.addEventListener("click", process_tile_second_choice, false);
    }
}

function show_message(msg)
{
    message.innerHTML = msg;
}

function put_tile_where(matcher, player)
{
    var tile;

    tablecontent = table.innerHTML;
    matcher.style.margin = WHICH_END_MARGIN;
    for (var i = 0; i < MATCHING_ENDS; i++) {
	tile = draw_tile(matches[i], table, T2D_HORIZONTAL, i, player);
	tile.style.margin = WHICH_END_MARGIN;
	activate_tile(tile, i, WHICH_END);
    }
    question = 1;
    show_message(messages.tilewhere);
}

function process_tile_choice(event)
{
    if (event)
	stop_event(event);
    if (gamestate !== STATE_PLAYERAB_PUT_MOVE) {
	show_message(messages.wait);
	return;
    }
    if (event && !question) {
	choice = event.currentTarget.id - 0;
    } else if (event && question) {
	show_message(messages.chooseend);
	return;
    }
    if (gamestart)
	do_first_action(players.a.tiles[choice]);
    else if (!question)
	find_matching_ends(players.a.tiles[choice]);
    /*
     * Ask human for preference where to put double tile even when it
     * does not matter (simulating real life; when `matchingends'
     * reaches its max value).
     */
    if ((matchingends >= MATCHING_ENDS && !question) &&
	(!is_double_tile(tiles[players.a.tiles[choice]].tile) ||
	 matchingends === MATCHING_ENDS_MAX)) {
	put_tile_where(event.currentTarget, players.a);
	return;
    }
    process_down_tile(players.a, choice);
}

function process_tile_second_choice(event)
{
    stop_event(event);
    last = event.currentTarget.getAttribute(INDEX) - 0;
    table.innerHTML = tablecontent;
    process_tile_choice();
}

function make_player_tiles(player, hidden)
{
    var len = player.tiles.length;
    var tile;

    player.node.innerHTML = "";
    for (var i = 0; i < len; i++) {
	tile = draw_tile(hidden ? EMPTY : tiles[player.tiles[i]].tile,
			 player.node, T2D_VERTICAL, T2D_LAST, player);
	if (!hidden && !gameover)
	    activate_tile(tile, i);
    }
}

function change_controls(state)
{
    if (state === CTRLS_DISABLED) {
	lid.style.display = "block";
	controls.style.opacity = OPACITY;
    } else {
	lid.style.display = "none";
	controls.style.opacity = "1";
    }
}

function switch_players()
{
    var tmp;

    tmp = players.a;
    players.a = players.b;
    players.b = tmp;
    if (switched)
	switched = 0;
    else
	switched = 1;
}

function over_game()
{
    var playerapips;
    var playerbpips;
    var winner = messages.winneris;

    gameover = 1;
    if (switched)
	switch_players();
    playerapips = count_pips(players.a.tiles);
    playerbpips = count_pips(players.b.tiles);
    if (playerapips < playerbpips) {
	counters.playerawins++;
	winner += players.a.nameshown.innerHTML;
    } else if (playerapips > playerbpips) {
	counters.playerbwins++;
	winner += players.b.nameshown.innerHTML;
    } else {
	winner += messages.equals;
    }
    counters.playerapips += playerapips;
    counters.playerbpips += playerbpips;
    counters.playedgames++;
    if (fullstock) {
	counters.playedfullstock++;
	stock.style.display = "none";
    }
    if (harder)
	counters.playedharder++;
    make_player_tiles(players.a);
    make_player_tiles(players.b);
    change_controls();
    show_message(winner + " (" + playerbpips + messages.versus + playerapips +
		 ")");
    for (var counter in counters)
	id_(counter).innerHTML = counters[counter];
}

function set_stock_gauge()
{
    stock.firstElementChild.innerHTML = tileshidden.length;
}

function reset_player_ids(player)
{
    var len = player.tiles.length;

    for (var i = 0; i < len; i++)
	player.node.childNodes[i].id = i;
}

function remove_player_tile(player, choice)
{
    return player.node.removeChild(player.node.childNodes[choice]);
}

function confirm_internet_play(notsetup)
{
    if (!notsetup && location.protocol.match(/^http/))
	return;
    starttwo.disabled = "disabled";
    starttwo.style.opacity = OPACITY;
}

/*
 * Generates array of domino tile objects, 28 in total, all unique
 * from 0-0 to 6-6 (double six). Domino tile set:
 * 00 01 02 03 04 05 06
 * 11 12 13 14 15 16
 * 22 23 24 25 26
 * 33 34 35 36
 * 44 45 46
 * 55 56
 * 66
 * Tile object has `tile' and `state' properties.
 * `tile' refers to array of tile pips on both ends of its face.
 * `state' is one of: `hidden', `down' or name of player who has it.
 */
function generate_tiles()
{
    var nexttileset = 0;

    for (var i = 0; i < TILE_TOTAL_CNT; i += k) {
	for (var j = nexttileset, k = 0; j < TILE_PIPS; j++, k++)
	    tiles[i + k] = {
		tile: [nexttileset, j],
		state: "",
	    };
	nexttileset++;
    }
}

function get_time_now()
{
    return (new Date()).getTime();
}

function set_delay_now()
{
    delay = get_time_now();
}

function reset_game(playeraname, playerbname)
{
    fullstock = controlnodes.fullstock.checked;
    harder = controlnodes.harder.checked;
    numbers = controlnodes.numbers.checked;
    current = null;
    players.a.who = playeraname;
    players.b.who = playerbname;
    players.a.tiles = [];
    players.b.tiles = [];
    players.a.node.innerHTML = "";
    players.b.node.innerHTML = "";
    table.innerHTML = "";
    downends = new Array(MATCHING_ENDS);
    if (playeraname === HUMAN || playeraname === LOWER) {
	if (fullstock)
	    tileshidden = [];
	for (var i = 0; i < TILE_TOTAL_CNT; i++)
	    tiles[i].state = TILE_HIDDEN;
	if (harder && !current) {
	    ratedpips = new Array(TILE_PIPS);
	    ratepips = 1;
	    set_delay_now();
	}
    } else if (fullstock) { // playeraname === YOU
	tileshidden = new Array(PLAYERS_TILES_SUM);
    }
}

function distribute_tiles()
{
    var randint;
    var tmp;
    var len;

    for (var i = 0; i < PLAYERS_TILES_SUM; i++) {
	randint = get_random_int(0, TILE_MAX_IND);
	if (tiles[randint].state !== TILE_HIDDEN) {
	    i--;
	    continue;
	}
	if (i % PLAYER_CNT) {
	    tiles[randint].state = players.a.who;
	    players.a.tiles.push(randint);
	} else {
	    tiles[randint].state = players.b.who;
	    players.b.tiles.push(randint);
	}
    }
    if (fullstock) {
	tmp = [];
	for (var i = 0; i < TILE_TOTAL_CNT; i++)
	    if (tiles[i].state === TILE_HIDDEN)
		tmp.push(i);
	while ((len = tmp.length))
	    tileshidden.push(tmp.splice(get_random_int(0, len - 1), 1)[0]);
    }
}

function get_time_delta(start)
{
    return get_time_now() - start;
}

function go_computer()
{
    if (harder) {
	delay = get_time_delta(delay);
	if (delay < DELAY_MIN)
	    delay = DELAY_MIN;
	else if (delay > DELAY_MAX)
	    delay = DELAY_MAX;
	setTimeout(play_computer, delay);
    } else {
	setTimeout(play_computer, get_random_int(DELAY_MIN, DELAY_MAX));
    }
}

function set_tile_colors()
{
    if (harder) {
	players.a.node.style.color = "";
	players.b.node.style.color = "";
    } else {
	players.a.node.style.color = players.a.color;
	players.b.node.style.color = players.b.color;
    }
    //DEV//
    players.a.node.style.color = players.a.color;
    players.b.node.style.color = players.b.color;
    //DEV//
}

function make_players_tiles()
{
    make_player_tiles(players.a);
    make_player_tiles(players.b, HIDDEN);
}

function rate_pips(playertiles, pips)
{
    var len = playertiles.length;
    var ind;

    for (var i = 0; i < len; i++)
	for (var j = 0; j < MATCHING_ENDS; j++) {
	    ind = tiles[playertiles[i]].tile[j];
	    if (pips[ind] === undefined)
		pips[ind] = 0;
	    pips[ind]++;
	}
    //DEV//
    for (var i = 0; i < pips.length; i++)
	log("pip == " + i + "\trate == " + pips[i]);
    //DEV//
}

function find_matching_tiles(playertiles, matchingtiles)
{
    var len = playertiles.length;

    for (var i = 0; i < len; i++)
	if (gamestart || find_matching_ends(playertiles[i])) {
	    if (matchingtiles)
		matchingtiles.push([i, 0]);
	    else
		return true;
	}
    return false;
}

function one_take_hidden_tile(player)
{
    var tilehiddenind;
    var tile;

    if (tileshidden.length) {
	tilehiddenind = tileshidden.pop();
	tiles[tilehiddenind].state = player.who;
	player.tiles.push(tilehiddenind);
	if (!tileshidden.length)
	    stock.style.display = "none";
    } else {
	over_game();
	return;
    }
    if (player.who === players.a.who) {
	tile = draw_tile(tiles[tilehiddenind].tile, players.a.node,
			 T2D_VERTICAL, T2D_LAST, players.a);
	activate_tile(tile, players.a.node.childNodes.length - 1);
	if (!tileshidden.length && !find_matching_tiles(players.a.tiles)) {
	    over_game();
	    return;
	}
    } else {
	draw_tile(EMPTY, players.b.node, T2D_VERTICAL, T2D_LAST, players.b);
	if (harder) {
	    rate_pips([tilehiddenind], ratedpips);
	    set_delay_now();
	}
	go_computer();
    }
    set_stock_gauge();
    show_message(messages.tooktile);
    //DEV//
    log(player.who + " took tile == " +
	get_text_tile(tiles[tilehiddenind].tile));
    //DEV//
}

function has_stock_tiles()
{
    return fullstock && tileshidden.length;
}

function is_game_tied(player)
{
    return !(find_matching_tiles(player.tiles) || has_stock_tiles());
}

function one_process_tied_game(player)
{
    if (player.who === players.b.who) {
	if (fullstock)
	    one_take_hidden_tile(player);
	else
	    over_game();
    } else {
	if (is_game_tied(player))
	    over_game();
	else
	    show_message(messages.nomatchingtile);
    }
}

/*
 * By copying single matched tile, no need for later `if' checking
 * before setting `downends' and adding new downed tile.
 */
function process_single_matcher()
{
    if (matches.length === 1)
	matches.push([matches[0][0], matches[0][1]]);
}

function arm_player_tiles(player)
{
    player.node.addEventListener("click", show_player_tiles, false);
    current = player;
}

function one_process_down_tile(player, choice)
{
    var tilechoice;

    if (!matchingends) {
	one_process_tied_game(player);
	return;
    }
    tiles[player.tiles[choice]].state = TILE_DOWN;
    process_single_matcher();
    downends[last] = matches[last][last];
    draw_tile(matches[last], table, T2D_HORIZONTAL, last, player);
    if (question)
	question = 0;
    tilechoice = player.tiles.splice(choice, 1);
    if (!player.tiles.length) {
	over_game();
    } else if (player.who === players.a.who) {
	remove_player_tile(players.a, choice);
	reset_player_ids(players.a);
	if (current) {
	    if (is_game_tied(players.b)) {
		over_game();
	    } else {
		make_player_tiles(players.a, HIDDEN);
		arm_player_tiles(players.b);
		if (has_stock_tiles())
		    stock.style.display = "none";
	    }
	} else {
	    gamestate = STATE_EXIST_END_WAIT;
	    if (harder)
		rate_pips(tilechoice, ratedpips);
	    go_computer();
	}
	if (!gameover)
	    show_message(players.b.who + messages.next);
    } else {
	gamestate = STATE_PLAYERAB_PUT_MOVE;
	remove_player_tile(players.b, choice);
	if (is_game_tied(players.a)) {
	    over_game();
	} else {
	    if (harder)
		set_delay_now();
	    show_message(COMPUTER + messages.moved + messages.turn);
	}
	//DEV//
	log("chosen == " + get_text_tile(tiles[tilechoice].tile));
	//DEV//
    }
    //DEV//
    log("last == " + last + "\tdownends == " + get_text_tile(downends));
    //DEV//
}

function find_block_tile(player, ratedpips)
{
    var ratedtiles = [];
    var len;
    var tileind;

    find_matching_tiles(player.tiles, ratedtiles);
    if (!(len = ratedtiles.length))
	return 0;
    if (len === 1) {
	find_matching_ends(player.tiles[ratedtiles[0][0]]);
	//DEV//
	log("single match == " +
	    get_text_tile(tiles[player.tiles[ratedtiles[0][0]]].tile));
	//DEV//
	return ratedtiles[0][0];
    }
    tileind = rate_tiles(player.tiles, ratedpips, ratedtiles, len);
    find_matching_ends(player.tiles[tileind]);
    if (matchingends >= MATCHING_ENDS &&
	!is_double_tile(tiles[player.tiles[tileind]].tile)) {
	if (ratedpips[downends[0]] < ratedpips[downends[1]])
	    last = 0;
	else
	    last = 1;
    }
    //DEV//
    for (var i = 0; i < ratedtiles.length; i++)
	log(get_text_tile(tiles[player.tiles[ratedtiles[i][0]]].tile) +
	    "\trate == " + ratedtiles[i][1]);
    //DEV//
    return tileind;
}

/*
 * Computer finds out which tiles can be put down, rates them from
 * most proper tile to least proper tile to be put down for blocking,
 * chooses first one. In case if more than one tile has same rating
 * for most proper choice, one with highest pip count is selected.
 */
function computer_play_harder()
{
    if (ratepips) {
	rate_pips(players.b.tiles, ratedpips);
	ratepips = 0;
    }
    choice = find_block_tile(players.b, ratedpips);
    if (gamestart)
	do_first_action(players.b.tiles[choice]);
    process_down_tile(players.b, choice);
}

/*
 * Computer does random matching tile choice, i.e. picks first
 * matching, which by itself is chosen randomly at beginning of game.
 */
function computer_play_random()
{
    var len;

    if (gamestart) {
	choice = 0;
	do_first_action(players.b.tiles[choice]);
    } else {
	len = players.b.tiles.length;
	for (var i = 0; i < len; i++)
	    if (find_matching_ends(players.b.tiles[i])) {
		choice = i;
		break;
	    }
    }
    process_down_tile(players.b, choice);
}

function one_give_tile(event)
{
    stop_event(event);
    if (question) {
	show_message(messages.chooseend);
	return;
    }
    if (gamestate)
	one_take_hidden_tile(players.a);
    else
	show_message(messages.wait);
}

function prepare_full_stock()
{
    set_stock_gauge();
    stock.style.display = "block";
}

function hide_opened()
{
    help.style.display = "none";
    names.style.display = "none";
}

function computer_start_game(event)
{
    stop_event(event);
    if (gameover)
	gameover = 0;
    hide_opened();
    change_controls(CTRLS_DISABLED);
    reset_game(HUMAN, COMPUTER);
    distribute_tiles();
    if (fullstock)
	prepare_full_stock();
    if (harder)
	play_computer = computer_play_harder;
    else
	play_computer = computer_play_random;
    set_tile_colors();
    process_down_tile = one_process_down_tile;
    make_players_tiles();
    players.a.nameshown.innerHTML = players.a.who;
    players.b.nameshown.innerHTML = players.b.who;
    process_game_change(HUMAN);
    if (get_random_int(0, 1)) {
	gamestate = STATE_PLAYERAB_PUT_MOVE;
	counters.playerastarts++;
	show_message(HUMAN + messages.starts);
	if (harder)
	    set_delay_now();
    } else {
	counters.playerbstarts++;
	show_message(COMPUTER + messages.starts);
	go_computer();
    }
    //DEV//
    log("***** computer *****");
    dev__log_player_tiles(players.b);
    //DEV//
}

function are_names_valid()
{
    if (players.a.input.value === players.b.input.value) {
	show_message(messages.nosamenames);
	return false;
    }
    for (var p in players)
	if (!players[p].input.value || players[p].input.value.match(/[^\w]/)) {
	    show_message(messages.invalidchars);
	    return false;
	}
    return true;
}

function assemble_keys_values(map)
{
    var keysvalues = "";
    var value;

    for (var key in map) {
	if (keysvalues)
	    keysvalues += "&";
	value = map[key];
	if (value === true || value === false)
	    value -= 0;
	keysvalues += key + "=" + value;
    }
    return keysvalues;
}

function clear_long_game_timers()
{
    clearTimeout(timeidgame);
    clearTimeout(timeidshow);
    clearTimeout(timeidleft);
    timeleft.style.display = "none";
}

function process_problem(problem)
{
    xhrs = [];
    gameover = 1;
    change_controls();
    clear_long_game_timers();
    clearTimeout(timeidpull);
    names.style.display = "block";
    starttwo.disabled = "";
    show_message(problem);
}

function process_response_error()
{
    process_problem(messages.connectionlost);
}

function process_timeout_error()
{
    process_problem(messages.connectionslow);
}

function request_server(outbound)
{
    var xhr = new XMLHttpRequest();

    xhrs.push(xhr);
    xhr.open("POST", SERVER, true);
    xhr.timeout = LONG_RESPONSE;
    xhr.onload = process_server_response;
    xhr.onerror = process_response_error;
    xhr.ontimeout = process_timeout_error;
    xhr.setRequestHeader("Cache-Control", "no-cache");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(assemble_keys_values(outbound));
    //DEV//
    log("Request:\t" + assemble_keys_values(outbound));
    //DEV//
}

function pull_server_changes()
{
    request_server({
	s: gamestate,
	a: players.a.nameset,
	b: players.b.nameset,
	u: uniqstr,
    });
}

function process_taken_tile()
{
    tileshidden.pop();
    if (tileshidden.length)
	set_stock_gauge();
    else
	stock.style.display = "none";
    show_message(messages.tooktile);
}

function two_give_tile(event)
{
    stop_event(event);
    if (question) {
	show_message(messages.chooseend);
	return;
    }
    if (gamestate === STATE_PLAYERAB_PUT_MOVE) {
	process_taken_tile();
	request_server({
	    s: gamestate,
	    a: players.a.nameset,
	    b: players.b.nameset,
	    u: uniqstr,
	    t: "",
	});
    } else {
	show_message(messages.wait);
    }
}

function two_process_tied_game(player)
{
    if (find_matching_tiles(player.tiles) || has_stock_tiles()) {
	show_message(messages.nomatchingtile);
    } else {
	gamestate = STATE_PLAYERAB_TOOK_PULL;
	pull_server_changes();
    }
}

function set_down_ends(player)
{
    process_single_matcher();
    downends[last] = matches[last][last];
    draw_tile(matches[last], table, T2D_HORIZONTAL, last, player);
}

function two_process_down_tile(player, choice, inbound)
{
    if (player.who === players.a.who) {
	if (!matchingends) {
	    two_process_tied_game(player);
	    return;
	}
	if (question)
	    question = 0;
	set_down_ends(player);
	request_server({
	    s: gamestate,
	    a: players.a.nameset,
	    b: players.b.nameset,
	    u: uniqstr,
	    t: player.tiles[choice],
	    l: last,
	});
	gamestate = STATE_PLAYERAB_TOOK_PULL;
	player.tiles.splice(choice, 1);
	remove_player_tile(players.a, choice);
	reset_player_ids(players.a);
	show_message(messages.waitingmove);
    } else {
	player.tiles.pop();
	remove_player_tile(players.b, choice);
	find_matching_ends(inbound.t);
	last = inbound.l;
	if (gamestart)
	    do_first_action(inbound.t);
	set_down_ends(player);
	if (gamestate === STATE_PLAYERAB_TOOK_PULL)
	    show_message(players.b.who + messages.moved);
	else
	    show_message(players.b.who + messages.moved + messages.turn);
    }
    //DEV//
    log("last == " + last + "\tdownends == " + get_text_tile(downends));
    //DEV//
}

function decrease_time_left()
{
    timeleft.firstElementChild.innerHTML -= 1;
    timeidleft = setTimeout(decrease_time_left, MINUTE);
}

function show_time_left()
{
    timeleft.style.display = "block";
}

function prepare_game(delta)
{
    var longgame = LONG_GAME - delta * SECOND - get_time_delta(delay);
    var timenote = longgame - LONG_GAME_NOTE;

    if (gameover)
	gameover = 0;
    timeidgame = setTimeout(process_long_game, longgame);
    if (timenote < 0) {
	timeleft.firstElementChild.innerHTML = Math.ceil(longgame / MINUTE);
	show_time_left();
	timeidleft = setTimeout(decrease_time_left, longgame % MINUTE);
    } else {
	timeleft.firstElementChild.innerHTML = LONG_GAME_NOTE / MINUTE;
	timeidshow = setTimeout(show_time_left, timenote);
	timeidleft = setTimeout(decrease_time_left, timenote + MINUTE);
    }
    hide_opened();
    change_controls(CTRLS_DISABLED);
    reset_game(YOU, OPPONENT);
    set_tile_colors();
    process_down_tile = two_process_down_tile;
    //DEV//
    log("Time left: " + (longgame / SECOND) + " s");
    if (timenote < 0)
	log("Next time left note update in: " + (longgame % MINUTE / SECOND) +
	    " s");
    else
	log("Time left note will be shown in: " + (timenote / SECOND) + " s");
    //DEV//
}

function accept_opponent_settings(inbound)
{
    uniqstr = inbound.u;
    controlnodes.fullstock.checked = inbound.f - 0;
    controlnodes.harder.checked = inbound.h - 0;
    controlnodes.numbers.checked = inbound.n - 0;
    prepare_game(inbound.d);
}

function strip_mending(player)
{
    var striped = player.input.value.replace(/_.*/, "$'");

    if (striped)
	return striped;
    else
	return player.who;
}

function finish_game_preparation(inbound)
{
    var name;

    players.a.tiles = inbound.c;
    players.b.tiles = new Array(TILES_PER_PLAYER);
    if (fullstock)
	prepare_full_stock();
    make_players_tiles();
    players.a.nameshown.innerHTML = strip_mending(players.a);
    players.b.nameshown.innerHTML = strip_mending(players.b);
    process_game_change(players.a.nameshown.innerHTML +
			players.b.nameshown.innerHTML);
    if (inbound.s === STATE_PLAYERAB_PUT_MOVE) {
	counters.playerastarts++;
	name = players.a.who;
    } else {
	counters.playerbstarts++;
	name = players.b.who;
    }
    if (inbound.u)
	show_message(messages.acceptedsecond + name + messages.next);
    else
	show_message(messages.opponentjoined + name + messages.next);
}

function two_take_hidden_tile(player, tilehiddenind)
{
    var tile;

    player.tiles.push(tilehiddenind);
    if (player.who === players.a.who) {
	tile = draw_tile(tiles[tilehiddenind].tile, player.node, T2D_VERTICAL,
			 T2D_LAST, player);
	activate_tile(tile, player.node.childNodes.length - 1);
    } else {
	process_taken_tile();
	draw_tile(EMPTY, player.node, T2D_VERTICAL, T2D_LAST, player);
    }
}

function process_game_play(inbound)
{
    var tookcnt;

    if (!gamestate)
	accept_opponent_settings(inbound);
    gamestate = inbound.s;
    if (!inbound.c && !inbound.q && !("t" in inbound)) {
	show_message(messages.waitingmove);
	return;
    }
    if (inbound.c)
	finish_game_preparation(inbound);
    if (inbound.q) {
	tookcnt = inbound.q;
	for (var i = 0; i < tookcnt; i++)
	    two_take_hidden_tile(players.b);
    }
    if ("t" in inbound) {
	if ("l" in inbound)
	    two_process_down_tile(players.b, FIRST, inbound);
	else
	    two_take_hidden_tile(players.a, inbound.t);
    }
}

function delay_server_pull()
{
    timeidpull = setTimeout(pull_server_changes, DELAY_PULL);
}

function process_game_state(inbound)
{
    switch (inbound.s) {
    case STATE_EXIST_END_WAIT:
	if (inbound.c) {
	    gamestate = STATE_EXIST_END_WAIT;
	    clear_long_game_timers();
	    players.b.tiles = inbound.c;
	    starttwo.disabled = "";
	    over_game();
	} else {
	    process_problem(messages.problems[inbound.p]);
	}
	break;
    case STATE_PLAYERA_PULL:
	delay_server_pull();
	if (!gamestate) {
	    gamestate = STATE_PLAYERA_PULL;
	    uniqstr = inbound.u;
	    prepare_game(0);
	    show_message(messages.acceptedfirst);
	} else {
	    show_message(messages.waitingopponent);
	}
	break;
    case STATE_PLAYERAB_TOOK_PULL:
	delay_server_pull();
	process_game_play(inbound);
	break;
    case STATE_PLAYERAB_PUT_MOVE:
	process_game_play(inbound);
	break;
    }
}

function process_server_response()
{
    var len = xhrs.length;

    for (var i = 0; i < len; i++)
	if (xhrs[i].readyState !== HTTP_DONE)
	    return;
    //DEV//
    for (var i = 0; i < len; i++)
	log("Response:\t" + xhrs[i].responseText);
    //DEV//
    for (var i = 0; i < len; i++) {
	if (xhrs[i].responseText.charAt(0) !== JSON_START) {
	    process_problem(messages.connectionlack);
	    confirm_internet_play(NOT_SETUP);
	    return;
	}
	process_game_state(JSON.parse(xhrs[i].responseText));
    }
    xhrs = [];
}

function process_long_game()
{
    gameover = 1;
    process_problem(messages.longgame);
}

function internet_start_game(event)
{
    stop_event(event);
    if (!are_names_valid())
	return;
    players.a.nameset = players.a.input.value;
    players.b.nameset = players.b.input.value;
    location.hash = players.a.nameset + NAME_BREAK + players.b.nameset;
    starttwo.disabled = "disabled";
    gamestate = STATE_EXIST_END_WAIT;
    set_delay_now();
    show_message(messages.starttwo);
    //DEV//
    log("***** internet *****");
    //DEV//
    request_server({
	s: gamestate,
	a: players.a.nameset,
	b: players.b.nameset,
	f: controlnodes.fullstock.checked,
	h: controlnodes.harder.checked,
	n: controlnodes.numbers.checked,
    });
}

function rate_tiles(playertiles, ratedpips, ratedtiles, ratedtileslen)
{
    var tileind;
    var tilerate;
    var tmppipscnt;
    var pipscnt = 0;

    for (var i = 0; i < ratedtileslen; i++) {
	tileind = playertiles[ratedtiles[i][0]];
	if (is_double_tile(tiles[tileind].tile)) {
	    ratedtiles[i][1] += ratedpips[tiles[tileind].tile[0]];
	    ratedtiles[i][1]++;
	    continue;
	}
	for (var j = 0; j < MATCHING_ENDS; j++)
	    if (tiles[tileind].tile[j] !== downends[0] &&
		tiles[tileind].tile[j] !== downends[1]) {
		ratedtiles[i][1] += ratedpips[tiles[tileind].tile[j]];
		break;
	    }
	if (j === MATCHING_ENDS)
	    for (var k = 0; k < MATCHING_ENDS; k++)
		ratedtiles[i][1] += ratedpips[tiles[tileind].tile[k]];
    }
    ratedtiles.sort(
	function(a, b)
	{
	    return b[1] - a[1];
	}
    );
    tilerate = ratedtiles[0][1];
    for (var i = 0; i < ratedtileslen; i++)
	if (tilerate === ratedtiles[i][1]) {
	    tmppipscnt = count_pips([playertiles[ratedtiles[i][0]]]);
	    if (pipscnt <= tmppipscnt) {
		pipscnt = tmppipscnt;
		tileind = ratedtiles[i][0];
	    }
	} else {
	    break;
	}
    return tileind;
}

function show_player_tiles(event)
{
    stop_event(event);
    current.node.removeEventListener("click", show_player_tiles, false);
    make_player_tiles(current);
    if (has_stock_tiles())
	stock.style.display = "block";
    if (current.who === players.b.who)
	switch_players();
    show_message(messages.choosetile);
}

function device_start_game(event)
{
    stop_event(event);
    if (gameover)
	gameover = 0;
    hide_opened();
    change_controls(CTRLS_DISABLED);
    reset_game(LOWER, UPPER);
    distribute_tiles();
    if (fullstock)
	set_stock_gauge();
    set_tile_colors();
    process_down_tile = one_process_down_tile;
    make_player_tiles(players.a, HIDDEN);
    make_player_tiles(players.b, HIDDEN);
    players.a.nameshown.innerHTML = players.a.who;
    players.b.nameshown.innerHTML = players.b.who;
    process_game_change(LOWER);
    gamestate = STATE_PLAYERAB_PUT_MOVE;
    if (get_random_int(0, 1)) {
	counters.playerastarts++;
	arm_player_tiles(players.a);
	show_message(players.a.who + messages.starts);
    } else {
	counters.playerbstarts++;
	arm_player_tiles(players.b);
	show_message(players.b.who + messages.starts);
    }
    //DEV//
    log("***** device *****");
    log("Upper hand:");
    dev__log_player_tiles(players.b);
    log("Lower hand:");
    dev__log_player_tiles(players.a);
    //DEV//
}

function prepare_help_containers()
{
    var helpconts = document.getElementsByClassName("helpcontainer");
    var len = helpconts.length;

    help = ce_("div");
    help.id = "help";
    for (var i = 0; i < len; i++)
	helpconts[i].addEventListener("click", handle_help, false);
    window.addEventListener("resize", redraw_help_container, false);
}

function show_hide_names(event)
{
    stop_event(event);
    help.style.display = "none";
    if (names.style.display !== "block")
	names.style.display = "block";
    else
	names.style.display = "none";
}

function mend_existing_pair(event)
{
    var name;
    var len;
    var str;
    var c;
    var mended;

    stop_event(event);
    for (var p in players) {
	name = players[p].input.value;
	if (name.match(MEND_BREAK))
	    name = name.slice(0, name.indexOf(MEND_BREAK));
	len = players[p].input.maxLength - name.length;
	if (len > 1) {
	    str = MEND_BREAK;
	    for (var i = 1; i < len; i++) {
		c = String.fromCharCode(get_random_int(CHAR_A, CHAR_Z));
		if (i % 2)
		    str += c;
		else
		    str += c.toLowerCase();
	    }
	    players[p].input.value = name + str;
	    mended = 1;
	}
    }
    if (mended)
	show_message(messages.mended);
    else
	show_message(messages.nomend);
}

function add_opponent_link(event)
{
    var addlink;

    stop_event(event);
    if (!are_names_valid())
	return;
    addlink = ce_("a");
    addlink.href = location.protocol + "//" + location.host +
	location.pathname + "#" + players.b.input.value + NAME_BREAK +
	players.a.input.value;
    addlink.target = "_blank";
    addlink.innerHTML = messages.linked;
    show_message("");
    message.appendChild(addlink);
}

function restore_fragment_names()
{
    var names = location.hash.match(/\b\w+\b/g);

    if (!names || names.length !== PLAYER_CNT)
	return;
    players.a.input.value = names[0];
    players.b.input.value = names[1];
}

function extract_meta_description()
{
    var metas = document.head.getElementsByTagName("meta");
    var len = metas.length;

    for (var i = 0; i < len; i++)
	if (metas[i].name === "description") {
	    id_("sitedescription").innerHTML = metas[i].content;
	    break;
	}
}

function select_entropy_generator()
{
    if (window.crypto)
	get_random_int_typed = get_random_int_crypto;
    else
	get_random_int_typed = get_random_int_insecure;
    //DEV//
    if (window.crypto)
	log("PRNG: crypto");
    else
	log("PRNG: insecure");
    //DEV//
}

function initiate()
{
    if (window.atob)
	id_("browsernotfit").style.display = "none";
    else // IE9-
	return;
    players = {
	a: new Player(COLOR_FIRST),
	b: new Player(COLOR_SECOND),
    };
    one = id_("one");
    two = id_("two");
    table = id_("table");
    message = id_("message");
    controls = id_("controls");
    controlnodes.fullstock = id_("fullstock");
    controlnodes.harder = id_("harder");
    controlnodes.numbers = id_("numbers");
    lid = id_("lid");
    stock = id_("stock");
    names = id_("names");
    device = id_("device");
    mend = id_("mend");
    link = id_("link");
    starttwo = id_("starttwo");
    timeleft = id_("timeleft");
    players.a.node = id_("playerahand");
    players.b.node = id_("playerbhand");
    players.a.nameshown = id_("playeraname");
    players.b.nameshown = id_("playerbname");
    players.a.input = id_("playerainput");
    players.b.input = id_("playerbinput");
    one.addEventListener("click", computer_start_game, false);
    two.addEventListener("click", show_hide_names, false);
    device.addEventListener("click", device_start_game, false);
    mend.addEventListener("click", mend_existing_pair, false);
    link.addEventListener("click", add_opponent_link, false);
    starttwo.addEventListener("click", internet_start_game, false);
    confirm_internet_play();
    generate_tiles();
    restore_fragment_names();
    prepare_help_containers();
    extract_meta_description();
    select_entropy_generator();
}

window.addEventListener("load", initiate, false);
//DEV//
/*
//DEV//
})();
//DEV//
*/
//DEV//
// @license-end
