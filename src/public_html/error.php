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

define("ERR_LOG_FILE", "error.log");
define("ERR_LOG_MAX_SIZE", 1 << 20); // 1 MiB soft limit
define("EMAIL_TO", "email@example.com");
define("EMAIL_SUBJECT", "Errors");
define("EMAIL_HEADERS", "Content-Type: text/plain; charset=utf-8\r\n
From: " . EMAIL_TO . "\r\nReply-To: " . EMAIL_TO);

function write_error_exit($line = 0, $msg = "No message")
{
	//DEV//
	$fp;
	exit(1);
	//DEV//
	if (!file_exists(ERR_LOG_FILE))
		exit(1);
	if (filesize(ERR_LOG_FILE) > ERR_LOG_MAX_SIZE) {
		// Send note; despite mail() return, continue on.
		mail(EMAIL_TO, EMAIL_SUBJECT, "Log zeroed", EMAIL_HEADERS);
		$fp = fopen(ERR_LOG_FILE, "wb") or exit(1);
	} else {
		$fp = fopen(ERR_LOG_FILE, "ab") or exit(1);
	}
	fwrite($fp, date("Y-m-d H:i:s") . " \"$line: $msg\" " .
	       gethostbyaddr($_SERVER["REMOTE_ADDR"]) . " " .
	       $_SERVER["REMOTE_ADDR"] . "\n");
	fclose($fp);
	exit(1);
}
?>
