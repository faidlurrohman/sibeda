<?php

class Real_model extends CI_Model {
    
    function get_all_in($username, $filter, $order, $limit, $offset)
    {
        $additional = ["city_label_TYPE_text", "account_object_detail_sub_label_TYPE_text", "date_start_TYPE_daterange_start", "date_end_TYPE_daterange_end"];
        $filter = set_filter($filter, "realization", $additional);
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH r AS (
                SELECT 
                    MAX(r.id) AS id,
                    r.account_object_detail_sub_id,
                    r.city_id,
                    MAX(r.amount) AS amount,
                    MAX(r.date) AS date,
                    c.label AS city_label, 
                    CONCAT('(', CONCAT_WS('.', ab.label, ag.label, at.label, ao.label, aod.label, aods.label), ') ', aods.remark) AS account_object_detail_sub_label
                FROM realization r
                JOIN city c ON c.id=r.city_id AND c.active
                JOIN account_object_detail_sub aods ON aods.id=r.account_object_detail_sub_id AND aods.active
                JOIN account_object_detail aod ON aod.id=aods.account_object_detail_id AND aod.active
                JOIN account_object ao ON ao.id=aod.account_object_id AND ao.active
                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active 
                    AND (
                        LOWER(ab.remark) = LOWER('PENDAPATAN DAERAH')
                        OR
                        ab.id=4
                    )
                WHERE YEAR(r.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                GROUP BY YEAR(r.date), r.account_object_detail_sub_id, r.city_id
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
        $filter = set_filter($filter, "realization", $additional);
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH r AS (
                SELECT 
                    MAX(r.id) AS id,
                    r.account_object_detail_sub_id,
                    r.city_id,
                    MAX(r.amount) AS amount,
                    MAX(r.date) AS date,
                    c.label AS city_label, 
                    CONCAT('(', CONCAT_WS('.', ab.label, ag.label, at.label, ao.label, aod.label, aods.label), ') ', aods.remark) AS account_object_detail_sub_label
                FROM realization r
                JOIN city c ON c.id=r.city_id AND c.active
                JOIN account_object_detail_sub aods ON aods.id=r.account_object_detail_sub_id AND aods.active
                JOIN account_object_detail aod ON aod.id=aods.account_object_detail_id AND aod.active
                JOIN account_object ao ON ao.id=aod.account_object_id AND ao.active
                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active 
                    AND (
                        LOWER(ab.remark) = LOWER('BELANJA DAERAH')
                        OR
                        ab.id=5
                    )
                WHERE YEAR(r.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                GROUP BY YEAR(r.date), r.account_object_detail_sub_id, r.city_id
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
        $filter = set_filter($filter, "realization", $additional);
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH r AS (
                SELECT 
                    MAX(r.id) AS id,
                    r.account_object_detail_sub_id,
                    r.city_id,
                    MAX(r.amount) AS amount,
                    MAX(r.date) AS date,
                    c.label AS city_label, 
                    CONCAT('(', CONCAT_WS('.', ab.label, ag.label, at.label, ao.label, aod.label, aods.label), ') ', aods.remark) AS account_object_detail_sub_label
                FROM realization r
                JOIN city c ON c.id=r.city_id AND c.active
                JOIN account_object_detail_sub aods ON aods.id=r.account_object_detail_sub_id AND aods.active
                JOIN account_object_detail aod ON aod.id=aods.account_object_detail_id AND aod.active
                JOIN account_object ao ON ao.id=aod.account_object_id AND ao.active
                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active 
                    AND (
                        LOWER(ab.remark) = LOWER('PEMBIAYAAN DAERAH')
                        OR
                        ab.id=6
                    )
                WHERE YEAR(r.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                GROUP BY YEAR(r.date), r.account_object_detail_sub_id, r.city_id
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            $filter 
            ORDER BY $order
            $limit_offset
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function get_detail_sub_real_in($username, $filter, $order)
    {
        $order = set_order($order);
        
        $sql = "
            WITH r AS (
                SELECT DISTINCT
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
                        ab.id=4
                    )
                JOIN budget b ON b.account_object_detail_sub_id=aods.id
                    AND YEAR(b.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                    $filter
                JOIN city c ON c.id=b.city_id AND c.active
                LEFT JOIN realization r ON r.account_object_detail_sub_id=b.account_object_detail_sub_id
                    AND YEAR(r.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                    AND r.city_id=b.city_id
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            ORDER BY $order
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function get_detail_sub_real_out($username, $filter, $order)
    {
        $order = set_order($order);
        
        $sql = "
            WITH r AS (
                SELECT DISTINCT
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
                        ab.id=5
                    )
                JOIN budget b ON b.account_object_detail_sub_id=aods.id
                    AND YEAR(b.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                    $filter
                JOIN city c ON c.id=b.city_id AND c.active
                LEFT JOIN realization r ON r.account_object_detail_sub_id=b.account_object_detail_sub_id
                    AND YEAR(r.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                    AND r.city_id=b.city_id
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            ORDER BY $order
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function get_detail_sub_real_cost($username, $filter, $order)
    {
        $order = set_order($order);
        
        $sql = "
            WITH r AS (
                SELECT DISTINCT
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
                        ab.id=6
                    )
                JOIN budget b ON b.account_object_detail_sub_id=aods.id
                    AND YEAR(b.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                    $filter
                JOIN city c ON c.id=b.city_id AND c.active
                LEFT JOIN realization r ON r.account_object_detail_sub_id=b.account_object_detail_sub_id
                    AND YEAR(r.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                    AND r.city_id=b.city_id
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            ORDER BY $order
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function get_last_in($username, $filter, $order, $limit, $offset)
    {
        $additional = ["realization_date_TYPE_date"];
        $filter = set_filter($filter, "budget", $additional);
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH r AS (
                SELECT
                    b.id AS budget_id,
                    b.account_object_detail_sub_id,
                    b.city_id,
                    b.amount AS budget_amount,
                    b.date AS budget_date,
                    r.id AS realization_id,
                    r.amount AS realization_amount,
                    r.date AS realization_date
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
                        ab.id=4
                    )
                LEFT JOIN realization r ON r.account_object_detail_sub_id=b.account_object_detail_sub_id
                    AND r.city_id=b.city_id
                    AND YEAR(r.date)=YEAR(b.date)
                WHERE YEAR(b.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
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
        $additional = ["realization_date_TYPE_date"];
        $filter = set_filter($filter, "budget", $additional);
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
           WITH r AS (
                SELECT
                    b.id AS budget_id,
                    b.account_object_detail_sub_id,
                    b.city_id,
                    b.amount AS budget_amount,
                    b.date AS budget_date,
                    r.id AS realization_id,
                    r.amount AS realization_amount,
                    r.date AS realization_date
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
                        ab.id=5
                    )
                LEFT JOIN realization r ON r.account_object_detail_sub_id=b.account_object_detail_sub_id
                    AND r.city_id=b.city_id
                    AND YEAR(r.date)=YEAR(b.date)
                WHERE YEAR(b.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
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
        $additional = ["realization_date_TYPE_date"];
        $filter = set_filter($filter, "budget", $additional);
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
           WITH r AS (
                SELECT
                    b.id AS budget_id,
                    b.account_object_detail_sub_id,
                    b.city_id,
                    b.amount AS budget_amount,
                    b.date AS budget_date,
                    r.id AS realization_id,
                    r.amount AS realization_amount,
                    r.date AS realization_date
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
                        ab.id=6
                    )
                LEFT JOIN realization r ON r.account_object_detail_sub_id=b.account_object_detail_sub_id
                    AND r.city_id=b.city_id
                    AND YEAR(r.date)=YEAR(b.date)
                WHERE YEAR(b.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE 
            $filter 
            ORDER BY $order
            $limit_offset
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function get_template_in($username, $filter, $order)
    {
        $order = set_order($order);
        
        $sql = "
            WITH r AS (
                SELECT 
                    aods.id,
                    CONCAT_WS('.', ab.label, ag.label, at.label, ao.label, aod.label, aods.label) AS code,
                    aods.remark AS name,
                    b.amount AS budget_amount,
                    COALESCE(MAX(r.amount),0) AS realization_amount,
                    MAX(r.date) AS realization_date
                FROM account_object_detail_sub aods
                JOIN account_object_detail aod ON aod.id=aods.account_object_detail_id AND aod.active
                JOIN account_object ao ON ao.id=aod.account_object_id AND ao.active
                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active 
                    AND (
                        LOWER(ab.remark) = LOWER('PENDAPATAN DAERAH')
                        OR
                        ab.id=4
                    )
                JOIN budget b ON b.account_object_detail_sub_id=aods.id
                    AND YEAR(b.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                    $filter
                JOIN city c ON c.id=b.city_id AND c.active
                LEFT JOIN realization r ON r.account_object_detail_sub_id=b.account_object_detail_sub_id
                    AND YEAR(r.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                    AND r.city_id=b.city_id
                GROUP BY YEAR(b.date), b.account_object_detail_sub_id, b.city_id
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            ORDER BY $order
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }
    
    function get_template_out($username, $filter, $order)
    {
        $order = set_order($order);
        
        $sql = "
            WITH r AS (
                SELECT 
                    aods.id,
                    CONCAT_WS('.', ab.label, ag.label, at.label, ao.label, aod.label, aods.label) AS code,
                    aods.remark AS name,
                    b.amount AS budget_amount,
                    COALESCE(MAX(r.amount),0) AS realization_amount,
                    MAX(r.date) AS realization_date
                FROM account_object_detail_sub aods
                JOIN account_object_detail aod ON aod.id=aods.account_object_detail_id AND aod.active
                JOIN account_object ao ON ao.id=aod.account_object_id AND ao.active
                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active 
                    AND (
                        LOWER(ab.remark) = LOWER('BELANJA DAERAH')
                        OR
                        ab.id=5
                    )
                JOIN budget b ON b.account_object_detail_sub_id=aods.id
                    AND YEAR(b.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                    $filter
                JOIN city c ON c.id=b.city_id AND c.active
                LEFT JOIN realization r ON r.account_object_detail_sub_id=b.account_object_detail_sub_id
                    AND YEAR(r.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                    AND r.city_id=b.city_id
                GROUP BY YEAR(b.date), b.account_object_detail_sub_id, b.city_id
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            ORDER BY $order
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }
    
    function get_template_cost($username, $filter, $order)
    {
        $order = set_order($order);
        
        $sql = "
            WITH r AS (
                SELECT 
                    aods.id,
                    CONCAT_WS('.', ab.label, ag.label, at.label, ao.label, aod.label, aods.label) AS code,
                    aods.remark AS name,
                    b.amount AS budget_amount,
                    COALESCE(MAX(r.amount),0) AS realization_amount,
                    MAX(r.date) AS realization_date
                FROM account_object_detail_sub aods
                JOIN account_object_detail aod ON aod.id=aods.account_object_detail_id AND aod.active
                JOIN account_object ao ON ao.id=aod.account_object_id AND ao.active
                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active 
                    AND (
                        LOWER(ab.remark) = LOWER('PEMBIAYAAN DAERAH')
                        OR
                        ab.id=6
                    )
                JOIN budget b ON b.account_object_detail_sub_id=aods.id
                    AND YEAR(b.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                    $filter
                JOIN city c ON c.id=b.city_id AND c.active
                LEFT JOIN realization r ON r.account_object_detail_sub_id=b.account_object_detail_sub_id
                    AND YEAR(r.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                    AND r.city_id=b.city_id
                GROUP BY YEAR(b.date), b.account_object_detail_sub_id, b.city_id
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            ORDER BY $order
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }
    
    function get_find_realization_in($username, $filter, $order, $inline)
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
                        LOWER(sab.remark) IN(LOWER('PENDAPATAN DAERAH')) 
                        OR
                        sab.id IN(4) 
                    )
            ), r AS (
                SELECT 
                    aol.*,
                    r.id,
                    r.city_id,
                    r.date
                FROM aol
                LEFT JOIN realization r ON r.account_object_detail_sub_id=aol.account_object_detail_sub_id
                    AND YEAR(r.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                    $inline
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE
            $filter
            ORDER BY $order
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }
    
    function get_find_realization_out($username, $filter, $order, $inline)
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
                        LOWER(sab.remark) IN(LOWER('BELANJA DAERAH')) 
                        OR
                        sab.id IN(5) 
                    )
            ), r AS (
                SELECT 
                    aol.*,
                    r.id,
                    r.city_id,
                    r.date
                FROM aol
                LEFT JOIN realization r ON r.account_object_detail_sub_id=aol.account_object_detail_sub_id
                    AND YEAR(r.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                    $inline
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE
            $filter
            ORDER BY $order
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }
    
    function get_find_realization_cost($username, $filter, $order, $inline)
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
                        LOWER(sab.remark) IN(LOWER('PEMBIAYAAN DAERAH')) 
                        OR
                        sab.id IN(6) 
                    )
            ), r AS (
                SELECT 
                    aol.*,
                    r.id,
                    r.city_id,
                    r.date
                FROM aol
                LEFT JOIN realization r ON r.account_object_detail_sub_id=aol.account_object_detail_sub_id
                    AND YEAR(r.date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                    $inline
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE
            $filter
            ORDER BY $order
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function save($params)
    {
        if ($params["mode"] == "C") {
            $sql = "
                INSERT INTO realization(account_object_detail_sub_id, city_id, amount, date)
                VALUES (
                    " . $params['account_object_detail_sub_id'] . ",
                    " . $params['city_id'] . ",
                    '" . $params['amount'] . "',
                    '" . $params['date'] . "'
                )
            ";
            $query = $this->db->query($sql);
        } else if ($params["mode"] == "U") {
            $sql = "
                UPDATE realization 
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
                realization
            WHERE id = " . $id . "
        ";
        $query = $this->db->query($sql);

        return model_response($query, 1);
    }
}
