<?php

class Transaction_model extends CI_Model {

    function get_all_plan($filter, $order, $limit, $offset)
    {
        $additional = ["city_label_TYPE_text", "account_object_label_TYPE_text", "trans_date_start_TYPE_daterange_start", "trans_date_end_TYPE_daterange_end"];
        $filter = set_filter($filter, "transaction", $additional);
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH p AS (
                SELECT 
                    MIN(id) plan_id
                FROM transaction
                WHERE plan_amount >= 0 AND real_amount = 0
                GROUP BY YEAR(trans_date), account_object_id, city_id
            ), r AS (
                SELECT 
                    st.*,
                    c.label AS city_label, 
                    CONCAT('(', CONCAT_WS('.', ab.label, ag.label, at.label, ao.label), ') ', ao.remark) AS account_object_label,
                    YEAR(st.trans_date) = YEAR(CURRENT_DATE) AS is_editable
                FROM transaction st
                JOIN city c ON c.id=st.city_id AND c.active
                JOIN account_object ao ON ao.id=st.account_object_id AND ao.active
                JOIN account_type at ON at.id=ao.account_type_id AND at.active
                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active
                WHERE st.id IN (SELECT plan_id FROM p)
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            $filter 
            ORDER BY $order
            $limit_offset
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function get_all_real($filter, $order, $limit, $offset)
    {
        $additional = ["city_label_TYPE_text", "account_object_label_TYPE_text", "trans_date_start_TYPE_daterange_start", "trans_date_end_TYPE_daterange_end"];
        $filter = set_filter($filter, "transaction", $additional);
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
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
                INSERT INTO transaction(account_object_id, city_id, plan_amount, real_amount, trans_date)
                VALUES (
                    " . $params['account_object_id'] . ",
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

    function get_account_object_plan($filter, $order)
    {
        $order = set_order($order);
        
        $sql = "
            WITH p AS (
                SELECT 
                    MAX(st.id) transaction_id, st.account_object_id
                FROM transaction st
                JOIN city c ON c.id=st.city_id AND c.active 
                WHERE st.active 
                    AND st.plan_amount >= 0 AND st.real_amount = 0
                    AND YEAR(st.trans_date) = YEAR(CURRENT_DATE)
                    $filter
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
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            ORDER BY $order
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function get_account_object_real($filter, $order)
    {
        $order = set_order($order);
        
        $sql = "
            WITH p AS (
                SELECT 
                    MAX(st.id) transaction_id, st.account_object_id
                FROM transaction st
                JOIN city c ON c.id=st.city_id AND c.active 
                WHERE st.active 
                    AND st.plan_amount >= 0 AND st.real_amount = 0
                    AND YEAR(st.trans_date) = YEAR(CURRENT_DATE)
                    $filter
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
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            ORDER BY $order
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function get_last_transaction($filter, $order, $limit, $offset)
    {
        $filter = set_filter($filter, "transaction");
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH p AS (
                SELECT 
                    MIN(id) plan_id,
                    account_object_id,
                    city_id
                FROM transaction
                WHERE plan_amount >= 0 AND real_amount = 0
                GROUP BY YEAR(trans_date), account_object_id, city_id
            ), r AS (
                SELECT 
                    st.id, 
                    st.account_object_id, 
                    st.city_id, 
                    COALESCE((SELECT plan_amount FROM transaction t WHERE t.id=p.plan_id), st.plan_amount, 0) plan_amount, 
                    st.real_amount, 
                    st.trans_date, 
                    st.active 
                FROM transaction st
                JOIN city c ON c.id=st.city_id AND c.active
                LEFT JOIN p ON p.account_object_id=st.account_object_id
                WHERE st.active
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            $filter 
            ORDER BY $order
            $limit_offset
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

}
