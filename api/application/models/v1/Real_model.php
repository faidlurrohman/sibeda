<?php

class Real_model extends CI_Model {
    
    function get_all_in($username, $filter, $order, $limit, $offset)
    {
        $additional = ["city_label_TYPE_text", "account_object_detail_sub_label_TYPE_text", "trans_date_start_TYPE_daterange_start", "trans_date_end_TYPE_daterange_end"];
        $filter = set_filter($filter, "transaction", $additional);
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH p AS (
                SELECT 
                    MIN(id) plan_id
                FROM transaction
                WHERE plan_amount >= 0 AND real_amount = 0
                GROUP BY YEAR(trans_date), account_object_detail_sub_id, city_id
            ), r AS (
                SELECT 
                    st.*,
                    c.label AS city_label, 
                    CONCAT('(', CONCAT_WS('.', ab.label, ag.label, at.label, ao.label, aod.label, aods.label), ') ', aods.remark) AS account_object_detail_sub_label,
                    YEAR(st.trans_date) = YEAR(CURRENT_DATE) AS is_editable
                FROM transaction st
                JOIN city c ON c.id=st.city_id AND c.active
                JOIN account_object_detail_sub aods ON aods.id=st.account_object_detail_sub_id AND aods.active
                JOIN account_object_detail aod ON aod.id=aods.account_object_detail_id AND aod.active
                JOIN account_object ao ON ao.id=aod.account_object_id AND ao.active
                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active AND LOWER(ab.remark) = LOWER('PENDAPATAN DAERAH')
                WHERE st.id NOT IN (SELECT plan_id FROM p)
                AND YEAR(st.trans_date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
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
        $additional = ["city_label_TYPE_text", "account_object_detail_sub_label_TYPE_text", "trans_date_start_TYPE_daterange_start", "trans_date_end_TYPE_daterange_end"];
        $filter = set_filter($filter, "transaction", $additional);
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH p AS (
                SELECT 
                    MIN(id) plan_id
                FROM transaction
                WHERE plan_amount >= 0 AND real_amount = 0
                GROUP BY YEAR(trans_date), account_object_detail_sub_id, city_id
            ), r AS (
                SELECT 
                    st.*,
                    c.label AS city_label, 
                    CONCAT('(', CONCAT_WS('.', ab.label, ag.label, at.label, ao.label, aod.label, aods.label), ') ', aods.remark) AS account_object_detail_sub_label,
                    YEAR(st.trans_date) = YEAR(CURRENT_DATE) AS is_editable
                FROM transaction st
                JOIN city c ON c.id=st.city_id AND c.active
                JOIN account_object_detail_sub aods ON aods.id=st.account_object_detail_sub_id AND aods.active
                JOIN account_object_detail aod ON aod.id=aods.account_object_detail_id AND aod.active
                JOIN account_object ao ON ao.id=aod.account_object_id AND ao.active
                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active AND LOWER(ab.remark) = LOWER('BELANJA DAERAH')
                WHERE st.id NOT IN (SELECT plan_id FROM p)
                AND YEAR(st.trans_date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
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
        $additional = ["city_label_TYPE_text", "account_object_detail_sub_label_TYPE_text", "trans_date_start_TYPE_daterange_start", "trans_date_end_TYPE_daterange_end"];
        $filter = set_filter($filter, "transaction", $additional);
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH p AS (
                SELECT 
                    MIN(id) plan_id
                FROM transaction
                WHERE plan_amount >= 0 AND real_amount = 0
                GROUP BY YEAR(trans_date), account_object_detail_sub_id, city_id
            ), r AS (
                SELECT 
                    st.*,
                    c.label AS city_label, 
                    CONCAT('(', CONCAT_WS('.', ab.label, ag.label, at.label, ao.label, aod.label, aods.label), ') ', aods.remark) AS account_object_detail_sub_label,
                    YEAR(st.trans_date) = YEAR(CURRENT_DATE) AS is_editable
                FROM transaction st
                JOIN city c ON c.id=st.city_id AND c.active
                JOIN account_object_detail_sub aods ON aods.id=st.account_object_detail_sub_id AND aods.active
                JOIN account_object_detail aod ON aod.id=aods.account_object_detail_id AND aod.active
                JOIN account_object ao ON ao.id=aod.account_object_id AND ao.active
                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active AND LOWER(ab.remark) = LOWER('PEMBIAYAAN DAERAH')
                WHERE st.id NOT IN (SELECT plan_id FROM p)
                AND YEAR(st.trans_date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
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
            WITH p AS (
                SELECT 
                    MAX(st.id) transaction_id, st.account_object_detail_sub_id
                FROM transaction st
                JOIN city c ON c.id=st.city_id AND c.active 
                WHERE st.active 
                    AND st.plan_amount >= 0 AND st.real_amount = 0
                    -- AND YEAR(st.trans_date) = YEAR(CURRENT_DATE)
                    AND YEAR(st.trans_date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                    $filter
                GROUP BY YEAR(st.trans_date), st.account_object_detail_sub_id, st.city_id
            ), r AS (
                SELECT
                    aods.id, aods.id AS value, 
                    CONCAT('(',CONCAT_WS('.', ab.label, ag.label, at.label, ao.label, aod.label, aods.label), ') ', aods.remark) AS label
                FROM account_object_detail_sub aods
                JOIN account_object_detail aod ON aod.id=aods.account_object_detail_id AND aod.active
                JOIN account_object ao ON ao.id=aod.account_object_id AND ao.active
                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active AND LOWER(ab.remark) = LOWER('PENDAPATAN DAERAH')
                LEFT JOIN p ON p.account_object_detail_sub_id=aods.id
                WHERE p.transaction_id IS NOT NULL
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
            WITH p AS (
                SELECT 
                    MAX(st.id) transaction_id, st.account_object_detail_sub_id
                FROM transaction st
                JOIN city c ON c.id=st.city_id AND c.active 
                WHERE st.active 
                    AND st.plan_amount >= 0 AND st.real_amount = 0
                    -- AND YEAR(st.trans_date) = YEAR(CURRENT_DATE)
                    AND YEAR(st.trans_date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                    $filter
                GROUP BY YEAR(st.trans_date), st.account_object_detail_sub_id, st.city_id
            ), r AS (
                SELECT
                    aods.id, aods.id AS value, 
                    CONCAT('(',CONCAT_WS('.', ab.label, ag.label, at.label, ao.label, aod.label, aods.label), ') ', aods.remark) AS label
                FROM account_object_detail_sub aods
                JOIN account_object_detail aod ON aod.id=aods.account_object_detail_id AND aod.active
                JOIN account_object ao ON ao.id=aod.account_object_id AND ao.active
                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active AND LOWER(ab.remark) = LOWER('BELANJA DAERAH')
                LEFT JOIN p ON p.account_object_detail_sub_id=aods.id
                WHERE p.transaction_id IS NOT NULL
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
            WITH p AS (
                SELECT 
                    MAX(st.id) transaction_id, st.account_object_detail_sub_id
                FROM transaction st
                JOIN city c ON c.id=st.city_id AND c.active 
                WHERE st.active 
                    AND st.plan_amount >= 0 AND st.real_amount = 0
                    -- AND YEAR(st.trans_date) = YEAR(CURRENT_DATE)
                    AND YEAR(st.trans_date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                    $filter
                GROUP BY YEAR(st.trans_date), st.account_object_detail_sub_id, st.city_id
            ), r AS (
                SELECT
                    aods.id, aods.id AS value, 
                    CONCAT('(',CONCAT_WS('.', ab.label, ag.label, at.label, ao.label, aod.label, aods.label), ') ', aods.remark) AS label
                FROM account_object_detail_sub aods
                JOIN account_object_detail aod ON aod.id=aods.account_object_detail_id AND aod.active
                JOIN account_object ao ON ao.id=aod.account_object_id AND ao.active
                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active AND LOWER(ab.remark) = LOWER('PEMBIAYAAN DAERAH')
                LEFT JOIN p ON p.account_object_detail_sub_id=aods.id
                WHERE p.transaction_id IS NOT NULL
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            ORDER BY $order
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function get_last_in($filter, $order, $limit, $offset)
    {
        $filter = set_filter($filter, "transaction");
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH p AS (
                SELECT 
                    MIN(t.id) plan_id,
                    t.account_object_detail_sub_id,
                    t.city_id
                FROM transaction t
                JOIN city c ON c.id=t.city_id AND c.active
                JOIN account_object_detail_sub aods ON aods.id=t.account_object_detail_sub_id AND aods.active
                JOIN account_object_detail aod ON aod.id=aods.account_object_detail_id AND aod.active
                JOIN account_object ao ON ao.id=aod.account_object_id AND ao.active
                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active AND LOWER(ab.remark) = LOWER('PENDAPATAN DAERAH')
                WHERE t.plan_amount >= 0 AND t.real_amount = 0
                GROUP BY YEAR(t.trans_date), t.account_object_detail_sub_id, t.city_id
            ), r AS (
                SELECT 
                    st.id, 
                    st.account_object_detail_sub_id, 
                    st.city_id, 
                    COALESCE((SELECT plan_amount FROM transaction t WHERE t.id=p.plan_id), st.plan_amount, 0) plan_amount, 
                    st.real_amount, 
                    st.trans_date, 
                    st.active 
                FROM transaction st
                LEFT JOIN p ON p.account_object_detail_sub_id=st.account_object_detail_sub_id
                WHERE st.active
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            $filter 
            ORDER BY $order
            $limit_offset
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function get_last_out($filter, $order, $limit, $offset)
    {
        $filter = set_filter($filter, "transaction");
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH p AS (
                SELECT 
                    MIN(t.id) plan_id,
                    t.account_object_detail_sub_id,
                    t.city_id
                FROM transaction t
                JOIN city c ON c.id=t.city_id AND c.active
                JOIN account_object_detail_sub aods ON aods.id=t.account_object_detail_sub_id AND aods.active
                JOIN account_object_detail aod ON aod.id=aods.account_object_detail_id AND aod.active
                JOIN account_object ao ON ao.id=aod.account_object_id AND ao.active
                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active AND LOWER(ab.remark) = LOWER('BELANJA DAERAH')
                WHERE t.plan_amount >= 0 AND t.real_amount = 0
                GROUP BY YEAR(t.trans_date), t.account_object_detail_sub_id, t.city_id
            ), r AS (
                SELECT 
                    st.id, 
                    st.account_object_detail_sub_id, 
                    st.city_id, 
                    COALESCE((SELECT plan_amount FROM transaction t WHERE t.id=p.plan_id), st.plan_amount, 0) plan_amount, 
                    st.real_amount, 
                    st.trans_date, 
                    st.active 
                FROM transaction st
                LEFT JOIN p ON p.account_object_detail_sub_id=st.account_object_detail_sub_id
                WHERE st.active
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            $filter 
            ORDER BY $order
            $limit_offset
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function get_last_cost($filter, $order, $limit, $offset)
    {
        $filter = set_filter($filter, "transaction");
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH p AS (
                SELECT 
                    MIN(t.id) plan_id,
                    t.account_object_detail_sub_id,
                    t.city_id
                FROM transaction t
                JOIN city c ON c.id=t.city_id AND c.active
                JOIN account_object_detail_sub aods ON aods.id=t.account_object_detail_sub_id AND aods.active
                JOIN account_object_detail aod ON aod.id=aods.account_object_detail_id AND aod.active
                JOIN account_object ao ON ao.id=aod.account_object_id AND ao.active
                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active AND LOWER(ab.remark) = LOWER('PEMBIAYAAN DAERAH')
                WHERE t.plan_amount >= 0 AND t.real_amount = 0
                GROUP BY YEAR(t.trans_date), t.account_object_detail_sub_id, t.city_id
            ), r AS (
                SELECT 
                    st.id, 
                    st.account_object_detail_sub_id, 
                    st.city_id, 
                    COALESCE((SELECT plan_amount FROM transaction t WHERE t.id=p.plan_id), st.plan_amount, 0) plan_amount, 
                    st.real_amount, 
                    st.trans_date, 
                    st.active 
                FROM transaction st
                LEFT JOIN p ON p.account_object_detail_sub_id=st.account_object_detail_sub_id
                WHERE st.active
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            $filter 
            ORDER BY $order
            $limit_offset
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function save($params)
    {
        if ($params["mode"] == "C") {
            $sql = "
                INSERT INTO transaction(account_object_detail_sub_id, city_id, plan_amount, real_amount, trans_date)
                VALUES (
                    " . $params['account_object_detail_sub_id'] . ",
                    " . $params['city_id'] . ",
                    '" . $params['plan_amount'] . "',
                    '" . $params['real_amount'] . "',
                    '" . $params['trans_date'] . "'
                )
            ";
            $query = $this->db->query($sql);
        } else if ($params["mode"] == "U") {
            $sql = "
                UPDATE transaction 
                    SET plan_amount = '" . $params['plan_amount'] . "',
                        real_amount = '" . $params['real_amount'] . "'
                WHERE id = " . $params['id'] . "
            ";
            $query = $this->db->query($sql);
        }

        return model_response($query, 1);
    }

    function delete($id)
    {
        $sql = "
            UPDATE transaction 
                SET active = NOT active
            WHERE id = " . $id . "
        ";
        $query = $this->db->query($sql);

        return model_response($query, 1);
    }
}
