<?php

class Dashboard_model extends CI_Model {

    function get_dashboard($filter, $order, $limit, $offset) {
        $inline = "";
        
        if (array_key_exists("trans_date_start", $filter) && array_key_exists("trans_date_end", $filter)) {
            $inline .= " AND r.trans_date >= '" . $filter["trans_date_start"] . "'";
            $inline .= " AND r.trans_date <= '" . $filter["trans_date_end"] . "'";
        }   

        $additional = ["city_id_TYPE_int_CLAUSE_IN"];
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
                    $inline
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
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            $filter 
            ORDER BY $order
            $limit_offset
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function get_recap_years($filter, $order, $limit, $offset) {
        $inline = "";
        
        if (array_key_exists("trans_date_start", $filter) && array_key_exists("trans_date_end", $filter)) {
            $inline .= " AND r.trans_date >= '" . $filter["trans_date_start"] . "'";
            $inline .= " AND r.trans_date <= '" . $filter["trans_date_end"] . "'";
        } else {
            $inline .= " AND r.trans_date >= (SELECT MAKEDATE(YEAR(NOW() - INTERVAL 2 YEAR), 1))";
            $inline .= " AND r.trans_date <= (SELECT MAKEDATE(YEAR(NOW() + INTERVAL 1 YEAR), 1) - INTERVAL 1 DAY)";
        }   

        $additional = ["city_id_TYPE_int_CLAUSE_IN"];
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
                WHERE sab.active AND LOWER(sab.remark) IN(LOWER('PENDAPATAN DAERAH'), LOWER('BELANJA DAERAH'), LOWER('PEMBIAYAAN DAERAH'))
            ), p AS (
                SELECT 
                    MIN(id) plan_id
                FROM transaction
                WHERE plan_amount >= 0 AND real_amount = 0
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
