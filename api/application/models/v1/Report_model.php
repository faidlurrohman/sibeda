<?php

class Report_model extends CI_Model {

    function get_real_plan_cities($username, $filter, $order, $limit, $offset)
    {
        $inline = "";
        
        if (array_key_exists("trans_date_start", $filter) && array_key_exists("trans_date_end", $filter)) {
            $inline .= " AND r.trans_date >= '" . $filter["trans_date_start"] . "'";
            $inline .= " AND r.trans_date <= '" . $filter["trans_date_end"] . "'";
        }

        $additional = ["city_id_TYPE_int_CLAUSE_IN", "account_base_label_TYPE_text", "city_label_TYPE_text", "account_object_detail_sub_label_TYPE_text", "account_object_detail_sub_plan_amount_TYPE_int", "account_object_detail_sub_real_amount_TYPE_int"];
        $filter = set_filter($filter, "", $additional);
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH aol AS (
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
                    CONCAT('(',CONCAT_WS('.', sab.label, sag.label, sat.label, sao.label, saod.label, saods.label),') ', saods.remark) AS account_object_detail_sub_label
                FROM account_base sab
                JOIN account_group sag ON sag.account_base_id=sab.id AND sag.active
                JOIN account_type sat ON sat.account_group_id=sag.id AND sat.active
                JOIN account_object sao ON sao.account_type_id=sat.id AND sao.active
                JOIN account_object_detail saod ON saod.account_object_id=sao.id AND saod.active
                JOIN account_object_detail_sub saods ON saods.account_object_detail_id=saod.id AND saods.active
                WHERE sab.active
            ), p AS (
                SELECT 
                    MIN(id) plan_id
                FROM transaction
                WHERE plan_amount >= 0 AND real_amount = 0
                AND YEAR(trans_date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                GROUP BY account_object_detail_sub_id, city_id, EXTRACT(YEAR FROM trans_date)
            ), anggaran AS (
                SELECT 
                    st.account_object_detail_sub_id,
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
                    st.account_object_detail_sub_id,
                    st.city_id,
                    st.real_amount,
                    st.trans_date
                FROM transaction st
                JOIN city c ON c.id=st.city_id AND c.active
                WHERE st.id NOT IN (SELECT plan_id FROM p)
                AND YEAR(st.trans_date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                ORDER BY st.trans_date DESC
            ), mt AS (
                SELECT 
                    a.account_object_detail_sub_id,
                    a.city_id,
                    a.city_label,
                    a.city_logo,
                    COALESCE(a.plan_amount,0) AS plan_amount,
                    COALESCE((SELECT MAX(r.real_amount)),0) AS real_amount,
                    COALESCE((SELECT MAX(r.trans_date)), a.trans_date) AS trans_date
                FROM anggaran a
                LEFT JOIN realisasi r ON r.account_object_detail_sub_id=a.account_object_detail_sub_id 
                    AND r.city_id=a.city_id
                    AND EXTRACT(YEAR FROM r.trans_date)=EXTRACT(YEAR FROM a.trans_date)
                    $inline
                GROUP BY a.account_object_detail_sub_id, a.city_id, a.city_label, a.city_logo, a.plan_amount, a.trans_date
            ), sab AS (
                SELECT 
                    aol.account_base_id,
                    mt.city_id, 
                    SUM(mt.plan_amount) as account_base_plan_amount,
                    SUM(mt.real_amount) as account_base_real_amount
                FROM aol
                JOIN mt ON mt.account_object_detail_sub_id=aol.account_object_detail_sub_id
                GROUP BY aol.account_base_id, mt.city_id
            ), sag AS (
                SELECT 
                    aol.account_group_id,
                    mt.city_id, 
                    SUM(mt.plan_amount) as account_group_plan_amount,
                    SUM(mt.real_amount) as account_group_real_amount
                FROM aol
                JOIN mt ON mt.account_object_detail_sub_id=aol.account_object_detail_sub_id
                GROUP BY aol.account_group_id, mt.city_id
            ), sat AS (
                SELECT 
                    aol.account_type_id,
                    mt.city_id, 
                    SUM(mt.plan_amount) as account_type_plan_amount,
                    SUM(mt.real_amount) as account_type_real_amount
                FROM aol
                JOIN mt ON mt.account_object_detail_sub_id=aol.account_object_detail_sub_id
                GROUP BY aol.account_type_id, mt.city_id
            ), sao AS (
                SELECT 
                    aol.account_object_id,
                    mt.city_id, 
                    SUM(mt.plan_amount) as account_object_plan_amount,
                    SUM(mt.real_amount) as account_object_real_amount
                FROM aol
                JOIN mt ON mt.account_object_detail_sub_id=aol.account_object_detail_sub_id
                GROUP BY aol.account_object_id, mt.city_id
            ), saod AS (
                SELECT 
                    aol.account_object_detail_id,
                    mt.city_id, 
                    SUM(mt.plan_amount) as account_object_detail_plan_amount,
                    SUM(mt.real_amount) as account_object_detail_real_amount
                FROM aol
                JOIN mt ON mt.account_object_detail_sub_id=aol.account_object_detail_sub_id
                GROUP BY aol.account_object_detail_id, mt.city_id
            ), r AS (
                SELECT 
                    aol.*,
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
                FROM aol
                JOIN mt ON mt.account_object_detail_sub_id=aol.account_object_detail_sub_id
                JOIN sab ON sab.account_base_id=aol.account_base_id AND sab.city_id=mt.city_id
                JOIN sag ON sag.account_group_id=aol.account_group_id AND sag.city_id=mt.city_id
                JOIN sat ON sat.account_type_id=aol.account_type_id AND sat.city_id=mt.city_id
                JOIN sao ON sao.account_object_id=aol.account_object_id AND sao.city_id=mt.city_id
                JOIN saod ON saod.account_object_detail_id=aol.account_object_detail_id AND saod.city_id=mt.city_id
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
            $inline .= " AND r.trans_date >= '" . $filter["trans_date_start"] . "'";
            $inline .= " AND r.trans_date <= '" . $filter["trans_date_end"] . "'";
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
                WHERE sab.active AND LOWER(sab.remark) IN(LOWER('PENDAPATAN DAERAH'), LOWER('BELANJA DAERAH'))
            ), p AS (
                SELECT 
                    MIN(id) plan_id
                FROM transaction
                WHERE plan_amount >= 0 AND real_amount = 0
                AND YEAR(trans_date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                GROUP BY account_object_detail_sub_id, city_id, EXTRACT(YEAR FROM trans_date)
            ), anggaran AS (
                SELECT 
                    st.account_object_detail_sub_id,
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
                    st.account_object_detail_sub_id,
                    st.city_id,
                    st.real_amount,
                    st.trans_date
                FROM transaction st
                JOIN city c ON c.id=st.city_id AND c.active
                WHERE st.id NOT IN (SELECT plan_id FROM p)
                AND YEAR(st.trans_date) = (SELECT u.which_year FROM user u WHERE u.username = '$username')
                ORDER BY st.trans_date DESC
            ), mt AS (
                SELECT 
                    a.account_object_detail_sub_id,
                    a.city_id,
                    a.city_label,
                    a.city_logo,
                    COALESCE(a.plan_amount,0) AS plan_amount,
                    COALESCE((SELECT MAX(r.real_amount)),0) AS real_amount,
                    COALESCE((SELECT MAX(r.trans_date)), a.trans_date) AS trans_date
                FROM anggaran a
                JOIN realisasi r ON r.account_object_detail_sub_id=a.account_object_detail_sub_id 
                    AND r.city_id=a.city_id
                    AND EXTRACT(YEAR FROM r.trans_date)=EXTRACT(YEAR FROM a.trans_date)
                    $inline
                GROUP BY a.account_object_detail_sub_id, a.city_id, a.city_label, a.city_logo, a.plan_amount, a.trans_date
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
