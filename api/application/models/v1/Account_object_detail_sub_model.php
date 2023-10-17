<?php

class Account_object_detail_sub_model extends CI_Model {
    
    function get_all($filter, $order, $limit, $offset)
    {
        $additional = ["account_object_detail_label_TYPE_text", "account_object_detail_sub_label_TYPE_text"];
        $filter = set_filter($filter, "account_object_detail_sub", $additional);
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH r AS (
                SELECT 
                    aods.*, 
                    CONCAT('(',CONCAT_WS('.', ab.label, ag.label, at.label, ao.label, aod.label), ') ', aod.remark) AS account_object_detail_label,
                    CONCAT('(',CONCAT_WS('.', ab.label, ag.label, at.label, ao.label, aod.label, aods.label), ') ', aods.remark) AS account_object_detail_sub_label
                FROM account_object_detail_sub aods
                JOIN account_object_detail aod ON aod.id=aods.account_object_detail_id AND aod.active
                JOIN account_object ao ON ao.id=aod.account_object_id AND ao.active
                JOIN account_type at ON at.id=ao.account_type_id AND at.active 
                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active 
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            $filter 
            ORDER BY $order
            $limit_offset
        ";
        $query = $this->db->query($sql);

        return model_response($query);
    }

    function get_list($order)
    {
        $order = set_order($order);
        
        $sql = "
            WITH r AS (
                SELECT aods.id, aods.id AS value, CONCAT('(',CONCAT_WS('.', ab.label, ag.label, at.label, ao.label, aod.label, aods.label), ') ', aods.remark) AS label 
                FROM account_object_detail_sub aods
                JOIN account_object_detail aod ON aod.id=aods.account_object_detail_id AND aod.active
                JOIN account_object ao ON ao.id=aod.account_object_id AND ao.active
                JOIN account_type at ON at.id=ao.account_type_id AND at.active 
                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active 
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active 
                WHERE aods.active
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            ORDER BY $order
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function save($params)
    {
        if ($params["mode"] == "C") {
            $sql = "
                INSERT INTO account_object_detail_sub(account_object_detail_id, label, remark)
                VALUES (
                    " . $params['account_object_detail_id'] . ",
                    '" . $params['label'] . "',
                    '" . $params['remark'] . "'
                )
            ";
            $query = $this->db->query($sql);
        } else if ($params["mode"] == "U") {
            $sql = "
                UPDATE account_object_detail_sub 
                    SET account_object_detail_id = " . $params['account_object_detail_id'] . ",
                        label = '" . $params['label'] . "',
                        remark = '" . $params['remark'] . "'
                WHERE id = " . $params['id'] . "
            ";
            $query = $this->db->query($sql);
        }

        return model_response($query, 1);
    }

    function delete($id)
    {
        $sql = "
            UPDATE account_object_detail_sub 
                SET active = NOT active
            WHERE id = " . $id . "
        ";
        $query = $this->db->query($sql);

        return model_response($query, 1);
    }

}
