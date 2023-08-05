-- phpMyAdmin SQL Dump
-- version 5.2.1-1.fc36.remi
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Aug 05, 2023 at 08:03 PM
-- Server version: 8.0.33
-- PHP Version: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sibeda`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `cud_data` (IN `in_mode` TEXT, IN `in_table` TEXT, IN `in_username` TEXT, IN `in_data` JSON, OUT `out_response` JSON)  DETERMINISTIC BEGIN
	-- DECLARING VARIABLES
	DECLARE _res_code INT;
	DECLARE _res_message TEXT;
    DECLARE _list_mode TEXT;
    DECLARE _mode TEXT;
    DECLARE _schema TEXT;
    DECLARE _table TEXT;
	DECLARE _user_id INT;
	DECLARE MESSAGE TEXT;

    -- ERROR QUERY HANDLING
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- USE MYSQL_ERRNO -> ERROR NO
        -- USE RETURNED_SQLSTATE -> SQLSTATE
        GET DIAGNOSTICS CONDITION 1 @ERRNO = MYSQL_ERRNO, @MESSAGE_TEXT = MESSAGE_TEXT;

        -- SET RESPONSE
        SET _res_code = @ERRNO;
        SET _res_message = @MESSAGE_TEXT;
        SET out_response = JSON_OBJECT("code", _res_code, "message", _res_message);

        -- IF ANY ERROR OCCURES IT WILL ROLLBACK CHANGE
        ROLLBACK;
    END;
	
    -- SET VARIABLES
	SET _res_code = 200; -- DEFAULT 200 (SUCCESS) || 401 (UNAUTHORIZED) || 101 (MODE NOT REGISTERED) || 102 (SCHEMA OR TABLE NOT FOUND) || 103 (DATA NOT FOUND)
    SET _res_message = NULL;
    SET _list_mode = '["C", "U", "D"]'; -- C (CREATE) || U (UPDATE) || D (DELETE)
    SET _mode = in_mode;
    SET _schema = 'sibeda';
    SET _table = in_table;
    SET _user_id = 0;

    -- ANY QUERY START HERE
    START TRANSACTION;

    -- VALIDATE MODE
    IF (SELECT JSON_CONTAINS(_list_mode, CONCAT('"', UPPER(_mode), '"'), '$')) <> 0 THEN

        -- VALIDATE TABLE
        IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema != "information_schema" AND CONCAT(QUOTE(table_schema), ".", QUOTE(table_name)) = CONCAT(QUOTE(_schema), ".", QUOTE(LOWER(_table)))) THEN

            -- CEK DATA USER
            SELECT id INTO _user_id FROM user WHERE username=in_username AND active;

            -- VALIDATE USER
            IF _user_id <> 0 THEN 

                -- TABLE ACCOUNT_BASE
                IF(LOWER(_table)="account_base") THEN 

                    -- MODE INSERT
                    IF (UPPER(_mode)="C") THEN
                        
                        -- DO INSERT DATA
                        INSERT INTO account_base(label, remark)
                        SELECT * FROM JSON_TABLE(in_data, "$[*]" COLUMNS (
                            `label` TEXT PATH "$.label", 
                            `remark` TEXT PATH "$.remark"
                        ))d;

                        -- DO INSERT LOG
                        CALL set_log(_table, _mode, "{}", in_data, in_username);

                    -- MODE UPDATE
                    ELSEIF (UPPER(_mode)="U") THEN

                        -- VALIDATE ID
                        IF EXISTS(SELECT 1 FROM account_base WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"))) THEN

                            -- DO UPDATE DATA
                            UPDATE account_base 
                            SET label = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].label")), 
                                remark = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].remark"))
                            WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"));

                            -- DO INSERT LOG
                            CALL set_log(_table, _mode, "{}", in_data, in_username);

                        ELSE
                            SET _res_code = 103;
                            SET _res_message = "Data tidak ditemukan";
                        END IF;

                    -- MODE DELETE
                    ELSEIF (UPPER(_mode)='D') THEN 
                    
                        -- VALIDATE ID
                        IF EXISTS(SELECT 1 FROM account_base WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"))) THEN

                            -- DO UPDATE DATA
                            UPDATE account_base 
                            SET active = NOT active
                            WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"));

                            -- DO INSERT LOG
                            CALL set_log(_table, _mode, "{}", in_data, in_username);

                        ELSE
                            SET _res_code = 103;
                            SET _res_message = "Data tidak ditemukan";
                        END IF;

                    END IF;

                -- TABLE ACCOUNT_GROUP
                ELSEIF(LOWER(_table)="account_group") THEN 

                    -- MODE INSERT
                    IF (UPPER(_mode)="C") THEN
                        
                        -- DO INSERT DATA
                        INSERT INTO account_group(account_base_id, label, remark)
                        SELECT * FROM JSON_TABLE(in_data, "$[*]" COLUMNS (
                            `account_base_id` INT PATH "$.account_base_id", 
                            `label` TEXT PATH "$.label", 
                            `remark` TEXT PATH "$.remark"
                        ))d;

                        -- DO INSERT LOG
                        CALL set_log(_table, _mode, "{}", in_data, in_username);

                    -- MODE UPDATE
                    ELSEIF (UPPER(_mode)="U") THEN

                        -- VALIDATE ID
                        IF EXISTS(SELECT 1 FROM account_group WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"))) THEN

                            -- DO UPDATE DATA
                            UPDATE account_group 
                            SET account_base_id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].account_base_id")), 
                                label = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].label")),
                                remark = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].remark"))
                            WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"));

                            -- DO INSERT LOG
                            CALL set_log(_table, _mode, "{}", in_data, in_username);

                        ELSE
                            SET _res_code = 103;
                            SET _res_message = "Data tidak ditemukan";
                        END IF;

                    -- MODE DELETE
                    ELSEIF (UPPER(_mode)='D') THEN 
                    
                        -- VALIDATE ID
                        IF EXISTS(SELECT 1 FROM account_group WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"))) THEN

                            -- DO UPDATE DATA
                            UPDATE account_group 
                            SET active = NOT active
                            WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"));

                            -- DO INSERT LOG
                            CALL set_log(_table, _mode, "{}", in_data, in_username);

                        ELSE
                            SET _res_code = 103;
                            SET _res_message = "Data tidak ditemukan";
                        END IF;

                    END IF;

                -- TABLE ACCOUNT_TYPE
                ELSEIF(LOWER(_table)="account_type") THEN 

                    -- MODE INSERT
                    IF (UPPER(_mode)="C") THEN
                        
                        -- DO INSERT DATA
                        INSERT INTO account_type(account_group_id, label, remark)
                        SELECT * FROM JSON_TABLE(in_data, "$[*]" COLUMNS (
                            `account_group_id` INT PATH "$.account_group_id", 
                            `label` TEXT PATH "$.label", 
                            `remark` TEXT PATH "$.remark"
                        ))d;

                        -- DO INSERT LOG
                        CALL set_log(_table, _mode, "{}", in_data, in_username);

                    -- MODE UPDATE
                    ELSEIF (UPPER(_mode)="U") THEN

                        -- VALIDATE ID
                        IF EXISTS(SELECT 1 FROM account_type WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"))) THEN

                            -- DO UPDATE DATA
                            UPDATE account_type 
                            SET account_group_id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].account_group_id")), 
                                label = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].label")),
                                remark = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].remark"))
                            WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"));

                            -- DO INSERT LOG
                            CALL set_log(_table, _mode, "{}", in_data, in_username);

                        ELSE
                            SET _res_code = 103;
                            SET _res_message = "Data tidak ditemukan";
                        END IF;

                    -- MODE DELETE
                    ELSEIF (UPPER(_mode)='D') THEN 
                    
                        -- VALIDATE ID
                        IF EXISTS(SELECT 1 FROM account_type WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"))) THEN

                            -- DO UPDATE DATA
                            UPDATE account_type 
                            SET active = NOT active
                            WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"));

                            -- DO INSERT LOG
                            CALL set_log(_table, _mode, "{}", in_data, in_username);

                        ELSE
                            SET _res_code = 103;
                            SET _res_message = "Data tidak ditemukan";
                        END IF;

                    END IF;

                -- TABLE ACCOUNT_OBJECT
                ELSEIF(LOWER(_table)="account_object") THEN 

                    -- MODE INSERT
                    IF (UPPER(_mode)="C") THEN
                        
                        -- DO INSERT DATA
                        INSERT INTO account_object(account_type_id, label, remark)
                        SELECT * FROM JSON_TABLE(in_data, "$[*]" COLUMNS (
                            `account_type_id` INT PATH "$.account_type_id", 
                            `label` TEXT PATH "$.label", 
                            `remark` TEXT PATH "$.remark"
                        ))d;

                        -- DO INSERT LOG
                        CALL set_log(_table, _mode, "{}", in_data, in_username);

                    -- MODE UPDATE
                    ELSEIF (UPPER(_mode)="U") THEN

                        -- VALIDATE ID
                        IF EXISTS(SELECT 1 FROM account_object WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"))) THEN

                            -- DO UPDATE DATA
                            UPDATE account_object 
                            SET account_type_id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].account_type_id")), 
                                label = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].label")),
                                remark = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].remark"))
                            WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"));

                            -- DO INSERT LOG
                            CALL set_log(_table, _mode, "{}", in_data, in_username);

                        ELSE
                            SET _res_code = 103;
                            SET _res_message = "Data tidak ditemukan";
                        END IF;

                    -- MODE DELETE
                    ELSEIF (UPPER(_mode)='D') THEN 
                    
                        -- VALIDATE ID
                        IF EXISTS(SELECT 1 FROM account_object WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"))) THEN

                            -- DO UPDATE DATA
                            UPDATE account_object 
                            SET active = NOT active
                            WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"));

                            -- DO INSERT LOG
                            CALL set_log(_table, _mode, "{}", in_data, in_username);

                        ELSE
                            SET _res_code = 103;
                            SET _res_message = "Data tidak ditemukan";
                        END IF;

                    END IF;

                -- TABLE CITY
                ELSEIF(LOWER(_table)="city") THEN 

                    -- MODE INSERT
                    IF (UPPER(_mode)="C") THEN
                        
                        -- DO INSERT DATA
                        INSERT INTO city(label, logo)
                        SELECT * FROM JSON_TABLE(in_data, "$[*]" COLUMNS (
                            `label` TEXT PATH "$.label", 
                            `logo` TEXT PATH "$.logo"
                        ))d;

                        -- DO INSERT LOG
                        CALL set_log(_table, _mode, "{}", in_data, in_username);

                    -- MODE UPDATE
                    ELSEIF (UPPER(_mode)="U") THEN

                        -- VALIDATE ID
                        IF EXISTS(SELECT 1 FROM city WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"))) THEN

                            -- DO UPDATE DATA
                            UPDATE city 
                            SET label = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].label")),
                                logo = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].logo"))
                            WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"));

                            -- DO INSERT LOG
                            CALL set_log(_table, _mode, "{}", in_data, in_username);

                        ELSE
                            SET _res_code = 103;
                            SET _res_message = "Data tidak ditemukan";
                        END IF;

                    -- MODE DELETE
                    ELSEIF (UPPER(_mode)='D') THEN 
                    
                        -- VALIDATE ID
                        IF EXISTS(SELECT 1 FROM city WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"))) THEN

                            -- DO UPDATE DATA
                            UPDATE city 
                            SET active = NOT active
                            WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"));

                            -- DO INSERT LOG
                            CALL set_log(_table, _mode, "{}", in_data, in_username);

                        ELSE
                            SET _res_code = 103;
                            SET _res_message = "Data tidak ditemukan";
                        END IF;

                    END IF;

                -- TABLE SIGNER
                ELSEIF(LOWER(_table)="signer") THEN 

                    -- MODE INSERT
                    IF (UPPER(_mode)="C") THEN
                        
                        -- DO INSERT DATA
                        INSERT INTO signer(nip, fullname, title, position)
                        SELECT * FROM JSON_TABLE(in_data, "$[*]" COLUMNS (
                            `nip` TEXT PATH "$.nip",
                            `fullname` TEXT PATH "$.fullname",
                            `title` TEXT PATH "$.title",
                            `position` TEXT PATH "$.position"
                        ))d;

                        -- DO INSERT LOG
                        CALL set_log(_table, _mode, "{}", in_data, in_username);

                    -- MODE UPDATE
                    ELSEIF (UPPER(_mode)="U") THEN

                        -- VALIDATE ID
                        IF EXISTS(SELECT 1 FROM signer WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"))) THEN

                            -- DO UPDATE DATA
                            UPDATE signer 
                            SET nip = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].nip")),
                                fullname = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].fullname")),
                                title = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].title")),
                                position = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].position"))
                            WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"));

                            -- DO INSERT LOG
                            CALL set_log(_table, _mode, "{}", in_data, in_username);

                        ELSE
                            SET _res_code = 103;
                            SET _res_message = "Data tidak ditemukan";
                        END IF;

                    -- MODE DELETE
                    ELSEIF (UPPER(_mode)='D') THEN 
                    
                        -- VALIDATE ID
                        IF EXISTS(SELECT 1 FROM signer WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"))) THEN

                            -- DO UPDATE DATA
                            UPDATE signer 
                            SET active = NOT active
                            WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"));

                            -- DO INSERT LOG
                            CALL set_log(_table, _mode, "{}", in_data, in_username);

                        ELSE
                            SET _res_code = 103;
                            SET _res_message = "Data tidak ditemukan";
                        END IF;

                    END IF;

                -- TABLE TRANSACTION
                ELSEIF(LOWER(_table)="transaction") THEN 

                    -- MODE INSERT
                    IF (UPPER(_mode)="C") THEN
                        
                        -- DO INSERT DATA
                        INSERT INTO transaction(account_object_id, city_id, plan_amount, real_amount, trans_date)
                        SELECT * FROM JSON_TABLE(in_data, "$[*]" COLUMNS (
                            `account_object_id` INT PATH "$.account_object_id",
                            `city_id` INT PATH "$.city_id",
                            `plan_amount` FLOAT PATH "$.plan_amount",
                            `real_amount` FLOAT PATH "$.real_amount",
                            `trans_date` DATE PATH "$.trans_date"
                        ))d;

                        -- DO INSERT LOG
                        CALL set_log(_table, _mode, "{}", in_data, in_username);

                    -- MODE UPDATE
                    ELSEIF (UPPER(_mode)="U") THEN

                        -- VALIDATE ID
                        IF EXISTS(SELECT 1 FROM transaction WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"))) THEN

                            -- DO UPDATE DATA
                            UPDATE transaction 
                            SET plan_amount = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].plan_amount")),
                                real_amount = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].real_amount"))
                            WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"));

                            -- DO INSERT LOG
                            CALL set_log(_table, _mode, "{}", in_data, in_username);

                        ELSE
                            SET _res_code = 103;
                            SET _res_message = "Data tidak ditemukan";
                        END IF;

                    -- MODE DELETE
                    ELSEIF (UPPER(_mode)='D') THEN 
                    
                        -- VALIDATE ID
                        IF EXISTS(SELECT 1 FROM transaction WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"))) THEN

                            -- DO UPDATE DATA
                            UPDATE transaction 
                            SET active = NOT active
                            WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"));

                            -- DO INSERT LOG
                            CALL set_log(_table, _mode, "{}", in_data, in_username);

                        ELSE
                            SET _res_code = 103;
                            SET _res_message = "Data tidak ditemukan";
                        END IF;

                    END IF;

                -- TABLE USER
                ELSEIF(LOWER(_table)="user") THEN 

                    -- MODE INSERT
                    IF (UPPER(_mode)="C") THEN

                        -- DO INSERT DATA
                        INSERT INTO user(username, password, role_id, city_id, fullname, title)
                        SELECT d.username, generate_password(d.password) AS password, d.role_id, d.city_id, d.fullname, d.title
                        FROM (SELECT * FROM JSON_TABLE(in_data, "$[*]" COLUMNS (
                            `username` TEXT PATH "$.username",
                            `password` TEXT PATH "$.password",
                            `role_id` INT PATH "$.role_id",
                            `city_id` INT PATH "$.city_id",
                            `fullname` TEXT PATH "$.fullname",
                            `title` TEXT PATH "$.title"
                        ))d) d;

                        -- DO INSERT LOG
                        CALL set_log(_table, _mode, "{}", in_data, in_username);

                    -- MODE UPDATE
                    ELSEIF (UPPER(_mode)="U") THEN

                        -- VALIDATE SELF PASSWORD
                        IF COALESCE(JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].username")), "") <> "" AND COALESCE(JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].new_password")), "") <> "" THEN 

                            -- DO UPDATE DATA
                            UPDATE user 
                            SET password = generate_password(JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].new_password")))
                            WHERE username = in_username;
                        
                        ELSE

                            -- VALIDATE ID
                            IF EXISTS(SELECT 1 FROM user WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"))) THEN

                                    -- DO UPDATE DATA
                                    UPDATE user 
                                    SET username = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].username")),
                                        role_id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].role_id")),
                                        city_id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].city_id")),
                                        fullname = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].fullname")),
                                        title = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].title"))
                                    WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"));

                                    -- CHECK NEW PASSWORD
                                    IF COALESCE(JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].password")), "") <> "" THEN 
                                        
                                        -- DO UPDATE DATA
                                        UPDATE user 
                                        SET password = generate_password(JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].password")))
                                        WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"));
                                        
                                    END IF;

                            ELSE
                                SET _res_code = 103;
                                SET _res_message = "Data tidak ditemukan";
                            END IF;

                        END IF;

                        -- DO INSERT LOG
                        CALL set_log(_table, _mode, "{}", in_data, in_username);
                    -- MODE DELETE
                    ELSEIF (UPPER(_mode)='D') THEN 
                    
                        -- VALIDATE ID
                        IF EXISTS(SELECT 1 FROM user WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"))) THEN

                            -- DO UPDATE DATA
                            UPDATE user 
                            SET active = NOT active
                            WHERE id = JSON_UNQUOTE(JSON_EXTRACT(in_data, "$[0].id"));

                            -- DO INSERT LOG
                            CALL set_log(_table, _mode, "{}", in_data, in_username);

                        ELSE
                            SET _res_code = 103;
                            SET _res_message = "Data tidak ditemukan";
                        END IF;

                    END IF;

                END IF;

            ELSE
                SET _res_code = 401;
                SET _res_message = "Nama Pengguna tidak ditemukan";
            END IF;

        ELSE
            SET _res_code = 102;
            SET _res_message = "Schema atau Table tidak ditemukan";
        END IF;
    ELSE
    	SET _res_code = 101;
        SET _res_message = "Mode belum terdaftar";
    END IF;

    -- SET RESPONSE
    SET out_response = JSON_OBJECT("code", _res_code, "message", _res_message, "data", in_data);

    -- IT IS NECESSARY IN TRANSACTION
    COMMIT;

END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `list_data` (IN `in_username` TEXT, IN `in_function` TEXT, IN `in_filter` JSON, IN `in_order` TEXT, IN `in_limit` INT, IN `in_offset` INT, OUT `out_response` JSON)  DETERMINISTIC BEGIN
	-- DECLARING VARIABLES
	DECLARE _res_code INT;
	DECLARE _res_message TEXT;
	DECLARE _res_data JSON;
	DECLARE _res_total INT;
	DECLARE _list_function TEXT;
    DECLARE _sql_default TEXT;
	DECLARE _column_json_default TEXT;
    DECLARE _sql TEXT;
	DECLARE _filter TEXT;
	DECLARE _order TEXT;
	DECLARE _user_id INT; 
	DECLARE _user_city_id INT;
	DECLARE _user_role_id INT;
	DECLARE _user_role_exception JSON;
    DECLARE _user_role_clause TEXT;


    -- ERROR QUERY HANDLING
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- USE MYSQL_ERRNO -> ERROR NO
        -- USE RETURNED_SQLSTATE -> SQLSTATE
        GET DIAGNOSTICS CONDITION 1 @ERRNO = MYSQL_ERRNO, @MESSAGE_TEXT = MESSAGE_TEXT;

        -- SET RESPONSE
        SET _res_code = @ERRNO;
        SET _res_message = @MESSAGE_TEXT;
        -- FOR DEVELOPMENT
        SET out_response = JSON_OBJECT("code", _res_code, "message", _res_message, "query", @sql);
        -- FOR PRODUCTION
        -- SET out_response = JSON_OBJECT("code", _res_code, "message", _res_message);

        -- IF ANY ERROR OCCURES IT WILL ROLLBACK CHANGE
        ROLLBACK;
    END;   
	
    -- SET VARIABLES
	SET _res_code = 200; -- DEFAULT 200 (SUCCESS) || 401 (UNAUTHORIZED) || 101 (LIST FUNCTION NOT REGISTERED)
    SET _res_message = NULL;
    SET _res_data = NULL;
    SET _res_total = 0;
    SET _list_function = '["list_account_base", "list_account_group", "list_account_type", "list_account_object", "list_city", "list_role", "list_signer", "list_account_object_transaction"]';
    SET _sql_default = "SELECT * FROM r WHERE TRUE";
    SET _column_json_default = "'id', id, 'value', value, 'label', label";
    SET _filter = "";
    SET _order = "";
    SET _user_id = 0;
    SET _user_role_clause = "";

    -- ANY QUERY START HERE
    START TRANSACTION;

	-- CEK DATA USER
    SELECT id, city_id, role_id INTO _user_id, _user_city_id, _user_role_id FROM user WHERE username=in_username AND active;

    -- DATA USER ROLE EXCEPTION
    SELECT CAST(value AS JSON) INTO _user_role_exception FROM setting WHERE name = 'role_exception';
    
    -- VALIDATE USER
    IF _user_id <> 0 THEN

    	-- VALIDATE CITY
        IF EXISTS(SELECT 1 FROM city WHERE id = _user_city_id AND active) THEN
    
            -- VALIDATE FUNCTION
            IF (SELECT JSON_CONTAINS(_list_function, CONCAT('"', LOWER(in_function), '"'), '$')) <> 0 THEN
            
                -- LIST ACCOUNT BASE
                IF LOWER(in_function)="list_account_base" THEN
                    -- SET SQL
                    SET @sql_target = "
                        WITH r AS (
                            SELECT id, id AS value, CONCAT('(',label,') ', remark) AS label 
                            FROM account_base 
                            WHERE active
                        )
                    ";

                -- LIST ACCOUNT GROUP
                ELSEIF LOWER(in_function)="list_account_group" THEN
                    -- SET SQL
                    SET @sql_target = "
                        WITH r AS (
                            SELECT ag.id, ag.id AS value, CONCAT('(',CONCAT_WS('.', ab.label, ag.label), ') ', ag.remark) AS label 
                            FROM account_group ag 
                            JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active 
                            WHERE ag.active
                        )
                    ";

                -- LIST ACCOUNT TYPE
                ELSEIF LOWER(in_function)="list_account_type" THEN
                    -- SET SQL
                    SET @sql_target = "
                        WITH r AS (
                            SELECT at.id, at.id AS value, CONCAT('(',CONCAT_WS('.', ab.label, ag.label, at.label), ') ', at.remark) AS label 
                            FROM account_type at 
                            JOIN account_group ag ON ag.id=at.account_group_id AND ag.active 
                            JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active 
                            WHERE at.active
                        )
                    ";

                -- LIST ACCOUNT OBJECT
                ELSEIF LOWER(in_function)="list_account_object" THEN
                    -- SET SQL
                    SET @sql_target = "
                        WITH r AS (
                            SELECT ao.id, ao.id AS value, CONCAT('(',CONCAT_WS('.', ab.label, ag.label, at.label, ao.label), ') ', ao.remark) AS label 
                            FROM account_object ao 
                            JOIN account_type at ON at.id=ao.account_type_id AND at.active 
                            JOIN account_group ag ON ag.id=at.account_group_id AND ag.active 
                            JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active 
                            WHERE ao.active
                        )
                    ";

                -- LIST CITY
                ELSEIF LOWER(in_function)="list_city" THEN
                    -- SET SQL
                    SET @sql_target = "WITH r AS (SELECT id, id AS value, label FROM city WHERE active)";
                    
                    -- ROLE EXCEPTION
                    IF (SELECT JSON_CONTAINS(_user_role_exception, CONCAT('"', _user_role_id, '"'), "$")) <> 1 THEN
                        -- REMOVE KEY JSON
                        SELECT JSON_REMOVE(in_filter, '$.id') INTO in_filter;

                        -- SET KEY:VALUE JSON
                        SELECT JSON_MERGE(in_filter, CONCAT('{"id":', _user_city_id, '}')) INTO in_filter;
                    END IF;

                    -- SET FILTER
                    SELECT generate_filter(in_filter, "city", "") INTO _filter;
                    SET _sql_default = CONCAT(_sql_default, " ", _filter);

                -- LIST ROLE
                ELSEIF LOWER(in_function)="list_role" THEN
                    -- SET SQL
                    SET @sql_target = "WITH r AS (SELECT id, id AS value, remark AS label FROM role)";

                -- LIST SIGNER
                ELSEIF LOWER(in_function)="list_signer" THEN
                    -- SET SQL
                    SET @sql_target = "WITH r AS (SELECT id, id AS value, fullname AS label, nip, title, position FROM signer WHERE active)";

                    -- ADDITIONAL COLUMN JSON
                    SET _column_json_default = CONCAT(_column_json_default, ", 'nip', nip, 'title', title, 'position', position");

                -- LIST ACCOUNT OBJECT TRANSACTION
                ELSEIF LOWER(in_function)="list_account_object_transaction" THEN
                
                    -- CHECK MODE
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.use_mode"))), "") = "plan" THEN

                        -- SET SQL
                        SET @sql_target = CONCAT("
                           WITH p AS (
                                SELECT 
                                    MAX(st.id) transaction_id, st.account_object_id
                                FROM transaction st
                                JOIN city c ON c.id=st.city_id AND c.active 
                                WHERE st.active 
                                    AND st.plan_amount >= 0 AND st.real_amount = 0
                                    AND YEAR(st.trans_date) = YEAR(CURRENT_DATE)
                                    AND st.city_id=", _user_city_id, "
                                GROUP BY YEAR(st.trans_date), st.account_object_id, st.city_id
                            ), r AS (
                                SELECT
                                    ao.id, ao.id AS value, 
                                    CONCAT('(',CONCAT_WS('.', ab.label, ag.label, at.label,ao.label), ') ', ao.remark) AS label
                                FROM account_object ao
                                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active
                                LEFT JOIN p ON p.account_object_id=ao.id
                                WHERE p.transaction_id IS NULL
                            )
                        ");
                    ELSEIF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.use_mode"))), "") = "real" THEN
                    
                        -- SET SQL
                        SET @sql_target = CONCAT("
                           WITH p AS (
                                SELECT 
                                    MAX(st.id) transaction_id, st.account_object_id
                                FROM transaction st
                                JOIN city c ON c.id=st.city_id AND c.active 
                                WHERE st.active 
                                    AND st.plan_amount >= 0 AND st.real_amount = 0
                                    AND YEAR(st.trans_date) = YEAR(CURRENT_DATE)
                                    AND st.city_id=", _user_city_id, "
                                GROUP BY YEAR(st.trans_date), st.account_object_id, st.city_id
                            ), r AS (
                                SELECT
                                    ao.id, ao.id AS value, 
                                    CONCAT('(',CONCAT_WS('.', ab.label, ag.label, at.label,ao.label), ') ', ao.remark) AS label
                                FROM account_object ao
                                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active
                                LEFT JOIN p ON p.account_object_id=ao.id
                                WHERE p.transaction_id IS NOT NULL
                            )
                        ");
                    END IF;

                END IF;
                
                -- SET ORDER
                IF COALESCE(in_order, "") <> "" THEN
                    SET _sql_default = CONCAT(_sql_default, " ORDER BY ", in_order);
                    SET _order = CONCAT("ORDER BY ", in_order);
                END IF;
                
                -- SET LIMIT
                IF COALESCE(in_limit, 0) > 0 THEN
                    SET _sql_default = CONCAT(_sql_default, " LIMIT ", in_limit);
                END IF;
                
                -- SET OFFSET
                IF COALESCE(in_offset, 0) > 0 THEN
                    SET _sql_default = CONCAT(_sql_default, " OFFSET ", in_offset);
                END IF;

                -- EXECUTE QUERY
                SET @query = CONCAT(@sql_target, ", rcd AS (", _sql_default, ") SELECT CONCAT('[', GROUP_CONCAT(JSON_OBJECT(", _column_json_default, ") ", _order,"), ']'), COUNT(*) FROM rcd INTO @data, @total");
                PREPARE QUERY FROM @query;
                EXECUTE QUERY;
                
                -- SET TO RESPONSE
                SET _res_data = @data;
                SET _res_total = @total;
                
                -- CLEAR QUERY
                DEALLOCATE PREPARE QUERY;
                
            ELSE
                SET _res_code = 101;
                SET _res_message = "Fungsi belum terdaftar";
            END IF;

        ELSE
    		SET _res_code = 401;
        	SET _res_message = "Data Kota tidak ditemukan, silahkan hubungi admin";
        END IF;
        
    ELSE
    	SET _res_code = 401;
        SET _res_message = "User Tidak ditemukan";
    END IF;
    
    -- FOR DEVELOPMENT
    SET out_response = JSON_OBJECT("code", _res_code, "message", _res_message, "data", _res_data, "total", _res_total, "query", @query);
    
    -- FOR PRODUCTION
    -- SET out_response = JSON_OBJECT("code", _res_code, "message", _res_message, "data", _res_data, "total", _res_total);

    -- IT IS NECESSARY IN TRANSACTION
    COMMIT;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `read_data` (IN `in_username` TEXT, IN `in_function` TEXT, IN `in_filter` JSON, IN `in_order` TEXT, IN `in_limit` INT, IN `in_offset` INT, OUT `out_response` JSON)   BEGIN
	-- DECLARING VARIABLES
	DECLARE _res_code INT;
	DECLARE _res_message TEXT;
	DECLARE _res_data JSON;
	DECLARE _res_total INT;
	DECLARE _list_function TEXT;
    DECLARE _sql_default TEXT;
	DECLARE _filter TEXT;
	DECLARE _inline_filter TEXT;
	DECLARE _first_date TEXT;
	DECLARE _last_date TEXT;
	DECLARE _order TEXT;
	DECLARE _user_id INT;
	DECLARE _user_city_id INT;
	DECLARE _user_role_id INT;
	DECLARE _user_role_exception JSON;
    DECLARE _user_role_clause TEXT;

    -- ERROR QUERY HANDLING
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- USE MYSQL_ERRNO -> ERROR NO
        -- USE RETURNED_SQLSTATE -> SQLSTATE
        GET DIAGNOSTICS CONDITION 1 @ERRNO = MYSQL_ERRNO, @MESSAGE_TEXT = MESSAGE_TEXT;

        -- SET RESPONSE
        SET _res_code = @ERRNO;
        SET _res_message = @MESSAGE_TEXT;
        -- FOR DEVELOPMENT
        SET out_response = JSON_OBJECT("code", _res_code, "message", _res_message, "query", @query);
        -- FOR PRODUCTION
        -- SET out_response = JSON_OBJECT("code", _res_code, "message", _res_message);

        -- IF ANY ERROR OCCURES IT WILL ROLLBACK CHANGE
        ROLLBACK;
    END;
	
    -- SET VARIABLES
	SET _res_code = 200; -- DEFAULT 200 (SUCCESS) || 401 (UNAUTHORIZED) || 101 (LIST FUNCTION NOT REGISTERED)
    SET _res_message = NULL;
    SET _res_data = NULL;
    SET _res_total = 0;
    SET _list_function = '["get_account_base", "get_account_group", "get_account_type", "get_account_object", "get_city", "get_role", "get_user", "get_signer", "get_transaction", "get_last_transaction", "get_real_plan_cities", "get_recapitulation_cities", "get_dashboard", "get_dashboard_recap_years"]';
    SET _sql_default = "SELECT * FROM r WHERE TRUE";
    SET _filter = "";
    SET _inline_filter = "";
    SET _order = "";
    SET _user_id = 0;
    SET _user_role_clause = "";
    SET @column_json = "";

    -- ANY QUERY START HERE
    START TRANSACTION;

	-- CEK DATA USER
    SELECT id, city_id, role_id INTO _user_id, _user_city_id, _user_role_id FROM user WHERE username=in_username AND active;

    -- DATA USER ROLE EXCEPTION
    SELECT CAST(value AS JSON) INTO _user_role_exception FROM setting WHERE name = 'role_exception';
    
    -- VALIDATE USER
    IF _user_id <> 0 THEN

    	-- VALIDATE CITY
        IF EXISTS(SELECT 1 FROM city WHERE id = _user_city_id AND active) THEN
    
            -- VALIDATE FUNCTION
            IF (SELECT JSON_CONTAINS(_list_function, CONCAT('"', LOWER(in_function), '"'), '$')) <> 0 THEN
            
                -- GET ACCOUNT BASE
                IF LOWER(in_function)="get_account_base" THEN
                    -- SET COLUMN JSON RESULT
                    SHOW COLUMNS
                    FROM account_base
                    WHERE @column_json := TRIM(", " FROM CONCAT("'", Field, "', ", Field, ", ", @column_json));
                    
                    -- SET SQL
                    SET @sql_target = "WITH r AS (SELECT * FROM account_base)";
                    
                    -- SET FILTER
                    SELECT generate_filter(in_filter, "account_base", "") INTO _filter;
                    SET _sql_default = CONCAT(_sql_default, " ", _filter);
                    
                -- GET ACCOUNT GROUP
                ELSEIF LOWER(in_function)="get_account_group" THEN
                    -- SET COLUMN JSON RESULT
                    SHOW COLUMNS
                    FROM account_group
                    WHERE @column_json := TRIM(", " FROM CONCAT("'", Field, "', ", Field, ", ", @column_json));

                    -- ADDITIONAL COLUMN JSON RESULT
                    SET @column_json = CONCAT("'account_base_label', account_base_label, ", @column_json);
                    
                    -- SET SQL
                    SET @sql_target = "
                        WITH r AS (
                            SELECT 
                                ag.*, CONCAT('(',ab.label, ') ', ab.remark) AS account_base_label 
                            FROM account_group ag 
                            JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active
                        )
                    ";
                    
                    -- SET FILTER DYNAMIC
                    SELECT generate_filter(in_filter, "account_group", "") INTO _filter;

                    -- SET FILTER ADDITIONAL
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.account_base_label"))), "") <> "" THEN
                        SET _filter = CONCAT(_filter, " AND account_base_label LIKE '%", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.account_base_label")), "%'");
                    END IF;

                    SET _sql_default = CONCAT(_sql_default, " ", _filter);
                    
                -- GET ACCOUNT TYPE
                ELSEIF LOWER(in_function)="get_account_type" THEN
                    -- SET COLUMN JSON RESULT
                    SHOW COLUMNS
                    FROM account_type
                    WHERE @column_json := TRIM(", " FROM CONCAT("'", Field, "', ", Field, ", ", @column_json));

                    -- ADDITIONAL COLUMN JSON RESULT
                    SET @column_json = CONCAT("'account_group_label', account_group_label, ", @column_json);
                    
                    -- SET SQL
                    SET @sql_target = "
                        WITH r AS (
                            SELECT 
                                at.*, CONCAT('(',CONCAT_WS('.', ab.label, ag.label), ') ', ag.remark) AS account_group_label 
                            FROM account_type at 
                            JOIN account_group ag ON ag.id=at.account_group_id AND ag.active 
                            JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active
                        )
                    ";
                    
                    -- SET FILTER
                    SELECT generate_filter(in_filter, "account_type", "") INTO _filter;

                    -- SET FILTER ADDITIONAL
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.account_group_label"))), "") <> "" THEN
                        SET _filter = CONCAT(_filter, " AND account_group_label LIKE '%", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.account_group_label")), "%'");
                    END IF;

                    SET _sql_default = CONCAT(_sql_default, " ", _filter);

                -- GET ACCOUNT OBJECT
                ELSEIF LOWER(in_function)="get_account_object" THEN
                    -- SET COLUMN JSON RESULT
                    SHOW COLUMNS
                    FROM account_object
                    WHERE @column_json := TRIM(", " FROM CONCAT("'", Field, "', ", Field, ", ", @column_json));

                    -- ADDITIONAL COLUMN JSON RESULT
                    SET @column_json = CONCAT("'account_type_label', account_type_label, 'account_object_label', account_object_label, ", @column_json);
                    
                    -- SET SQL
                    SET @sql_target = "
                        WITH r AS (
                            SELECT 
                                ao.*, 
                                CONCAT('(',CONCAT_WS('.', ab.label, ag.label, at.label), ') ', at.remark) AS account_type_label, 
                                CONCAT('(',CONCAT_WS('.', ab.label, ag.label, at.label,ao.label), ') ', ao.remark) AS account_object_label 
                            FROM account_object ao 
                            JOIN account_type at ON at.id=ao.account_type_id AND at.active 
                            JOIN account_group ag ON ag.id=at.account_group_id AND ag.active 
                            JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active
                        )
                    ";
                    -- SET FILTER
                    SELECT generate_filter(in_filter, "account_object", "") INTO _filter;

                    -- SET FILTER ADDITIONAL
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.account_type_label"))), "") <> "" THEN
                        SET _filter = CONCAT(_filter, " AND account_type_label LIKE '%", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.account_type_label")), "%'");
                    END IF;
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.account_object_label"))), "") <> "" THEN
                        SET _filter = CONCAT(_filter, " AND account_object_label LIKE '%", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.account_object_label")), "%'");
                    END IF;

                    SET _sql_default = CONCAT(_sql_default, " ", _filter);

                -- GET CITY
                ELSEIF LOWER(in_function)="get_city" THEN
                    -- SET COLUMN JSON RESULT
                    SHOW COLUMNS
                    FROM city
                    WHERE @column_json := TRIM(", " FROM CONCAT("'", Field, "', ", Field, ", ", @column_json));

                    -- SET SQL
                    SET @sql_target = "WITH r AS (SELECT c.* FROM city c)";

                    -- SET FILTER
                    SELECT generate_filter(in_filter, "city", "") INTO _filter;
                    SET _sql_default = CONCAT(_sql_default, " ", _filter);

                -- GET SIGNER
                ELSEIF LOWER(in_function)="get_signer" THEN
                    -- SET COLUMN JSON RESULT
                    SHOW COLUMNS
                    FROM signer
                    WHERE @column_json := TRIM(", " FROM CONCAT("'", Field, "', ", Field, ", ", @column_json));
                    
                    -- SET SQL
                    SET @sql_target = "WITH r AS (SELECT * FROM signer)";
                    
                    -- SET FILTER
                    SELECT generate_filter(in_filter, "signer", "") INTO _filter;
                    SET _sql_default = CONCAT(_sql_default, " ", _filter);

                -- GET USER
                ELSEIF LOWER(in_function)="get_user" THEN
                    -- ADDITIONAL COLUMN JSON RESULT
                    SET @column_json = "'id', id, 'username', username, 'role_id', role_id, 'city_id', city_id, 'fullname', fullname, 'title', title, 'active', active";
                    
                    -- SET SQL
                    SET @sql_target = "
                        WITH r AS (
                            SELECT 
                                id, username, role_id, city_id, fullname, title, active 
                            FROM user
                        )
                    ";
                    
                    -- SET FILTER
                    SELECT generate_filter(in_filter, "user", "") INTO _filter;
                    SET _sql_default = CONCAT(_sql_default, " ", _filter);

                -- GET ROLE
                ELSEIF LOWER(in_function)="get_role" THEN
                    -- SET COLUMN JSON RESULT
                    SHOW COLUMNS
                    FROM role
                    WHERE @column_json := TRIM(", " FROM CONCAT("'", Field, "', ", Field, ", ", @column_json));
                    
                    -- SET SQL
                    SET @sql_target = "WITH r AS (SELECT * FROM role)";

                    -- SET FILTER
                    SELECT generate_filter(in_filter, "role", "") INTO _filter;
                    SET _sql_default = CONCAT(_sql_default, " ", _filter);

                -- GET TRANSACTION
                ELSEIF LOWER(in_function)="get_transaction" THEN
                    -- ADDITIONAL COLUMN JSON RESULT
                    SET @column_json = "'id', id, 'account_object_id', account_object_id, 'city_id', city_id, 'plan_amount', plan_amount, 'real_amount', real_amount, 'trans_date', trans_date, 'active', active, 'city_label', city_label, 'account_object_label', account_object_label, 'is_editable', is_editable";
                    
                    -- CHECK MODE
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.use_mode"))), "") = "plan" THEN

                        -- SET SQL
                        SET @sql_target = "
                            WITH p AS (
                                SELECT 
                                    MIN(id) plan_id
                                FROM transaction
                                WHERE plan_amount >= 0 AND real_amount = 0
                                GROUP BY YEAR(trans_date), account_object_id, city_id
                            ), r AS (
                                SELECT 
                                    st.*, c.label AS city_label, CONCAT('(', CONCAT_WS('.', ab.label, ag.label, at.label, ao.label), ') ', ao.remark) AS account_object_label,
                                    YEAR(st.trans_date) = YEAR(CURRENT_DATE) AS is_editable
                                FROM transaction st
                                JOIN city c ON c.id=st.city_id AND c.active
                                JOIN account_object ao ON ao.id=st.account_object_id AND ao.active
                                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active
                                WHERE st.id IN (SELECT plan_id FROM p)
                            )
                        ";
                    ELSEIF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.use_mode"))), "") = "real" THEN
                    
                        -- SET SQL
                        SET @sql_target = "
                            WITH p AS (
                                SELECT 
                                    MIN(id) plan_id
                                FROM transaction
                                WHERE plan_amount >= 0 AND real_amount = 0
                                GROUP BY YEAR(trans_date), account_object_id, city_id
                            ), r AS (
                                SELECT 
                                    st.*, c.label AS city_label, CONCAT('(', CONCAT_WS('.', ab.label, ag.label, at.label, ao.label), ') ', ao.remark) AS account_object_label,
                                    YEAR(st.trans_date) = YEAR(CURRENT_DATE) AS is_editable
                                FROM transaction st
                                JOIN city c ON c.id=st.city_id AND c.active
                                JOIN account_object ao ON ao.id=st.account_object_id AND ao.active
                                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active
                                WHERE st.id NOT IN (SELECT plan_id FROM p)
                            )
                        ";
                    END IF;

                    -- ROLE EXCEPTION
                    IF (SELECT JSON_CONTAINS(_user_role_exception, CONCAT('"', _user_role_id, '"'), "$")) <> 1 THEN
                        -- REMOVE KEY JSON
                        SELECT JSON_REMOVE(in_filter, '$.city_id') INTO in_filter;
                        SELECT JSON_REMOVE(in_filter, '$.active') INTO in_filter;

                        -- SET KEY:VALUE JSON
                        SELECT JSON_MERGE(in_filter, CONCAT('{"city_id":', _user_city_id, ', "active":1}')) INTO in_filter;
                    END IF;

                    -- SET FILTER ADDITIONAL
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.id"))), "") <> "" THEN
                        SET _filter = CONCAT(_filter, " AND id = ", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.id")));
                    END IF;
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.account_object_id"))), "") <> "" THEN
                        SET _filter = CONCAT(_filter, " AND account_object_id = ", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.account_object_id")));
                    END IF;
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.city_id"))), "") <> "" THEN
                        SET _filter = CONCAT(_filter, " AND city_id = ", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.city_id")));
                    END IF;
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.plan_amount"))), "") <> "" THEN
                        SET _filter = CONCAT(_filter, " AND plan_amount = ", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.plan_amount")));
                    END IF;
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.real_amount"))), "") <> "" THEN
                        SET _filter = CONCAT(_filter, " AND real_amount = ", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.real_amount")));
                    END IF;
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.trans_date"))), "") <> "" THEN
                        SET _filter = CONCAT(_filter, " AND trans_date = '", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.trans_date")), "'");
                    END IF;
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.trans_date_start"))), "") <> "" AND COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.trans_date_end"))), "") <> "" THEN
                        SET _filter = CONCAT(_filter, " AND trans_date >= '", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.trans_date_start")), "'");
                        SET _filter = CONCAT(_filter, " AND trans_date <= '", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.trans_date_end")), "'");
                    END IF;
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.active"))), "") <> "" THEN
                        SET _filter = CONCAT(_filter, " AND active =", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.active")));
                    END IF;

                    SET _sql_default = CONCAT(_sql_default, " ", _filter);

                -- GET LAST TRANSACTION
                ELSEIF LOWER(in_function)="get_last_transaction" THEN
                    -- SET COLUMN JSON RESULT
                    SHOW COLUMNS
                    FROM transaction
                    WHERE @column_json := TRIM(", " FROM CONCAT("'", Field, "', ", Field, ", ", @column_json));
                    
                    -- SET SQL
                    SET @sql_target = "
                        WITH p AS (
                            SELECT 
                                MIN(id) plan_id
                            FROM transaction
                            WHERE plan_amount >= 0 AND real_amount = 0
                            GROUP BY YEAR(trans_date), account_object_id, city_id
                        ), r AS (
                            SELECT st.* FROM transaction st
                            JOIN city c ON c.id=st.city_id AND c.active
                            LEFT JOIN p ON p.plan_id=st.id
                            WHERE st.active
                        )
                    ";

                    -- ROLE EXCEPTION
                    IF (SELECT JSON_CONTAINS(_user_role_exception, CONCAT('"', _user_role_id, '"'), "$")) <> 1 THEN
                        -- REMOVE KEY JSON
                        SELECT JSON_REMOVE(in_filter, '$.city_id') INTO in_filter;

                        -- SET KEY:VALUE JSON
                        SELECT JSON_MERGE(in_filter, CONCAT('{"city_id":', _user_city_id, '}')) INTO in_filter;
                    END IF;

                    -- SET FILTER
                    SELECT generate_filter(in_filter, "transaction", "") INTO _filter;
                    SET _sql_default = CONCAT(_sql_default, " ", _filter);

                -- GET PLAN AND REAL OF CITIES
                ELSEIF LOWER(in_function)="get_real_plan_cities" THEN
                    -- ADDITIONAL COLUMN JSON RESULT
                    SET @column_json = "'account_base_id', account_base_id, 'account_base_label', account_base_label, 'account_group_id', account_group_id, 'account_group_label', account_group_label, 'account_type_id', account_type_id, 'account_type_label', account_type_label, 'account_object_id', account_object_id, 'account_object_label', account_object_label, 'city_id', city_id, 'city_label', city_label, 'account_object_plan_amount', account_object_plan_amount, 'account_object_real_amount', account_object_real_amount, 'trans_date', trans_date, 'account_base_plan_amount', account_base_plan_amount, 'account_base_real_amount', account_base_real_amount, 'account_group_plan_amount', account_group_plan_amount, 'account_group_real_amount', account_group_real_amount, 'account_type_plan_amount', account_type_plan_amount, 'account_type_real_amount', account_type_real_amount";
                   
                    -- INLINE FILTER
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.trans_date_start"))), "") <> "" AND COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.trans_date_end"))), "") <> "" THEN
                        SET _inline_filter = CONCAT(_inline_filter, " AND r.trans_date >= '", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.trans_date_start")), "'");
                        SET _inline_filter = CONCAT(_inline_filter, " AND r.trans_date <= '", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.trans_date_end")), "'");
                    END IF;

                    -- SET SQL
                    SET @sql_target = CONCAT("
                        WITH aol AS (
                            SELECT  
                                sab.id AS account_base_id, 
                                CONCAT('(',CONCAT_WS('.', sab.label),') ', sab.remark) AS account_base_label,
                                sag.id AS account_group_id, 
                                CONCAT('(',CONCAT_WS('.', sab.label, sag.label),') ', sag.remark) AS account_group_label,
                                sat.id AS account_type_id, 
                                CONCAT('(',CONCAT_WS('.', sab.label, sag.label, sat.label),') ', sat.remark) AS account_type_label,
                                sao.id AS account_object_id, 
                                CONCAT('(',CONCAT_WS('.', sab.label, sag.label, sat.label, sao.label),') ', sao.remark) AS account_object_label
                            FROM account_base sab
                            JOIN account_group sag ON sag.account_base_id=sab.id AND sag.active
                            JOIN account_type sat ON sat.account_group_id=sag.id AND sat.active
                            JOIN account_object sao ON sao.account_type_id=sat.id AND sao.active
                            WHERE sab.active
                        ), p AS (
                            SELECT 
                                MIN(id) plan_id
                            FROM transaction
                            WHERE plan_amount >= 0 AND real_amount = 0
                            GROUP BY account_object_id, city_id, EXTRACT(YEAR FROM trans_date)
                        ), anggaran AS (
                            SELECT 
                                st.account_object_id,
                                st.city_id,
                                c.label AS city_label,
                                c.logo AS city_logo,
                                st.plan_amount,
                                st.trans_date
                            FROM transaction st
                            JOIN city c ON c.id=st.city_id AND c.active
                            JOIN p ON p.plan_id=st.id
                        ), realisasi AS (
                            SELECT
                                st.account_object_id,
                                st.city_id,
                                st.real_amount,
                                st.trans_date
                            FROM transaction st
                            JOIN city c ON c.id=st.city_id AND c.active
                            WHERE st.id NOT IN (SELECT plan_id FROM p)
                            ORDER BY st.trans_date DESC
                        ), mt AS (
                            SELECT 
                                a.account_object_id,
                                a.city_id,
                                a.city_label,
                                a.city_logo,
                                COALESCE(a.plan_amount,0) AS plan_amount,
                                COALESCE((SELECT MAX(r.real_amount)),0) AS real_amount,
                                COALESCE((SELECT MAX(r.trans_date)), a.trans_date) AS trans_date
                            FROM anggaran a
                            LEFT JOIN realisasi r ON r.account_object_id=a.account_object_id 
                                AND r.city_id=a.city_id
                                AND EXTRACT(YEAR FROM r.trans_date)=EXTRACT(YEAR FROM a.trans_date)
                                ", _inline_filter, "
                            GROUP BY a.account_object_id, a.city_id, a.city_label, a.city_logo, a.plan_amount, a.trans_date
                        ), sab AS (
                            SELECT 
                                aol.account_base_id,
                                mt.city_id, 
                                SUM(mt.plan_amount) as account_base_plan_amount,
                                SUM(mt.real_amount) as account_base_real_amount
                            FROM aol
                            JOIN mt ON mt.account_object_id=aol.account_object_id
                            GROUP BY aol.account_base_id, mt.city_id
                        ), sag AS (
                            SELECT 
                                aol.account_group_id,
                                mt.city_id, 
                                SUM(mt.plan_amount) as account_group_plan_amount,
                                SUM(mt.real_amount) as account_group_real_amount
                            FROM aol
                            JOIN mt ON mt.account_object_id=aol.account_object_id
                            GROUP BY aol.account_group_id, mt.city_id
                        ), sat AS (
                            SELECT 
                                aol.account_type_id,
                                mt.city_id, 
                                SUM(mt.plan_amount) as account_type_plan_amount,
                                SUM(mt.real_amount) as account_type_real_amount
                            FROM aol
                            JOIN mt ON mt.account_object_id=aol.account_object_id
                            GROUP BY aol.account_type_id, mt.city_id
                        ), r AS (
                            SELECT 
                                aol.*,
                                mt.city_id,
                                mt.city_label,
                                mt.city_logo,
                                mt.plan_amount AS account_object_plan_amount,
                                mt.real_amount AS account_object_real_amount,
                                mt.trans_date,
                                sab.account_base_plan_amount,
                                sab.account_base_real_amount,
                                sag.account_group_plan_amount,
                                sag.account_group_real_amount,
                                sat.account_type_plan_amount,
                                sat.account_type_real_amount
                            FROM aol
                            JOIN mt ON mt.account_object_id=aol.account_object_id
                            JOIN sab ON sab.account_base_id=aol.account_base_id AND sab.city_id=mt.city_id
                            JOIN sag ON sag.account_group_id=aol.account_group_id AND sag.city_id=mt.city_id
                            JOIN sat ON sat.account_type_id=aol.account_type_id AND sat.city_id=mt.city_id
                        )
                    ");

                    -- ROLE EXCEPTION
                    IF (SELECT JSON_CONTAINS(_user_role_exception, CONCAT('"', _user_role_id, '"'), "$")) <> 1 THEN
                        -- REMOVE KEY JSON
                        SELECT JSON_REMOVE(in_filter, '$.city_id') INTO in_filter;

                        -- SET KEY:VALUE JSON
                        SELECT JSON_MERGE(in_filter, CONCAT('{"city_id":', _user_city_id, '}')) INTO in_filter;
                    END IF;

                    -- SET FILTER ADDITIONAL
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.city_id"))), "") <> "" THEN
                        SET _filter = CONCAT(_filter, " AND city_id IN(", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.city_id")), ")");
                    END IF;
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.account_object_label"))), "") <> "" THEN
                        SET _filter = CONCAT(_filter, " AND account_object_label LIKE '%", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.account_object_label")), "%'");
                    END IF;
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.city_label"))), "") <> "" THEN
                        SET _filter = CONCAT(_filter, " AND city_label LIKE '%", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.city_label")), "%'");
                    END IF;
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.account_object_plan_amount"))), "") <> "" THEN
                        SET _filter = CONCAT(_filter, " AND account_object_plan_amount = ", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.account_object_plan_amount")));
                    END IF;
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.account_object_real_amount"))), "") <> "" THEN
                        SET _filter = CONCAT(_filter, " AND account_object_real_amount = ", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.account_object_real_amount")));
                    END IF;

                    SET _sql_default = CONCAT(_sql_default, " ", _filter);

                -- GET RECAPITULATION CITIES
                ELSEIF LOWER(in_function)="get_recapitulation_cities" THEN
                    -- ADDITIONAL COLUMN JSON RESULT
                    SET @column_json = "'account_base_id', account_base_id, 'account_base_label', account_base_label, 'city_id', city_id, 'city_label', city_label, 'account_base_plan_amount', account_base_plan_amount, 'account_base_real_amount', account_base_real_amount, 'trans_date', trans_date";
                   
                    -- INLINE FILTER
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.trans_date_start"))), "") <> "" AND COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.trans_date_end"))), "") <> "" THEN
                        SET _inline_filter = CONCAT(_inline_filter, " AND r.trans_date >= '", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.trans_date_start")), "'");
                        SET _inline_filter = CONCAT(_inline_filter, " AND r.trans_date <= '", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.trans_date_end")), "'");
                    END IF;

                    -- SET SQL
                    SET @sql_target = CONCAT("
                        WITH aol AS (
                            SELECT  
                                sab.id AS account_base_id, 
                                sab.remark AS account_base_label,
                                sag.id AS account_group_id, 
                                sat.id AS account_type_id, 
                                sao.id AS account_object_id
                            FROM account_base sab
                            JOIN account_group sag ON sag.account_base_id=sab.id AND sag.active
                            JOIN account_type sat ON sat.account_group_id=sag.id AND sat.active
                            JOIN account_object sao ON sao.account_type_id=sat.id AND sao.active
                            WHERE sab.active AND LOWER(sab.remark) IN(LOWER('PENDAPATAN DAERAH'), LOWER('BELANJA DAERAH'))
                        ), p AS (
                            SELECT 
                                MIN(id) plan_id
                            FROM transaction
                            WHERE plan_amount >= 0 AND real_amount = 0
                            GROUP BY account_object_id, city_id, EXTRACT(YEAR FROM trans_date)
                        ), anggaran AS (
                            SELECT 
                                st.account_object_id,
                                st.city_id,
                                c.label AS city_label,
                                c.logo AS city_logo,
                                st.plan_amount,
                                st.trans_date
                            FROM transaction st
                            JOIN city c ON c.id=st.city_id AND c.active
                            JOIN p ON p.plan_id=st.id
                        ), realisasi AS (
                            SELECT
                                st.account_object_id,
                                st.city_id,
                                st.real_amount,
                                st.trans_date
                            FROM transaction st
                            JOIN city c ON c.id=st.city_id AND c.active
                            WHERE st.id NOT IN (SELECT plan_id FROM p)
                            ORDER BY st.trans_date DESC
                        ), mt AS (
                            SELECT 
                                a.account_object_id,
                                a.city_id,
                                a.city_label,
                                a.city_logo,
                                COALESCE(a.plan_amount,0) AS plan_amount,
                                COALESCE((SELECT MAX(r.real_amount)),0) AS real_amount,
                                COALESCE((SELECT MAX(r.trans_date)), a.trans_date) AS trans_date
                            FROM anggaran a
                            JOIN realisasi r ON r.account_object_id=a.account_object_id 
                                AND r.city_id=a.city_id
                                AND EXTRACT(YEAR FROM r.trans_date)=EXTRACT(YEAR FROM a.trans_date)
                                ", _inline_filter, "
                            GROUP BY a.account_object_id, a.city_id, a.city_label, a.city_logo, a.plan_amount, a.trans_date
                        ), r AS (
                            SELECT 
                                aol.account_base_id,
                                aol.account_base_label,
                                mt.city_id, 
                                mt.city_label,
                                SUM(mt.plan_amount) as account_base_plan_amount,
                                SUM(mt.real_amount) as account_base_real_amount,
                                MAX(mt.trans_date) trans_date
                            FROM aol
                            JOIN mt ON mt.account_object_id=aol.account_object_id
                            GROUP BY aol.account_base_id, aol.account_base_label, mt.city_id, mt.city_label
                        )
                    ");

                    -- ROLE EXCEPTION
                    IF (SELECT JSON_CONTAINS(_user_role_exception, CONCAT('"', _user_role_id, '"'), "$")) <> 1 THEN
                        -- REMOVE KEY JSON
                        SELECT JSON_REMOVE(in_filter, '$.city_id') INTO in_filter;

                        -- SET KEY:VALUE JSON
                        SELECT JSON_MERGE(in_filter, CONCAT('{"city_id":', _user_city_id, '}')) INTO in_filter;
                    END IF;

                    -- SET FILTER ADDITIONAL
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.city_id"))), "") <> "" THEN
                        SET _filter = CONCAT(_filter, " AND city_id IN(", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.city_id")), ")");
                    END IF;
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.account_base_label"))), "") <> "" THEN
                        SET _filter = CONCAT(_filter, " AND account_base_label LIKE '%", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.account_base_label")), "%'");
                    END IF;
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.city_label"))), "") <> "" THEN
                        SET _filter = CONCAT(_filter, " AND city_label LIKE '%", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.city_label")), "%'");
                    END IF;
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.account_object_plan_amount"))), "") <> "" THEN
                        SET _filter = CONCAT(_filter, " AND account_object_plan_amount = ", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.account_object_plan_amount")));
                    END IF;
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.account_object_real_amount"))), "") <> "" THEN
                        SET _filter = CONCAT(_filter, " AND account_object_real_amount = ", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.account_object_real_amount")));
                    END IF;

                    SET _sql_default = CONCAT(_sql_default, " ", _filter);

                -- GET DASHBOARD
                ELSEIF LOWER(in_function)="get_dashboard" THEN
                    -- ADDITIONAL COLUMN JSON RESULT
                    SET @column_json = "'account_base_id', account_base_id, 'account_base_label', account_base_label, 'city_id', city_id, 'city_label', city_label, 'account_base_plan_amount', account_base_plan_amount, 'account_base_real_amount', account_base_real_amount, 'trans_date', trans_date";
                   
                    -- INLINE FILTER
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.trans_date_start"))), "") <> "" AND COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.trans_date_end"))), "") <> "" THEN
                        SET _inline_filter = CONCAT(_inline_filter, " AND r.trans_date >= '", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.trans_date_start")), "'");
                        SET _inline_filter = CONCAT(_inline_filter, " AND r.trans_date <= '", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.trans_date_end")), "'");
                    END IF;

                    -- SET SQL
                    SET @sql_target = CONCAT("
                        WITH aol AS (
                            SELECT  
                                sab.id AS account_base_id, 
                                sab.remark AS account_base_label,
                                sag.id AS account_group_id, 
                                sat.id AS account_type_id, 
                                sao.id AS account_object_id
                            FROM account_base sab
                            JOIN account_group sag ON sag.account_base_id=sab.id AND sag.active
                            JOIN account_type sat ON sat.account_group_id=sag.id AND sat.active
                            JOIN account_object sao ON sao.account_type_id=sat.id AND sao.active
                            WHERE sab.active AND LOWER(sab.remark) IN(LOWER('PENDAPATAN DAERAH'), LOWER('BELANJA DAERAH'), LOWER('PEMBIAYAAN DAERAH'))
                        ), p AS (
                            SELECT 
                                MIN(id) plan_id
                            FROM transaction
                            WHERE plan_amount >= 0 AND real_amount = 0
                            GROUP BY account_object_id, city_id, EXTRACT(YEAR FROM trans_date)
                        ), anggaran AS (
                            SELECT 
                                st.account_object_id,
                                st.city_id,
                                c.label AS city_label,
                                c.logo AS city_logo,
                                st.plan_amount,
                                st.trans_date
                            FROM transaction st
                            JOIN city c ON c.id=st.city_id AND c.active
                            JOIN p ON p.plan_id=st.id
                        ), realisasi AS (
                            SELECT
                                st.account_object_id,
                                st.city_id,
                                st.real_amount,
                                st.trans_date
                            FROM transaction st
                            JOIN city c ON c.id=st.city_id AND c.active
                            WHERE st.id NOT IN (SELECT plan_id FROM p)
                            ORDER BY st.trans_date DESC
                        ), mt AS (
                            SELECT 
                                a.account_object_id,
                                a.city_id,
                                a.city_label,
                                a.city_logo,
                                COALESCE(a.plan_amount,0) AS plan_amount,
                                COALESCE((SELECT MAX(r.real_amount)),0) AS real_amount,
                                COALESCE((SELECT MAX(r.trans_date)), a.trans_date) AS trans_date
                            FROM anggaran a
                            JOIN realisasi r ON r.account_object_id=a.account_object_id 
                                AND r.city_id=a.city_id
                                AND EXTRACT(YEAR FROM r.trans_date)=EXTRACT(YEAR FROM a.trans_date)
                                ", _inline_filter, "
                            GROUP BY a.account_object_id, a.city_id, a.city_label, a.city_logo, a.plan_amount, a.trans_date
                        ), r AS (
                            SELECT 
                                aol.account_base_id,
                                aol.account_base_label,
                                mt.city_id, 
                                mt.city_label,
                                SUM(mt.plan_amount) as account_base_plan_amount,
                                SUM(mt.real_amount) as account_base_real_amount,
                                MAX(mt.trans_date) trans_date
                            FROM aol
                            JOIN mt ON mt.account_object_id=aol.account_object_id
                            GROUP BY aol.account_base_id, aol.account_base_label, mt.city_id, mt.city_label
                        )
                    ");

                    -- ROLE EXCEPTION
                    IF (SELECT JSON_CONTAINS(_user_role_exception, CONCAT('"', _user_role_id, '"'), "$")) <> 1 THEN
                        -- REMOVE KEY JSON
                        SELECT JSON_REMOVE(in_filter, '$.city_id') INTO in_filter;

                        -- SET KEY:VALUE JSON
                        SELECT JSON_MERGE(in_filter, CONCAT('{"city_id":', _user_city_id, '}')) INTO in_filter;
                    END IF;

                    -- SET FILTER ADDITIONAL
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.city_id"))), "") <> "" THEN
                        SET _filter = CONCAT(_filter, " AND city_id IN(", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.city_id")), ")");
                    END IF;

                    SET _sql_default = CONCAT(_sql_default, " ", _filter);

                -- GET DASHBOARD RECAP YEARS
                ELSEIF LOWER(in_function)="get_dashboard_recap_years" THEN
                    -- ADDITIONAL COLUMN JSON RESULT
                    SET @column_json = "'account_base_id', account_base_id, 'account_base_label', account_base_label, 'city_id', city_id, 'city_label', city_label, 'account_base_plan_amount', account_base_plan_amount, 'account_base_real_amount', account_base_real_amount, 'trans_date', trans_date";

                    -- GET FIRST DATE
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.trans_date_start"))), "") <> "" THEN
                        SET _inline_filter = CONCAT(_inline_filter, " AND r.trans_date >= '", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.trans_date_start")), "'");
                    ELSE
                        SELECT MAKEDATE(YEAR(NOW() - INTERVAL 2 YEAR), 1) INTO _first_date;
                        SET _inline_filter = CONCAT(_inline_filter, " AND r.trans_date >= '", _first_date , "'");
                    END IF;

                    -- GET LAST DATE
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.trans_date_end"))), "") <> "" THEN
                        SET _inline_filter = CONCAT(_inline_filter, " AND r.trans_date <= '", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.trans_date_end")), "'");
                    ELSE
                        SELECT MAKEDATE(YEAR(NOW() + INTERVAL 1 YEAR), 1) - INTERVAL 1 DAY INTO _last_date;
                        SET _inline_filter = CONCAT(_inline_filter, " AND r.trans_date <= '", _last_date , "'");
                    END IF;

                    -- SET SQL
                    SET @sql_target = CONCAT("
                        WITH aol AS (
                            SELECT  
                                sab.id AS account_base_id, 
                                sab.remark AS account_base_label,
                                sag.id AS account_group_id, 
                                sat.id AS account_type_id, 
                                sao.id AS account_object_id
                            FROM account_base sab
                            JOIN account_group sag ON sag.account_base_id=sab.id AND sag.active
                            JOIN account_type sat ON sat.account_group_id=sag.id AND sat.active
                            JOIN account_object sao ON sao.account_type_id=sat.id AND sao.active
                            WHERE sab.active AND LOWER(sab.remark) IN(LOWER('PENDAPATAN DAERAH'), LOWER('BELANJA DAERAH'), LOWER('PEMBIAYAAN DAERAH'))
                        ), p AS (
                            SELECT 
                                MIN(id) plan_id
                            FROM transaction
                            WHERE plan_amount >= 0 AND real_amount = 0
                            GROUP BY account_object_id, city_id, EXTRACT(YEAR FROM trans_date)
                        ), anggaran AS (
                            SELECT 
                                st.account_object_id,
                                st.city_id,
                                c.label AS city_label,
                                c.logo AS city_logo,
                                st.plan_amount,
                                st.trans_date
                            FROM transaction st
                            JOIN city c ON c.id=st.city_id AND c.active
                            JOIN p ON p.plan_id=st.id
                        ), realisasi AS (
                            SELECT
                                st.account_object_id,
                                st.city_id,
                                st.real_amount,
                                st.trans_date
                            FROM transaction st
                            JOIN city c ON c.id=st.city_id AND c.active
                            WHERE st.id NOT IN (SELECT plan_id FROM p)
                            ORDER BY st.trans_date DESC
                        ), mt AS (
                            SELECT 
                                a.account_object_id,
                                a.city_id,
                                a.city_label,
                                a.city_logo,
                                COALESCE(a.plan_amount,0) AS plan_amount,
                                COALESCE((SELECT MAX(r.real_amount)),0) AS real_amount,
                                COALESCE((SELECT MAX(r.trans_date)), a.trans_date) AS trans_date
                            FROM anggaran a
                            JOIN realisasi r ON r.account_object_id=a.account_object_id 
                                AND r.city_id=a.city_id
                                AND EXTRACT(YEAR FROM r.trans_date)=EXTRACT(YEAR FROM a.trans_date)
                                ", _inline_filter, "
                            GROUP BY a.account_object_id, a.city_id, a.city_label, a.city_logo, a.plan_amount, a.trans_date
                        ), r AS (
                            SELECT 
                                aol.account_base_id,
                                aol.account_base_label,
                                mt.city_id, 
                                mt.city_label,
                                SUM(mt.plan_amount) as account_base_plan_amount,
                                SUM(mt.real_amount) as account_base_real_amount,
                                MAX(mt.trans_date) trans_date
                            FROM aol
                            JOIN mt ON mt.account_object_id=aol.account_object_id
                            GROUP BY aol.account_base_id, aol.account_base_label, mt.city_id, mt.city_label
                        )
                    ");

                    -- ROLE EXCEPTION
                    IF (SELECT JSON_CONTAINS(_user_role_exception, CONCAT('"', _user_role_id, '"'), "$")) <> 1 THEN
                        -- REMOVE KEY JSON
                        SELECT JSON_REMOVE(in_filter, '$.city_id') INTO in_filter;

                        -- SET KEY:VALUE JSON
                        SELECT JSON_MERGE(in_filter, CONCAT('{"city_id":', _user_city_id, '}')) INTO in_filter;
                    END IF;

                    -- SET FILTER ADDITIONAL
                    IF COALESCE((SELECT JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.city_id"))), "") <> "" THEN
                        SET _filter = CONCAT(_filter, " AND city_id IN(", JSON_UNQUOTE(JSON_EXTRACT(in_filter, "$.city_id")), ")");
                    END IF;

                    SET _sql_default = CONCAT(_sql_default, " ", _filter);

                END IF;

                -- SET USER CLAUSE QUERY
                IF COALESCE(_user_role_clause, "") <> "" THEN
                    SET _sql_default = CONCAT(_sql_default, " ", _user_role_clause);
                END IF;
                
                -- SET ORDER
                IF COALESCE(in_order, "") <> "" THEN
                    SET _sql_default = CONCAT(_sql_default, " ORDER BY ", in_order);
                    SET _order = CONCAT("ORDER BY ", in_order);
                END IF;
                
                -- SET LIMIT
                IF COALESCE(in_limit, 0) > 0 THEN
                    SET _sql_default = CONCAT(_sql_default, " LIMIT ", in_limit);
                END IF;
                
                -- SET OFFSET
                IF COALESCE(in_offset, 0) > 0 THEN
                    SET _sql_default = CONCAT(_sql_default, " OFFSET ", in_offset);
                END IF;

                -- EXECUTE QUERY
                SET @query = CONCAT(@sql_target, ", rcd AS (", _sql_default, ") SELECT CONCAT('[', GROUP_CONCAT(JSON_OBJECT(", @column_json, ") ", _order,"), ']'), COUNT(*) FROM rcd INTO @data, @total");
                PREPARE QUERY FROM @query;
                EXECUTE QUERY;
                
                -- SET TO RESPONSE
                SET _res_data = @data;
                SET _res_total = @total;
                
                -- CLEAR QUERY
                DEALLOCATE PREPARE QUERY;
                
            ELSE
                SET _res_code = 101;
                SET _res_message = "Fungsi belum terdaftar";
            END IF;

        ELSE
    		SET _res_code = 401;
        	SET _res_message = "Data Kota tidak ditemukan, silahkan hubungi admin";
        END IF;
        
    ELSE
    	SET _res_code = 401;
        SET _res_message = "Data Pengguna Tidak ditemukan";
    END IF;

    -- FOR DEVELOPMENT
    SET out_response = JSON_OBJECT("code", _res_code, "message", _res_message, "data", _res_data, "total", _res_total, "query", @query);
    
    -- FOR PRODUCTION
    -- SET out_response = JSON_OBJECT("code", _res_code, "message", _res_message, "data", _res_data, "total", _res_total);

    -- IT IS NECESSARY IN TRANSACTION
    COMMIT;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `set_log` (IN `in_table` TEXT, IN `in_mode` TEXT, IN `in_start_value` JSON, IN `in_end_value` JSON, IN `in_username` TEXT)   BEGIN
    INSERT INTO `log`(`"table"`, `mode`, `start_value`, `end_value`, `created_at`, `created_by`) 
    VALUES (LOWER(in_table), UPPER(in_mode), in_start_value, in_end_value, DATE_FORMAT(NOW(),"%Y-%m-%d %H:%i"), in_username);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `update_token` (IN `in_user_id` INT, IN `in_token` TEXT)   BEGIN
	UPDATE user 
    SET token = in_token
    WHERE id = in_user_id;
END$$

--
-- Functions
--
CREATE DEFINER=`root`@`localhost` FUNCTION `generate_filter` (`in_filter` JSON, `in_table` TEXT, `in_alias` TEXT) RETURNS TEXT CHARSET utf8mb4 DETERMINISTIC BEGIN
	-- DECLARING VARIABLES
  	DECLARE _filter TEXT;
  	DECLARE _filter_input TEXT;
  	DECLARE _alias TEXT;
  	DECLARE _name TEXT;
  	DECLARE _type TEXT;
  	DECLARE _done INT DEFAULT FALSE;
	DECLARE _schemas CURSOR FOR SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = in_table;
  	DECLARE CONTINUE HANDLER FOR NOT FOUND SET _done = TRUE;

    -- SET VARIABLES
	SET _filter = "";
    SET _filter_input = "";
    SET _alias = in_alias;

    OPEN _schemas;
    
    read_loop: LOOP
    	FETCH _schemas INTO _name, _type;
        
        IF _done THEN
        	LEAVE read_loop;
        END IF;
        
        SELECT JSON_EXTRACT(in_filter, CONCAT("$.",_name)) INTO _filter_input;
        
        IF COALESCE(_filter_input,"") <> "" THEN
        	-- ADD ALIAS
            IF COALESCE(_alias, "") <> "" THEN
		    	SET _name = CONCAT(_alias, ".", _name);
			END IF;
        
        	-- INTEGER || TINYINT || FLOAT
        	IF _type = "int" || _type = "tinyint" || _type = 'float' THEN
            	SET _filter = CONCAT(_filter, ' AND ', _name , " = ", _filter_input);
                
        	-- TEXT || VARCHAR
            ELSEIF _type = "text" || _type = "varchar" THEN
            	SET _filter = CONCAT(_filter, ' AND ', _name , " LIKE '%", JSON_UNQUOTE(_filter_input), "%'");

        	-- DATE
            ELSEIF _type = "date" THEN
            	SET _filter = CONCAT(_filter, ' AND ', _name , " = '", JSON_UNQUOTE(_filter_input), "'");

            END IF;
        END IF;
	END LOOP;
	
    CLOSE _schemas;
    
	RETURN _filter;
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `generate_password` (`in_password` TEXT) RETURNS TEXT CHARSET utf8mb4 DETERMINISTIC BEGIN
	-- DECLARING VARIABLES
    DECLARE _password TEXT;
	DECLARE _app TEXT;
	DECLARE _delimiter TEXT;

    -- SET VARIABLES
    SET _password = "";
    SET _app = "";
    SET _delimiter = "";

    -- SET APP SETTING
    SELECT value INTO _app FROM setting WHERE name = "app";
    
    -- SET DELIMITER SETTING
    SELECT value INTO _delimiter FROM setting WHERE name = "delimiter";

    -- GENERATE PASSWORD
    SELECT MD5(CONCAT(MD5(_app), _delimiter, in_password)) INTO _password;

	RETURN _password;
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `generate_token` (`in_user_id` INT) RETURNS TEXT CHARSET utf8mb4 DETERMINISTIC BEGIN
	-- DECLARING VARIABLES
  	DECLARE _user_id INT;
  	DECLARE _user_name TEXT;
  	DECLARE _user_role_id INT;
    DECLARE _token TEXT;

    -- SET VARIABLES
    SET _user_id = in_user_id;
    SET _token = "";

    SELECT username, role_id INTO _user_name, _user_role_id
    FROM user
    WHERE id = in_user_id;

    -- GENERATE TOKEN
    SELECT CONCAT(md5(now()), md5(_user_id), md5(_user_name), _user_role_id) INTO _token;

	  RETURN _token;
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `login` (`in_username` TEXT, `in_password` TEXT) RETURNS JSON DETERMINISTIC BEGIN
	-- DECLARING VARIABLES
	DECLARE _res_code INT;
	DECLARE _res_message TEXT;
	DECLARE _res_data JSON;
	DECLARE _user_id INT;
    DECLARE _user_name TEXT;
    DECLARE _user_token TEXT;
    DECLARE _user_city_id TEXT;
	DECLARE _user_role_id INT;
	
    -- SET VARIABLES
	SET _res_code = 200; -- DEFAULT 200 (SUCCESS) || 401 (UNAUTHORIZED)
    SET _res_message = NULL;
    SET _res_data = NULL;
    SET _user_id = 0;
    
    -- CHECK USER
    SELECT id, username, city_id, role_id 
    INTO _user_id, _user_name, _user_city_id, _user_role_id
    FROM user WHERE username = in_username AND password = generate_password(in_password) AND active;
    
    -- VALIDATE USER
    IF _user_id > 0 THEN
    	-- VALIDATE CITY
        IF EXISTS(SELECT 1 FROM city WHERE id = _user_city_id AND active) THEN
            -- SET TOKEN USER
            SELECT generate_token(_user_id) INTO _user_token;
            
            -- UPDATE TOKEN USER
            CALL update_token(_user_id, _user_token);
            
            -- SET DATA USER
            SELECT JSON_OBJECT("username", username, "fullname", fullname, "title", title, "token", _user_token) INTO _res_data
        	FROM user WHERE id = _user_id;
        ELSE
    		SET _res_code = 401;
        	SET _res_message = "Data Kota tidak ditemukan, silahkan hubungi admin";
        END IF;
    ELSE
    	SET _res_code = 401;
        SET _res_message = "Nama Pengguna atau Kata Sandi tidak benar";
    END IF;
    
    RETURN JSON_OBJECT("code", _res_code, "message", _res_message, "data", _res_data);
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `validate_token` (`in_token` TEXT) RETURNS JSON DETERMINISTIC BEGIN
	-- DECLARING VARIABLES
	DECLARE _res_code INT;
	DECLARE _res_message TEXT;
	DECLARE _res_data JSON;
    DECLARE _user_id INT;
	
    -- SET VARIABLES
	SET _res_code = 200; -- DEFAULT 200 (SUCCESS) || 401 (UNAUTHORIZED)
    SET _res_message = NULL;
    SET _res_data = NULL;
    SET _user_id = 0;
    
    -- CHECK USER
    SELECT u.id INTO _user_id
    FROM user u 
    JOIN city c ON c.id=u.city_id AND c.active
    WHERE u.token = in_token AND u.active;
    
    -- VALIDATE USER
    IF _user_id > 0 THEN
		SELECT JSON_OBJECT("username", username) INTO _res_data
		FROM user WHERE id = _user_id;
    ELSE
    	SET _res_code = 401;
        SET _res_message = "Sesi anda berakhir, silahkan masuk kembali";
    END IF;
    
    RETURN JSON_OBJECT("code", _res_code, "message", _res_message, "data", _res_data);
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `account_base`
--

CREATE TABLE `account_base` (
  `id` int NOT NULL,
  `label` text NOT NULL,
  `remark` text NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `account_base`
--

INSERT INTO `account_base` (`id`, `label`, `remark`, `active`) VALUES
(56, '4', 'Pendapatan Daerah', 1),
(58, '5', 'Belanja Daerah', 1),
(59, '6', 'Pembiayaan Daerah', 1);

-- --------------------------------------------------------

--
-- Table structure for table `account_group`
--

CREATE TABLE `account_group` (
  `id` int NOT NULL,
  `account_base_id` int NOT NULL,
  `label` text NOT NULL,
  `remark` text NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `account_group`
--

INSERT INTO `account_group` (`id`, `account_base_id`, `label`, `remark`, `active`) VALUES
(1, 59, '1', 'Penerimaan Pembiayaan', 1),
(4, 56, '1', 'Pendapatan Asli Daerah (PAD)', 1),
(6, 56, '2', 'Pendapatan Transfer', 1);

-- --------------------------------------------------------

--
-- Table structure for table `account_object`
--

CREATE TABLE `account_object` (
  `id` int NOT NULL,
  `account_type_id` int NOT NULL,
  `label` text NOT NULL,
  `remark` text NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `account_object`
--

INSERT INTO `account_object` (`id`, `account_type_id`, `label`, `remark`, `active`) VALUES
(1, 1, '01', 'Hasil Penjualan BMD yang Tidak Dipisahkan', 1);

-- --------------------------------------------------------

--
-- Table structure for table `account_type`
--

CREATE TABLE `account_type` (
  `id` int NOT NULL,
  `account_group_id` int NOT NULL,
  `label` text NOT NULL,
  `remark` text NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `account_type`
--

INSERT INTO `account_type` (`id`, `account_group_id`, `label`, `remark`, `active`) VALUES
(1, 4, '04', 'Lain-lain PAD yang Sah', 1);

-- --------------------------------------------------------

--
-- Table structure for table `city`
--

CREATE TABLE `city` (
  `id` int NOT NULL,
  `label` text NOT NULL,
  `logo` text NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `city`
--

INSERT INTO `city` (`id`, `label`, `logo`, `active`) VALUES
(1, 'Batam', '', 1);

-- --------------------------------------------------------

--
-- Table structure for table `log`
--

CREATE TABLE `log` (
  `id` int NOT NULL,
  `"table"` text NOT NULL,
  `mode` varchar(1) NOT NULL,
  `start_value` json NOT NULL,
  `end_value` json NOT NULL,
  `created_at` timestamp NOT NULL,
  `created_by` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `log`
--

INSERT INTO `log` (`id`, `"table"`, `mode`, `start_value`, `end_value`, `created_at`, `created_by`) VALUES
(8, 'account_base', 'C', '{}', '[{\"id\": \"\", \"mode\": \"C\", \"label\": \"4\", \"remark\": \"Pendapatan Daerah\"}]', '2023-07-31 13:10:00', 'superadmin'),
(9, 'account_base', 'C', '{}', '[{\"id\": \"\", \"mode\": \"C\", \"label\": \"5\", \"remark\": \"Belanja Daerah\"}]', '2023-07-31 13:12:00', 'superadmin'),
(10, 'account_base', 'C', '{}', '[{\"id\": \"\", \"mode\": \"C\", \"label\": \"6\", \"remark\": \"Pembiayaan Daerah\"}]', '2023-07-31 13:29:00', 'superadmin'),
(13, 'account_base', 'U', '{}', '[{\"id\": 58, \"mode\": \"U\", \"label\": \"5\", \"remark\": \"Belanja Daerah Bos\"}]', '2023-07-31 13:49:00', 'superadmin'),
(14, 'account_base', 'U', '{}', '[{\"id\": 58, \"mode\": \"U\", \"label\": \"5\", \"remark\": \"Belanja Daerah\"}]', '2023-07-31 13:50:00', 'superadmin'),
(15, 'account_base', 'D', '{}', '[{\"id\": \"59\"}]', '2023-07-31 13:52:00', 'superadmin'),
(16, 'account_base', 'D', '{}', '[{\"id\": \"59\"}]', '2023-07-31 13:53:00', 'superadmin'),
(17, 'account_group', 'C', '{}', '[{\"id\": \"\", \"mode\": \"C\", \"label\": \"1\", \"remark\": \"Penerimaan Pembiayaan\", \"account_base_id\": 59}]', '2023-07-31 14:55:00', 'superadmin'),
(18, 'account_group', 'C', '{}', '[{\"id\": \"\", \"mode\": \"C\", \"label\": \"1\", \"remark\": \"Pendapatan Asli Daerah (PAD)\", \"account_base_id\": 56}]', '2023-07-31 15:01:00', 'superadmin'),
(19, 'account_group', 'C', '{}', '[{\"id\": \"\", \"mode\": \"C\", \"label\": \"2\", \"remark\": \"Pendapatan Transfer\", \"account_base_id\": 59}]', '2023-07-31 15:02:00', 'superadmin'),
(20, 'account_group', 'D', '{}', '[{\"id\": \"1\"}]', '2023-07-31 15:08:00', 'superadmin'),
(21, 'account_group', 'D', '{}', '[{\"id\": \"1\"}]', '2023-07-31 15:09:00', 'superadmin'),
(22, 'account_group', 'U', '{}', '[{\"id\": 6, \"mode\": \"U\", \"label\": \"2\", \"remark\": \"Pendapatan Transfer\", \"account_base_id\": 56}]', '2023-07-31 15:09:00', 'superadmin'),
(23, 'account_base', 'D', '{}', '[{\"id\": \"58\"}]', '2023-07-31 15:10:00', 'superadmin'),
(24, 'account_base', 'D', '{}', '[{\"id\": \"58\"}]', '2023-07-31 15:12:00', 'superadmin'),
(25, 'account_base', 'U', '{}', '[{\"id\": 59, \"mode\": \"U\", \"label\": \"6\", \"remark\": \"Pembiayaan Daeraaah\"}]', '2023-07-31 16:48:00', 'superadmin'),
(26, 'account_base', 'U', '{}', '[{\"id\": 59, \"mode\": \"U\", \"label\": \"6\", \"remark\": \"Pembiayaan Daerah\"}]', '2023-07-31 16:48:00', 'superadmin'),
(27, 'city', 'U', '{}', '[{\"id\": \"1\", \"blob\": \"null\", \"logo\": \"\", \"mode\": \"U\", \"label\": \"Batamss\"}]', '2023-08-04 10:24:00', 'superadmin'),
(28, 'city', 'D', '{}', '[{\"id\": \"1\"}]', '2023-08-04 10:25:00', 'superadmin'),
(29, 'city', 'U', '{}', '[{\"id\": \"1\", \"blob\": \"null\", \"logo\": \"\", \"mode\": \"U\", \"label\": \"Batam\"}]', '2023-08-04 16:25:00', 'superadmin'),
(30, 'city', 'C', '{}', '[{\"id\": \"\", \"blob\": \"null\", \"logo\": \"\", \"mode\": \"C\", \"label\": \"Tanjung Pinang\"}]', '2023-08-04 16:33:00', 'superadmin'),
(31, 'city', 'U', '{}', '[{\"id\": \"1\", \"blob\": null, \"logo\": \"431ea8e7bf822115e30d2390242c8637.png\", \"mode\": \"U\", \"label\": \"Batam\"}]', '2023-08-04 16:33:00', 'superadmin'),
(32, 'city', 'C', '{}', '[{\"id\": \"\", \"blob\": null, \"logo\": \"2ab4a4c60f653f8680bdf0d8840c32db.png\", \"mode\": \"C\", \"label\": \"Bintan\"}]', '2023-08-04 16:38:00', 'superadmin'),
(33, 'city', 'C', '{}', '[{\"id\": \"\", \"blob\": \"null\", \"logo\": \"\", \"mode\": \"C\", \"label\": \"Kabupaten Lingga\"}]', '2023-08-04 16:40:00', 'superadmin'),
(34, 'city', 'U', '{}', '[{\"id\": \"3\", \"blob\": \"null\", \"logo\": \"\", \"mode\": \"U\", \"label\": \"Kabupaten Bintan\"}]', '2023-08-04 16:43:00', 'superadmin'),
(35, 'city', 'C', '{}', '[{\"id\": \"\", \"blob\": \"null\", \"logo\": \"\", \"mode\": \"C\", \"label\": \"Natuna\"}, {\"id\": \"\", \"blob\": \"null\", \"logo\": \"\", \"mode\": \"C\", \"label\": \"Kabupaten Karimun\"}, {\"id\": \"\", \"blob\": \"null\", \"logo\": \"\", \"mode\": \"C\", \"label\": \"Kabupaten Anambas\"}]', '2023-08-04 16:48:00', 'superadmin'),
(36, 'signer', 'C', '{}', '[{\"id\": \"\", \"nip\": 199110052015031000, \"mode\": \"C\", \"title\": \"Penata\", \"fullname\": \"Muhammad Eka Putra Galus, ST\", \"position\": \"Kepala Sub Bidang Bina dan Evaluasi Daerah\"}]', '2023-08-04 17:04:00', 'superadmin'),
(37, 'signer', 'U', '{}', '[{\"id\": 1, \"nip\": \"199110052015031000\", \"mode\": \"U\", \"title\": \"Penataa\", \"fullname\": \"Muhammad Eka Putra Galus, ST\", \"position\": \"Kepala Sub Bidang Bina dan Evaluasi Daerah\"}]', '2023-08-04 17:04:00', 'superadmin'),
(38, 'signer', 'U', '{}', '[{\"id\": 1, \"nip\": \"199110052015031000\", \"mode\": \"U\", \"title\": \"Penata\", \"fullname\": \"Muhammad Eka Putra Galus, ST\", \"position\": \"Kepala Sub Bidang Bina dan Evaluasi Daerah\"}]', '2023-08-04 17:04:00', 'superadmin'),
(39, 'user', 'U', '{}', '[{\"id\": 2, \"mode\": \"U\", \"title\": \"Super Admin\", \"city_id\": 1, \"role_id\": 1, \"fullname\": \"Super Adminn\", \"password\": \"\", \"username\": \"superadmin\"}]', '2023-08-04 17:32:00', 'superadmin'),
(40, 'user', 'U', '{}', '[{\"id\": 2, \"mode\": \"U\", \"title\": \"Super Admin\", \"city_id\": 1, \"role_id\": 1, \"fullname\": \"Super Admin\", \"password\": \"\", \"username\": \"superadmin\"}]', '2023-08-04 17:32:00', 'superadmin'),
(41, 'user', 'C', '{}', '[{\"id\": \"\", \"mode\": \"C\", \"title\": \"Admin Kota\", \"city_id\": 1, \"role_id\": 2, \"fullname\": \"Admin Kota Batam\", \"password\": \"adminbatam123\", \"username\": \"adminbatam\"}]', '2023-08-04 17:33:00', 'superadmin'),
(42, 'user', 'U', '{}', '[{\"id\": 3, \"mode\": \"U\", \"title\": \"Admin Kota\", \"city_id\": 1, \"role_id\": 2, \"fullname\": \"Admin Kota Batam\", \"password\": \"\", \"username\": \"adminbatam\"}]', '2023-08-04 17:33:00', 'superadmin'),
(43, 'signer', 'D', '{}', '[{\"id\": \"1\"}]', '2023-08-05 05:39:00', 'superadmin'),
(44, 'signer', 'D', '{}', '[{\"id\": \"1\"}]', '2023-08-05 05:43:00', 'superadmin'),
(45, 'account_type', 'C', '{}', '[{\"id\": \"\", \"mode\": \"C\", \"label\": \"04\", \"remark\": \"Lain-lain PAD yang Sah\", \"account_group_id\": 4}]', '2023-08-05 05:53:00', 'superadmin'),
(46, 'account_type', 'U', '{}', '[{\"id\": 1, \"mode\": \"U\", \"label\": \"04\", \"remark\": \"Lain-lain PAD yang Saha\", \"account_group_id\": 4}]', '2023-08-05 05:53:00', 'superadmin'),
(47, 'account_type', 'U', '{}', '[{\"id\": 1, \"mode\": \"U\", \"label\": \"04\", \"remark\": \"Lain-lain PAD yang Sah\", \"account_group_id\": 4}]', '2023-08-05 05:53:00', 'superadmin'),
(48, 'account_type', 'D', '{}', '[{\"id\": \"1\"}]', '2023-08-05 05:53:00', 'superadmin'),
(49, 'account_type', 'D', '{}', '[{\"id\": \"1\"}]', '2023-08-05 05:53:00', 'superadmin'),
(50, 'account_object', 'C', '{}', '[{\"id\": \"\", \"mode\": \"C\", \"label\": \"01\", \"remark\": \"Hasil Penjualan BMD yang Tidak Dipisahkan\", \"account_type_id\": 1}]', '2023-08-05 05:54:00', 'superadmin'),
(51, 'account_object', 'U', '{}', '[{\"id\": 1, \"mode\": \"U\", \"label\": \"012\", \"remark\": \"Hasil Penjualan BMD yang Tidak Dipisahkan\", \"account_type_id\": 1}]', '2023-08-05 05:54:00', 'superadmin'),
(52, 'account_object', 'U', '{}', '[{\"id\": 1, \"mode\": \"U\", \"label\": \"01\", \"remark\": \"Hasil Penjualan BMD yang Tidak Dipisahkan\", \"account_type_id\": 1}]', '2023-08-05 05:54:00', 'superadmin'),
(53, 'transaction', 'C', '{}', '[{\"id\": \"\", \"mode\": \"C\", \"city_id\": 1, \"trans_date\": \"2023-01-01\", \"plan_amount\": 0, \"real_amount\": 0, \"account_object_id\": 1}]', '2023-08-05 06:06:00', 'adminbatam'),
(54, 'transaction', 'D', '{}', '[{\"id\": \"1\"}]', '2023-08-05 06:07:00', 'superadmin'),
(55, 'transaction', 'C', '{}', '[{\"id\": \"\", \"mode\": \"C\", \"city_id\": 1, \"trans_date\": \"2023-01-01\", \"plan_amount\": 200000, \"real_amount\": 0, \"account_object_id\": 1}]', '2023-08-05 06:07:00', 'adminbatam'),
(56, 'transaction', 'D', '{}', '[{\"id\": \"1\"}]', '2023-08-05 06:08:00', 'superadmin'),
(57, 'transaction', 'U', '{}', '[{\"id\": 1, \"mode\": \"U\", \"city_id\": 1, \"trans_date\": \"2023-01-01\", \"plan_amount\": 1000000, \"real_amount\": 0, \"account_object_id\": null}]', '2023-08-05 06:13:00', 'superadmin'),
(58, 'transaction', 'D', '{}', '[{\"id\": \"1\"}]', '2023-08-05 06:18:00', 'superadmin'),
(59, 'transaction', 'D', '{}', '[{\"id\": \"1\"}]', '2023-08-05 06:24:00', 'superadmin'),
(60, 'transaction', 'C', '{}', '[{\"id\": \"\", \"mode\": \"C\", \"city_id\": 1, \"trans_date\": \"2023-01-01\", \"plan_amount\": 0, \"real_amount\": 0, \"account_object_id\": 1}]', '2023-08-05 06:32:00', 'adminbatam'),
(61, 'transaction', 'U', '{}', '[{\"id\": 3, \"mode\": \"U\", \"city_id\": 1, \"trans_date\": \"2023-01-01\", \"plan_amount\": 1000000, \"real_amount\": 0, \"account_object_id\": null}]', '2023-08-05 06:32:00', 'superadmin'),
(62, 'transaction', 'C', '{}', '[{\"id\": null, \"mode\": \"C\", \"city_id\": 1, \"trans_date\": \"2023-08-05\", \"plan_amount\": 0, \"real_amount\": 0, \"account_object_id\": 1}]', '2023-08-05 06:33:00', 'adminbatam'),
(63, 'transaction', 'C', '{}', '[{\"id\": null, \"mode\": \"C\", \"city_id\": 1, \"trans_date\": \"2023-08-05\", \"plan_amount\": 0, \"real_amount\": 8000000, \"account_object_id\": 1}]', '2023-08-05 06:33:00', 'adminbatam'),
(64, 'transaction', 'U', '{}', '[{\"id\": 5, \"mode\": \"U\", \"city_id\": 1, \"trans_date\": \"2023-08-05\", \"plan_amount\": 0, \"real_amount\": 8500000, \"account_object_id\": 1}]', '2023-08-05 06:44:00', 'adminbatam'),
(65, 'transaction', 'C', '{}', '[{\"id\": null, \"mode\": \"C\", \"city_id\": 1, \"trans_date\": \"2023-08-04\", \"plan_amount\": 0, \"real_amount\": 200000, \"account_object_id\": 1}]', '2023-08-05 06:45:00', 'adminbatam');

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `id` int NOT NULL,
  `name` text NOT NULL,
  `remark` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`id`, `name`, `remark`) VALUES
(1, 'super_admin', 'Admin Super'),
(2, 'city_admin', 'Admin Kota'),
(3, 'manager_ro', 'Pimpinan'),
(4, 'manager_city', 'Pimpinan Kota');

-- --------------------------------------------------------

--
-- Table structure for table `setting`
--

CREATE TABLE `setting` (
  `id` int NOT NULL,
  `name` text NOT NULL,
  `value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `setting`
