<?php

class Report_model extends CI_Model {

    function get_real_plan_cities($username, $filter, $order, $limit, $offset)
    {
        $inline = "";
        
        if (array_key_exists("trans_date_start", $filter) && array_key_exists("trans_date_end", $filter)) {
            $inline .= " AND r.date >= '" . $filter["trans_date_start"] . "'";
            $inline .= " AND r.date <= '" . $filter["trans_date_end"] . "'";
        }

        $additional = ["city_id_TYPE_int_CLAUSE_IN", "account_base_label_TYPE_text", "city_label_TYPE_text", "account_object_detail_sub_label_TYPE_text", "account_object_detail_sub_plan_amount_TYPE_int", "account_object_detail_sub_real_amount_TYPE_int"];
        $filter = set_filter($filter, "", $additional);
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH mt AS(
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
                        LOWER(sab.remark) IN(LOWER('PENDAPATAN DAERAH'), LOWER('BELANJA DAERAH'), LOWER('PEMBIAYAAN DAERAH')) 
                        OR
                        sab.id IN(4, 5, 6) 
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
            ), sab AS (
                SELECT 
                    mt.account_base_id,
                    mt.city_id, 
                    SUM(mt.plan_amount) as account_base_plan_amount,
                    SUM(mt.real_amount) as account_base_real_amount
                FROM mt
                GROUP BY mt.account_base_id, mt.city_id
            ), sag AS (
                SELECT 
                    mt.account_group_id,
                    mt.city_id, 
                    SUM(mt.plan_amount) as account_group_plan_amount,
                    SUM(mt.real_amount) as account_group_real_amount
                FROM mt
                GROUP BY mt.account_group_id, mt.city_id
            ), sat AS (
                SELECT 
                    mt.account_type_id,
                    mt.city_id, 
                    SUM(mt.plan_amount) as account_type_plan_amount,
                    SUM(mt.real_amount) as account_type_real_amount
                FROM mt
                GROUP BY mt.account_type_id, mt.city_id
            ), sao AS (
                SELECT 
                    mt.account_object_id,
                    mt.city_id, 
                    SUM(mt.plan_amount) as account_object_plan_amount,
                    SUM(mt.real_amount) as account_object_real_amount
                FROM mt
                GROUP BY mt.account_object_id, mt.city_id
            ), saod AS (
                SELECT 
                    mt.account_object_detail_id,
                    mt.city_id, 
                    SUM(mt.plan_amount) as account_object_detail_plan_amount,
                    SUM(mt.real_amount) as account_object_detail_real_amount
                FROM mt
                GROUP BY mt.account_object_detail_id, mt.city_id
            ), r AS (
                SELECT 
                    mt.account_base_id, 
                    mt.account_base_label,
                    mt.account_group_id, 
                    mt.account_group_label,
                    mt.account_type_id, 
                    mt.account_type_label,
                    mt.account_object_id, 
                    mt.account_object_label,
                    mt.account_object_detail_id, 
                    mt.account_object_detail_label,
                    mt.account_object_detail_sub_id, 
                    mt.account_object_detail_sub_label,
                    mt.city_id,
                    mt.city_label,
                    mt.city_logo,
                    mt.plan_amount AS account_object_detail_sub_plan_amount,
                    mt.real_amount AS account_object_detail_sub_real_amount,
                    mt.trans_date,
                    sab.account_base_plan_amount,
                    sab.account_base_real_amount,
                    sag.account_group_plan_amount,
                    sag.account_group_real_amount,
                    sat.account_type_plan_amount,
                    sat.account_type_real_amount,
                    sao.account_object_plan_amount,
                    sao.account_object_real_amount,
                    saod.account_object_detail_plan_amount,
                    saod.account_object_detail_real_amount
                FROM mt
                JOIN sab ON sab.account_base_id=mt.account_base_id AND sab.city_id=mt.city_id
                JOIN sag ON sag.account_group_id=mt.account_group_id AND sag.city_id=mt.city_id
                JOIN sat ON sat.account_type_id=mt.account_type_id AND sat.city_id=mt.city_id
                JOIN sao ON sao.account_object_id=mt.account_object_id AND sao.city_id=mt.city_id
                JOIN saod ON saod.account_object_detail_id=mt.account_object_detail_id AND saod.city_id=mt.city_id
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            $filter 
            ORDER BY $order
            $limit_offset
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function get_recapitulation_cities($username, $filter, $order, $limit, $offset)
    {
        $inline = "";
        
        if (array_key_exists("trans_date_start", $filter) && array_key_exists("trans_date_end", $filter)) {
            $inline .= " AND r.date >= '" . $filter["trans_date_start"] . "'";
            $inline .= " AND r.date <= '" . $filter["trans_date_end"] . "'";
        } 

        $additional = ["city_id_TYPE_int_CLAUSE_IN", "account_base_label_TYPE_text", "city_label_TYPE_text", "account_base_plan_amount_TYPE_int", "account_base_real_amount_TYPE_int"];
        $filter = set_filter($filter, "", $additional);
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH aol AS (
                SELECT  
                    sab.id AS account_base_id, 
                    sab.remark AS account_base_label,
                    sag.id AS account_group_id, 
                    sat.id AS account_type_id, 
                    sao.id AS account_object_id,
                    saod.id AS account_object_detail_id, 
                    saods.id AS account_object_detail_sub_id
                FROM account_base sab
                JOIN account_group sag ON sag.account_base_id=sab.id AND sag.active
                JOIN account_type sat ON sat.account_group_id=sag.id AND sat.active
                JOIN account_object sao ON sao.account_type_id=sat.id AND sao.active
                JOIN account_object_detail saod ON saod.account_object_id=sao.id AND saod.active
                JOIN account_object_detail_sub saods ON saods.account_object_detail_id=saod.id AND saods.active
                WHERE sab.active 
                AND (
                    LOWER(sab.remark) IN(LOWER('PENDAPATAN DAERAH'), LOWER('BELANJA DAERAH'))
                    OR
                    sab.id IN(4, 5) 
                )
            ), anggaran AS (
                SELECT 
                    b.account_object_detail_sub_id,
                    b.city_id,
                    c.label AS city_label,
                    c.logo AS city_logo,
                    b.amount,
                    b.date
                FROM budget b
                JOIN city c ON c.id=b.city_id AND c.active
                WHERE YEAR(b.date)=(SELECT u.which_year FROM user u WHERE u.username = '$username')
            ), realisasi AS (
                SELECT 
                    r.account_object_detail_sub_id,
                    r.city_id,
                    r.amount,
                    r.date
                FROM realization r
                JOIN city c ON c.id=r.city_id AND c.active
                WHERE YEAR(r.date)=(SELECT u.which_year FROM user u WHERE u.username = '$username')
            ), mt AS (
                SELECT 
                    a.account_object_detail_sub_id,
                    a.city_id,
                    a.city_label,
                    a.city_logo,
                    COALESCE(a.amount, 0) AS plan_amount,
                    COALESCE((SELECT MAX(r.amount)), 0) AS real_amount,
                    COALESCE((SELECT MAX(r.date)), a.date) AS trans_date
                FROM anggaran a
                LEFT JOIN realisasi r ON r.account_object_detail_sub_id=a.account_object_detail_sub_id
                    AND r.city_id=a.city_id
                    AND EXTRACT(YEAR FROM r.date)=EXTRACT(YEAR FROM a.date)
                    $inline
                GROUP BY a.account_object_detail_sub_id, a.city_id
            ), r AS (
                SELECT 
                    aol.account_base_id,
                    aol.account_base_label,
                    mt.city_id, 
                    mt.city_label,
                    mt.city_logo,
                    SUM(mt.plan_amount) as account_base_plan_amount,
                    SUM(mt.real_amount) as account_base_real_amount,
                    MAX(mt.trans_date) trans_date
                FROM aol
                JOIN mt ON mt.account_object_detail_sub_id=aol.account_object_detail_sub_id
                GROUP BY aol.account_base_id, aol.account_base_label, mt.city_id, mt.city_label
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            $filter 
            ORDER BY $order
            $limit_offset
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

}
