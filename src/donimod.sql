-- DonimoD
--
-- Copyright © 2014 Donatas Klimašauskas
--
-- This file is part of DonimoD.
--
-- DonimoD is free software: you can redistribute it and/or modify
-- it under the terms of the GNU General Public License as published by
-- the Free Software Foundation, either version 3 of the License, or
-- (at your option) any later version.
--
-- DonimoD is distributed in the hope that it will be useful,
-- but WITHOUT ANY WARRANTY; without even the implied warranty of
-- MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
-- GNU General Public License for more details.
--
-- You should have received a copy of the GNU General Public License
-- along with DonimoD.  If not, see <https://www.gnu.org/licenses/>.

-- Relationships among the tables:
-- `players' M(2) to 1 `games'
-- No relations for:
-- `gauges'
-- `abusers'

-- //DEV//
DROP TABLE players;
DROP TABLE games;
DROP TABLE gauges;
DROP TABLE abusers;
-- //DEV//
CREATE TABLE players (
       duo CHAR(200) NOT NULL DEFAULT '',
       game_id CHAR(16) NOT NULL DEFAULT '',
       setup CHAR(1) NOT NULL DEFAULT '',
       move BOOLEAN NOT NULL DEFAULT 0,
       opponent_move CHAR(20) NOT NULL DEFAULT '',
       opponent_took TINYINT UNSIGNED NOT NULL DEFAULT 0,
       game_over BOOLEAN NOT NULL DEFAULT 0,
       pull_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
       PRIMARY KEY (duo(100)),
       INDEX (game_id)
) ENGINE = MEMORY, MAX_ROWS = 5000;
CREATE TABLE games (
       id CHAR(16) NOT NULL DEFAULT '',
       full_stock BOOLEAN NOT NULL DEFAULT 0,
       harder BOOLEAN NOT NULL DEFAULT 0,
       numbers BOOLEAN NOT NULL DEFAULT 0,
       tiles VARCHAR(757) NOT NULL DEFAULT '',
       down_ends CHAR(5) NOT NULL DEFAULT '',
       start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- wait or play
       PRIMARY KEY (id),
       INDEX USING BTREE (start_time)
) ENGINE = MEMORY, MAX_ROWS = 2500;
CREATE TABLE gauges (
       games_played BIGINT UNSIGNED NOT NULL DEFAULT 0,
       full_stock BIGINT UNSIGNED NOT NULL DEFAULT 0,
       harder BIGINT UNSIGNED NOT NULL DEFAULT 0,
       numbers BIGINT UNSIGNED NOT NULL DEFAULT 0,
       total_waiting_time BIGINT UNSIGNED NOT NULL DEFAULT 0,
       total_playing_time BIGINT UNSIGNED NOT NULL DEFAULT 0,
       average_waiting_time BIGINT UNSIGNED NOT NULL DEFAULT 0, -- for Second
       average_playing_time BIGINT UNSIGNED NOT NULL DEFAULT 0,
       shortest SMALLINT UNSIGNED NOT NULL DEFAULT 65535,
       longest SMALLINT UNSIGNED NOT NULL DEFAULT 0,
       start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = INNODB, MAX_ROWS = 1; -- automatic recovery
INSERT INTO gauges SET start_time = NULL; -- initialize
CREATE TABLE abusers (
       ip CHAR(45) NOT NULL DEFAULT '', -- v4 (15), v4 mapped v6 (45), v6 (39)
       line SMALLINT UNSIGNED NOT NULL DEFAULT 0, -- which added a row
       ban_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
       PRIMARY KEY (ip),
       INDEX USING BTREE (ban_time)
) ENGINE = MEMORY, MAX_ROWS = 100000;