--

INSERT INTO `setting` (`id`, `name`, `value`) VALUES
(1, 'app', 'sibeda2023'),
(2, 'delimiter', '_@_'),
(3, 'role_exception', '[\"1\",\"3\"]');

-- --------------------------------------------------------

--
-- Table structure for table `signer`
--

CREATE TABLE `signer` (
  `id` int NOT NULL,
  `nip` text NOT NULL,
  `fullname` text NOT NULL,
  `title` text NOT NULL,
  `position` text NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `signer`
--

INSERT INTO `signer` (`id`, `nip`, `fullname`, `title`, `position`, `active`) VALUES
(1, '199110052015031000', 'Muhammad Eka Putra Galus, ST', 'Penata', 'Kepala Sub Bidang Bina dan Evaluasi Daerah', 1);

-- --------------------------------------------------------

--
-- Table structure for table `transaction`
--

CREATE TABLE `transaction` (
  `id` int NOT NULL,
  `account_object_id` int NOT NULL,
  `city_id` int NOT NULL,
  `plan_amount` float NOT NULL,
  `real_amount` float NOT NULL,
  `trans_date` date NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int NOT NULL,
  `role_id` int NOT NULL,
  `city_id` int NOT NULL,
  `username` text NOT NULL,
  `password` text NOT NULL,
  `fullname` text NOT NULL,
  `title` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `email` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `token` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `role_id`, `city_id`, `username`, `password`, `fullname`, `title`, `email`, `token`, `active`) VALUES
(2, 1, 1, 'superadmin', 'f964b6e9fc89dd83bce6d124879cc455', 'Super Admin', 'Super Admin', NULL, 'ec9d545b7ab5f1e4c306a1942f956864c81e728d9d4c2f636f067f89cc14862c17c4520f6cfd1ab53d8745e84681eb491', 1),
(3, 2, 1, 'adminbatam', 'bbba5d1f9c6d2b47988241265019d3f4', 'Admin Kota Batam', 'Admin Kota', NULL, '', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account_base`
--
ALTER TABLE `account_base`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `account_base_label_unique` (`label`(255)),
  ADD KEY `account_base_label_index` (`label`(255));

--
-- Indexes for table `account_group`
--
ALTER TABLE `account_group`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `account_group_label_unique` (`account_base_id`,`label`(255)) USING BTREE,
  ADD KEY `account_group_label_index` (`label`(255));

--
-- Indexes for table `account_object`
--
ALTER TABLE `account_object`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `account_object_label_unique` (`account_type_id`,`label`(255)) USING BTREE,
  ADD KEY `account_object_label_index` (`label`(255));

--
-- Indexes for table `account_type`
--
ALTER TABLE `account_type`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `account_type_label_unique` (`account_group_id`,`label`(255)) USING BTREE,
  ADD KEY `account_type_label_index` (`label`(255));

--
-- Indexes for table `city`
--
ALTER TABLE `city`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `city_label_unique` (`label`(255)),
  ADD KEY `city_label_index` (`label`(255));

--
-- Indexes for table `log`
--
ALTER TABLE `log`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_name_unique` (`name`(255)),
  ADD KEY `role_name_index` (`name`(255));

--
-- Indexes for table `setting`
--
ALTER TABLE `setting`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name_unique` (`name`(255));

--
-- Indexes for table `signer`
--
ALTER TABLE `signer`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nip_unique` (`nip`(255));

--
-- Indexes for table `transaction`
--
ALTER TABLE `transaction`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_account_object_id_foreign` (`account_object_id`),
  ADD KEY `transaction_city_id_foreign` (`city_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username_unique` (`username`(255)),
  ADD KEY `username_fullname_index` (`username`(255),`fullname`(255)),
  ADD KEY `role_id_foreign` (`role_id`),
  ADD KEY `city_id_foreign` (`city_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `account_base`
--
ALTER TABLE `account_base`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT for table `account_group`
--
ALTER TABLE `account_group`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `account_object`
--
ALTER TABLE `account_object`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `account_type`
--
ALTER TABLE `account_type`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `city`
--
ALTER TABLE `city`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `log`
--
ALTER TABLE `log`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `setting`
--
ALTER TABLE `setting`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `signer`
--
ALTER TABLE `signer`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `transaction`
--
ALTER TABLE `transaction`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `account_group`
--
ALTER TABLE `account_group`
  ADD CONSTRAINT `account_base_id_foreign` FOREIGN KEY (`account_base_id`) REFERENCES `account_base` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `account_object`
--
ALTER TABLE `account_object`
  ADD CONSTRAINT `account_type_id_foreign` FOREIGN KEY (`account_type_id`) REFERENCES `account_type` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `account_type`
--
ALTER TABLE `account_type`
  ADD CONSTRAINT `account_group_id_foreign` FOREIGN KEY (`account_group_id`) REFERENCES `account_group` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `transaction`
--
ALTER TABLE `transaction`
  ADD CONSTRAINT `transaction_account_object_id_foreign` FOREIGN KEY (`account_object_id`) REFERENCES `account_object` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transaction_city_id_foreign` FOREIGN KEY (`city_id`) REFERENCES `city` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `city_id_foreign` FOREIGN KEY (`city_id`) REFERENCES `city` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
