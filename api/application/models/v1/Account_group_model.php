<?php

class Account_group_model extends CI_Model {
    
    function get_all($filter, $order, $limit, $offset)
    {
        $additional = ["account_base_label_TYPE_text"];
        $filter = set_filter($filter, "account_group", $additional);
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH r AS (
                SELECT 
                    ag.*, CONCAT('(',ab.label, ') ', ab.remark) AS account_base_label 
                FROM account_group ag 
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
                SELECT ag.id, ag.id AS value, CONCAT('(',CONCAT_WS('.', ab.label, ag.label), ') ', ag.remark) AS label 
                FROM account_group ag 
                JOIN account_base ab ON ab.id=ag.account_base_id AND ab.active 
                WHERE ag.active
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
                INSERT INTO account_group(account_base_id, label, remark)
                VALUES (
                    " . $params['account_base_id'] . ",
                    '" . $params['label'] . "',
                    '" . $params['remark'] . "'
                )
            ";
            $query = $this->db->query($sql);
        } else if ($params["mode"] == "U") {
            $sql = "
                UPDATE account_group 
                    SET account_base_id = " . $params['account_base_id'] . ",
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
            UPDATE account_group 
                SET active = NOT active
            WHERE id = " . $id . "
        ";
        $query = $this->db->query($sql);

        return model_response($query, 1);
    }

}
