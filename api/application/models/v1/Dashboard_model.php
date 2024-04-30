<?php

class Dashboard_model extends CI_Model {

    function get_in_out($username, $filter, $order, $limit, $offset) {
        $inline = "";
        
        if (array_key_exists("trans_date_start", $filter) && array_key_exists("trans_date_end", $filter)) {
            $inline .= " AND r.date >= '" . $filter["trans_date_start"] . "'";
            $inline .= " AND r.date <= '" . $filter["trans_date_end"] . "'";
        }   

        $additional = ["city_id_TYPE_int_CLAUSE_IN"];
        $filter = set_filter($filter, "", $additional);
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH mt AS (
                SELECT 
                    sab.id AS account_base_id, 
                    CONCAT('(',CONCAT_WS('.', sab.label),') ', sab.remark) AS account_base_label,
                    sag.id AS account_group_id, 
                    CONCAT('(',CONCAT_WS('.', sab.label, sag.label),') ', sag.remark) AS account_group_label,
                    sat.id AS account_type_id, 
                    CONCAT('(',CONCAT_WS('.', sab.label, sag.label, sat.label),') ', sat.remark) AS account_type_label,
                    sao.id AS account_object_id, 
                    CONCAT('(',CONCAT_WS('.', sab.label, sag.label, sat.label, sao.label),') ', sao.remark) AS account_object_label,
                    saod.id AS account_object_detail_id, 
                    CONCAT('(',CONCAT_WS('.', sab.label, sag.label, sat.label, sao.label, saod.label),') ', saod.remark) AS account_object_detail_label,
                    saods.id AS account_object_detail_sub_id, 
                    CONCAT('(',CONCAT_WS('.', sab.label, sag.label, sat.label, sao.label, saod.label, saods.label),') ', saods.remark) AS account_object_detail_sub_label,
                    COALESCE(b.amount, 0) AS plan_amount,
                    COALESCE((SELECT MAX(r.amount)), 0) AS real_amount,
                    COALESCE((SELECT MAX(r.date)), b.date) AS trans_date,
                    c.id AS city_id,
                    c.label AS city_label,
                    c.logo AS city_logo
                FROM budget b
                JOIN account_object_detail_sub saods ON saods.id=b.account_object_detail_sub_id 
                    AND saods.active
                JOIN account_object_detail saod ON saod.id=saods.account_object_detail_id 
                    AND saod.active
                JOIN account_object sao ON sao.id=saod.account_object_id
                    AND sao.active
                JOIN account_type sat ON sat.id=sao.account_type_id
                    AND sat.active
                JOIN account_group sag ON sag.id=sat.account_group_id
                    AND sag.active
                JOIN account_base sab ON sab.id=sag.account_base_id
                    AND sab.active
                    AND (
                        LOWER(sab.remark) IN(LOWER('PENDAPATAN DAERAH'), LOWER('BELANJA DAERAH')) 
                        OR
                        sab.label IN('4', '5') 
                    )  
                JOIN city c ON c.id=b.city_id 
                    AND c.active
                LEFT JOIN realization r ON r.account_object_detail_sub_id=b.account_object_detail_sub_id
                    AND r.city_id=b.city_id
                    AND YEAR(r.date)=YEAR(b.date)
                    $inline
                WHERE 
                    YEAR(b.date)=(SELECT u.which_year FROM user u WHERE u.username='$username')
                GROUP BY b.account_object_detail_sub_id, b.city_id
            ), r AS (
                SELECT 
                    mt.account_base_id,
                    mt.account_base_label,
                    mt.city_id, 
                    mt.city_label,
                    SUM(mt.plan_amount) AS account_base_plan_amount,
                    SUM(mt.real_amount) AS account_base_real_amount,
                    MAX(mt.trans_date) AS trans_date
                FROM mt
                GROUP BY mt.account_base_id, mt.account_base_label, mt.city_id
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE
            $filter 
            ORDER BY $order
            $limit_offset
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function get_cost($username, $filter, $order, $limit, $offset) {
        $inline = "";
        
        if (array_key_exists("trans_date_start", $filter) && array_key_exists("trans_date_end", $filter)) {
            $inline .= " AND r.date >= '" . $filter["trans_date_start"] . "'";
            $inline .= " AND r.date <= '" . $filter["trans_date_end"] . "'";
        }   

        $additional = ["city_id_TYPE_int_CLAUSE_IN"];
        $filter = set_filter($filter, "", $additional);
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH mt AS (
                SELECT 
                    sab.id AS account_base_id, 
                    CONCAT('(',CONCAT_WS('.', sab.label),') ', sab.remark) AS account_base_label,
                    sag.id AS account_group_id, 
                    CONCAT('(',CONCAT_WS('.', sab.label, sag.label),') ', sag.remark) AS account_group_label,
                    sat.id AS account_type_id, 
                    CONCAT('(',CONCAT_WS('.', sab.label, sag.label, sat.label),') ', sat.remark) AS account_type_label,
                    sao.id AS account_object_id, 
                    CONCAT('(',CONCAT_WS('.', sab.label, sag.label, sat.label, sao.label),') ', sao.remark) AS account_object_label,
                    saod.id AS account_object_detail_id, 
                    CONCAT('(',CONCAT_WS('.', sab.label, sag.label, sat.label, sao.label, saod.label),') ', saod.remark) AS account_object_detail_label,
                    saods.id AS account_object_detail_sub_id, 
                    CONCAT('(',CONCAT_WS('.', sab.label, sag.label, sat.label, sao.label, saod.label, saods.label),') ', saods.remark) AS account_object_detail_sub_label,
                    COALESCE(b.amount, 0) AS plan_amount,
                    COALESCE((SELECT MAX(r.amount)), 0) AS real_amount,
                    COALESCE((SELECT MAX(r.date)), b.date) AS trans_date,
                    c.id AS city_id,
                    c.label AS city_label,
                    c.logo AS city_logo
                FROM budget b
                JOIN account_object_detail_sub saods ON saods.id=b.account_object_detail_sub_id 
                    AND saods.active
                JOIN account_object_detail saod ON saod.id=saods.account_object_detail_id 
                    AND saod.active
                JOIN account_object sao ON sao.id=saod.account_object_id
                    AND sao.active
                JOIN account_type sat ON sat.id=sao.account_type_id
                    AND sat.active
                JOIN account_group sag ON sag.id=sat.account_group_id
                    AND sag.active
                JOIN account_base sab ON sab.id=sag.account_base_id
                    AND sab.active
                    AND (
                        LOWER(sab.remark)=LOWER('PEMBIAYAAN DAERAH')
                        OR
                        sab.label='6'
                    )  
                JOIN city c ON c.id=b.city_id 
                    AND c.active
                LEFT JOIN realization r ON r.account_object_detail_sub_id=b.account_object_detail_sub_id
                    AND r.city_id=b.city_id
                    AND YEAR(r.date)=YEAR(b.date)
                    $inline
                WHERE 
                    YEAR(b.date)=(SELECT u.which_year FROM user u WHERE u.username='$username')
                GROUP BY b.account_object_detail_sub_id, b.city_id
            ), i AS (
                SELECT 
                    mt.city_id, 
                    SUM(COALESCE(mt.plan_amount, 0)) AS plan_amount,
                    SUM(COALESCE(mt.real_amount, 0)) AS real_amount,
                    MAX(mt.trans_date) AS trans_date
                FROM mt
                WHERE mt.account_group_label LIKE '%(6.1)%'
                GROUP BY mt.account_group_id, mt.account_group_label, mt.city_id
            ), o AS (
                SELECT 
                    mt.city_id, 
                    SUM(COALESCE(mt.plan_amount, 0)) AS plan_amount,
                    SUM(COALESCE(mt.real_amount, 0)) AS real_amount,
                    MAX(mt.trans_date) AS trans_date
                FROM mt
                WHERE mt.account_group_label LIKE '%(6.2)%'
                GROUP BY mt.account_group_id, mt.account_group_label, mt.city_id
            ), r AS (
                SELECT 
                    mt.account_base_id,
                    mt.account_base_label,
                    mt.city_id, 
                    mt.city_label,
                    (COALESCE(i.plan_amount, 0) - COALESCE(o.plan_amount,0)) AS account_base_plan_amount,
                    (COALESCE(i.real_amount, 0) - COALESCE(o.real_amount,0))  AS account_base_real_amount,
                    mt.trans_date AS trans_date
                FROM mt
                LEFT JOIN i ON i.city_id=mt.city_id
                LEFT JOIN o ON o.city_id=mt.city_id
                GROUP BY mt.account_base_id, mt.account_base_label, mt.city_id
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE
            $filter 
            ORDER BY $order
            $limit_offset
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

}
