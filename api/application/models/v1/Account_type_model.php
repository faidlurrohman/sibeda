<?php

class Account_type_model extends CI_Model {
    
    function get_all($filter, $order, $limit, $offset)
    {
        $additional = ["account_group_label_TYPE_text"];
        $filter = set_filter($filter, "account_type", $additional);
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH r AS (
                SELECT 
                    at.*, CONCAT('(',CONCAT_WS('.', ab.label, ag.label), ') ', ag.remark) AS account_group_label 
                FROM account_type at 
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
                SELECT at.id, at.id AS value, CONCAT('(',CONCAT_WS('.', ab.label, ag.label, at.label), ') ', at.remark) AS label 
                FROM account_type at 
                JOIN account_group ag ON ag.id=at.account_group_id AND ag.active 
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active 
                WHERE at.active
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
                INSERT INTO account_type(account_group_id, label, remark)
                VALUES (
                    " . $params['account_group_id'] . ",
                    '" . $params['label'] . "',
                    '" . $params['remark'] . "'
                )
            ";
            $query = $this->db->query($sql);
        } else if ($params["mode"] == "U") {
            $sql = "
                UPDATE account_type 
                    SET account_group_id = " . $params['account_group_id'] . ",
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
            UPDATE account_type 
                SET active = NOT active
            WHERE id = " . $id . "
        ";
        $query = $this->db->query($sql);

        return model_response($query, 1);
    }

}
