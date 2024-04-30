<?php

class Plan_model extends CI_Model {
    
    function get_all_in($username, $filter, $order, $limit, $offset)
    {
        $additional = ["city_label_TYPE_text", "account_object_detail_sub_label_TYPE_text", "date_start_TYPE_daterange_start", "date_end_TYPE_daterange_end"];
        $filter = set_filter($filter, "budget", $additional);
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH r AS (
                SELECT 
                    b.*,
                    c.label AS city_label, 
                    CONCAT('(', CONCAT_WS('.', ab.label, ag.label, at.label, ao.label, aod.label, aods.label), ') ', aods.remark) AS account_object_detail_sub_label
                FROM budget b
                JOIN city c ON c.id=b.city_id AND c.active
                JOIN account_object_detail_sub aods ON aods.id=b.account_object_detail_sub_id AND aods.active
                JOIN account_object_detail aod ON aod.id=aods.account_object_detail_id AND aod.active
                JOIN account_object ao ON ao.id=aod.account_object_id AND ao.active
                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active 
                    AND (
                        LOWER(ab.remark) = LOWER('PENDAPATAN DAERAH')
                        OR
                        ab.label='4'
                    )
                WHERE YEAR(b.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            $filter 
            ORDER BY $order
            $limit_offset
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function get_all_out($username, $filter, $order, $limit, $offset)
    {
        $additional = ["city_label_TYPE_text", "account_object_detail_sub_label_TYPE_text", "date_start_TYPE_daterange_start", "date_end_TYPE_daterange_end"];
        $filter = set_filter($filter, "budget", $additional);
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH r AS (
                SELECT 
                    b.*,
                    c.label AS city_label, 
                    CONCAT('(', CONCAT_WS('.', ab.label, ag.label, at.label, ao.label, aod.label, aods.label), ') ', aods.remark) AS account_object_detail_sub_label
                FROM budget b
                JOIN city c ON c.id=b.city_id AND c.active
                JOIN account_object_detail_sub aods ON aods.id=b.account_object_detail_sub_id AND aods.active
                JOIN account_object_detail aod ON aod.id=aods.account_object_detail_id AND aod.active
                JOIN account_object ao ON ao.id=aod.account_object_id AND ao.active
                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active 
                    AND (
                        LOWER(ab.remark) = LOWER('BELANJA DAERAH')
                        OR
                        ab.label='5'
                    )
                WHERE YEAR(b.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            $filter 
            ORDER BY $order
            $limit_offset
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function get_all_cost($username, $filter, $order, $limit, $offset)
    {
        $additional = ["city_label_TYPE_text", "account_object_detail_sub_label_TYPE_text", "date_start_TYPE_daterange_start", "date_end_TYPE_daterange_end"];
        $filter = set_filter($filter, "budget", $additional);
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH r AS (
                SELECT 
                    b.*,
                    c.label AS city_label, 
                    CONCAT('(', CONCAT_WS('.', ab.label, ag.label, at.label, ao.label, aod.label, aods.label), ') ', aods.remark) AS account_object_detail_sub_label
                FROM budget b
                JOIN city c ON c.id=b.city_id AND c.active
                JOIN account_object_detail_sub aods ON aods.id=b.account_object_detail_sub_id AND aods.active
                JOIN account_object_detail aod ON aod.id=aods.account_object_detail_id AND aod.active
                JOIN account_object ao ON ao.id=aod.account_object_id AND ao.active
                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active 
                    AND (
                        LOWER(ab.remark) = LOWER('PEMBIAYAAN DAERAH')
                        OR
                        ab.label='6'
                    )
                WHERE YEAR(b.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            $filter 
            ORDER BY $order
            $limit_offset
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function get_detail_sub_plan_in($username, $filter, $order)
    {
        $order = set_order($order);
        
        $sql = "
            WITH r AS (
                SELECT
                    aods.id, aods.id AS value, 
                    CONCAT('(',CONCAT_WS('.', ab.label, ag.label, at.label, ao.label, aod.label, aods.label), ') ', aods.remark) AS label
                FROM account_object_detail_sub aods
                JOIN account_object_detail aod ON aod.id=aods.account_object_detail_id AND aod.active
                JOIN account_object ao ON ao.id=aod.account_object_id AND ao.active
                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active 
                    AND (
                        LOWER(ab.remark) = LOWER('PENDAPATAN DAERAH')
                        OR
                        ab.label='4'
                    )
                LEFT JOIN budget b ON b.account_object_detail_sub_id=aods.id 
                    AND YEAR(b.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                    $filter
                LEFT JOIN city c ON c.id=b.city_id AND c.active
                WHERE aods.active AND b.id IS NULL
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            ORDER BY $order
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function get_detail_sub_plan_out($username, $filter, $order)
    {
        $order = set_order($order);
        
        $sql = "
            WITH r AS (
                SELECT
                    aods.id, aods.id AS value, 
                    CONCAT('(',CONCAT_WS('.', ab.label, ag.label, at.label, ao.label, aod.label, aods.label), ') ', aods.remark) AS label
                FROM account_object_detail_sub aods
                JOIN account_object_detail aod ON aod.id=aods.account_object_detail_id AND aod.active
                JOIN account_object ao ON ao.id=aod.account_object_id AND ao.active
                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active  
                    AND (
                        LOWER(ab.remark) = LOWER('BELANJA DAERAH')
                        OR
                        ab.label='5'
                    )
                LEFT JOIN budget b ON b.account_object_detail_sub_id=aods.id 
                    AND YEAR(b.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                    $filter
                LEFT JOIN city c ON c.id=b.city_id AND c.active
                WHERE aods.active AND b.id IS NULL
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            ORDER BY $order
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function get_detail_sub_plan_cost($username, $filter, $order)
    {
        $order = set_order($order);
        
        $sql = "
            WITH r AS (
                SELECT
                    aods.id, aods.id AS value, 
                    CONCAT('(',CONCAT_WS('.', ab.label, ag.label, at.label, ao.label, aod.label, aods.label), ') ', aods.remark) AS label
                FROM account_object_detail_sub aods
                JOIN account_object_detail aod ON aod.id=aods.account_object_detail_id AND aod.active
                JOIN account_object ao ON ao.id=aod.account_object_id AND ao.active
                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active  
                    AND (
                        LOWER(ab.remark) = LOWER('PEMBIAYAAN DAERAH')
                        OR
                        ab.label='6'
                    )
                LEFT JOIN budget b ON b.account_object_detail_sub_id=aods.id 
                    AND YEAR(b.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                    $filter
                LEFT JOIN city c ON c.id=b.city_id AND c.active
                WHERE aods.active AND b.id IS NULL
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            ORDER BY $order
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function get_last_in($username, $filter, $order, $limit, $offset)
    {
        $filter = set_filter($filter, "budget");
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH r AS (
                SELECT 
                    b.*
                FROM budget b
                JOIN city c ON c.id=b.city_id AND c.active
                JOIN account_object_detail_sub aods ON aods.id=b.account_object_detail_sub_id AND aods.active
                JOIN account_object_detail aod ON aod.id=aods.account_object_detail_id AND aod.active
                JOIN account_object ao ON ao.id=aod.account_object_id AND ao.active
                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active  
                    AND (
                        LOWER(ab.remark) = LOWER('PENDAPATAN DAERAH')
                        OR
                        ab.label='4'
                    )
                WHERE NOT YEAR(b.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            $filter 
            ORDER BY $order
            $limit_offset
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function get_last_out($username, $filter, $order, $limit, $offset)
    {
        $filter = set_filter($filter, "budget");
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH r AS (
                SELECT 
                    b.*
                FROM budget b
                JOIN city c ON c.id=b.city_id AND c.active
                JOIN account_object_detail_sub aods ON aods.id=b.account_object_detail_sub_id AND aods.active
                JOIN account_object_detail aod ON aod.id=aods.account_object_detail_id AND aod.active
                JOIN account_object ao ON ao.id=aod.account_object_id AND ao.active
                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active 
                    AND (
                        LOWER(ab.remark) = LOWER('BELANJA DAERAH')
                        OR
                        ab.label='5'
                    )
                WHERE NOT YEAR(b.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            $filter 
            ORDER BY $order
            $limit_offset
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function get_last_cost($username, $filter, $order, $limit, $offset)
    {
        $filter = set_filter($filter, "budget");
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH p AS (
                SELECT 
                    b.*
                FROM budget b
                JOIN city c ON c.id=b.city_id AND c.active
                JOIN account_object_detail_sub aods ON aods.id=b.account_object_detail_sub_id AND aods.active
                JOIN account_object_detail aod ON aod.id=aods.account_object_detail_id AND aod.active
                JOIN account_object ao ON ao.id=aod.account_object_id AND ao.active
                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active 
                    AND (
                        LOWER(ab.remark) = LOWER('PEMBIAYAAN DAERAH')
                        OR
                        ab.label='6'
                    )
                WHERE NOT YEAR(b.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            $filter 
            ORDER BY $order
            $limit_offset
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }
    
    function get_find_budget_in($username, $filter, $order, $inline)
    {
        $additional = ["account_object_detail_sub_code_TYPE_text"];
        $filter = set_filter($filter, "", $additional);
        $order = set_order($order);

        $sql = "       
            WITH aol AS (
                SELECT  
                    saods.id AS account_object_detail_sub_id, 
                    CONCAT_WS('.', sab.label, sag.label, sat.label, sao.label, saod.label, saods.label) AS account_object_detail_sub_code,
                    saods.remark AS account_object_detail_sub_label
                FROM account_base sab
                JOIN account_group sag ON sag.account_base_id=sab.id AND sag.active
                JOIN account_type sat ON sat.account_group_id=sag.id AND sat.active
                JOIN account_object sao ON sao.account_type_id=sat.id AND sao.active
                JOIN account_object_detail saod ON saod.account_object_id=sao.id AND saod.active
                JOIN account_object_detail_sub saods ON saods.account_object_detail_id=saod.id AND saods.active
                WHERE sab.active
                    AND (
                        LOWER(sab.remark) = LOWER('PENDAPATAN DAERAH') 
                        OR
                        sab.label='4' 
                    )
            ), r AS (
                SELECT 
                    aol.*,
                    b.id,
                    b.city_id,
                    YEAR(b.date) AS budget_year
                FROM aol
                LEFT JOIN budget b ON b.account_object_detail_sub_id=aol.account_object_detail_sub_id
                    AND YEAR(b.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                    $inline
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            $filter 
            ORDER BY $order
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function get_find_budget_out($username, $filter, $order, $inline)
    {
        $additional = ["account_object_detail_sub_code_TYPE_text"];
        $filter = set_filter($filter, "", $additional);
        $order = set_order($order);

        $sql = "       
            WITH aol AS (
                SELECT  
                    saods.id AS account_object_detail_sub_id, 
                    CONCAT_WS('.', sab.label, sag.label, sat.label, sao.label, saod.label, saods.label) AS account_object_detail_sub_code,
                    saods.remark AS account_object_detail_sub_label
                FROM account_base sab
                JOIN account_group sag ON sag.account_base_id=sab.id AND sag.active
                JOIN account_type sat ON sat.account_group_id=sag.id AND sat.active
                JOIN account_object sao ON sao.account_type_id=sat.id AND sao.active
                JOIN account_object_detail saod ON saod.account_object_id=sao.id AND saod.active
                JOIN account_object_detail_sub saods ON saods.account_object_detail_id=saod.id AND saods.active
                WHERE sab.active
                    AND (
                        LOWER(sab.remark) = LOWER('BELANJA DAERAH')
                        OR
                        sab.label='5'
                    )
            ), r AS (
                SELECT 
                    aol.*,
                    b.id,
                    b.city_id,
                    YEAR(b.date) AS budget_year
                FROM aol
                LEFT JOIN budget b ON b.account_object_detail_sub_id=aol.account_object_detail_sub_id
                    AND YEAR(b.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                    $inline
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            $filter 
            ORDER BY $order
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }
    
    function get_find_budget_cost($username, $filter, $order, $inline)
    {
        $additional = ["account_object_detail_sub_code_TYPE_text"];
        $filter = set_filter($filter, "", $additional);
        $order = set_order($order);

        $sql = "       
            WITH aol AS (
                SELECT  
                    saods.id AS account_object_detail_sub_id, 
                    CONCAT_WS('.', sab.label, sag.label, sat.label, sao.label, saod.label, saods.label) AS account_object_detail_sub_code,
                    saods.remark AS account_object_detail_sub_label
                FROM account_base sab
                JOIN account_group sag ON sag.account_base_id=sab.id AND sag.active
                JOIN account_type sat ON sat.account_group_id=sag.id AND sat.active
                JOIN account_object sao ON sao.account_type_id=sat.id AND sao.active
                JOIN account_object_detail saod ON saod.account_object_id=sao.id AND saod.active
                JOIN account_object_detail_sub saods ON saods.account_object_detail_id=saod.id AND saods.active
                WHERE sab.active
                    AND (
                        LOWER(sab.remark) = LOWER('PEMBIAYAAN DAERAH')
                        OR
                        sab.label='6'
                    )
            ), r AS (
                SELECT 
                    aol.*,
                    b.id,
                    b.city_id,
                    YEAR(b.date) AS budget_year
                FROM aol
                LEFT JOIN budget b ON b.account_object_detail_sub_id=aol.account_object_detail_sub_id
                    AND YEAR(b.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                    $inline
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            $filter 
            ORDER BY $order
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function save($params, $username)
    {
        if ($params["mode"] == "C") {
            $default_date = "CONCAT_WS('-', (SELECT u.which_year FROM user u WHERE u.username = '$username'), '01', '01')";
            $sql = "
                INSERT INTO budget(account_object_detail_sub_id, city_id, amount, date)
                VALUES (
                    " . $params['account_object_detail_sub_id'] . ",
                    " . $params['city_id'] . ",
                    '" . $params['amount'] . "',
                    $default_date
                )
            ";
            $query = $this->db->query($sql);
        } else if ($params["mode"] == "U") {
            $sql = "
                UPDATE budget 
                    SET amount = '" . $params['amount'] . "'
                WHERE id = " . $params['id'] . "
            ";
            $query = $this->db->query($sql);
        }

        return model_response($query, 1);
    }

    function delete($id)
    {
        $sql = "
            DELETE FROM
                budget
            WHERE id = " . $id . "
        ";
        $query = $this->db->query($sql);

        return model_response($query, 1);
    }
}
