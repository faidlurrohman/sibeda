<?php

class Signer_model extends CI_Model {
    
    function get_all($filter, $order, $limit, $offset)
    {
        $filter = set_filter($filter, "signer");
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH r AS (
                SELECT * FROM signer
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
                SELECT id, id AS value, fullname AS label, nip, title, position FROM signer WHERE active
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
                INSERT INTO signer(nip, fullname, title, position)
                VALUES (
                    '" . $params['nip'] . "',
                    '" . $params['fullname'] . "',
                    '" . $params['title'] . "',
                    '" . $params['position'] . "'
                )
            ";
            $query = $this->db->query($sql);
        } else if ($params["mode"] == "U") {
            $sql = "
                UPDATE signer 
                    SET nip = '" . $params['nip'] . "',
                        fullname = '" . $params['fullname'] . "',
                        title = '" . $params['title'] . "',
                        position = '" . $params['position'] . "'
                WHERE id = " . $params['id'] . "
            ";
            $query = $this->db->query($sql);
        }

        return model_response($query, 1);
    }

    function delete($id)
    {
        $sql = "
            UPDATE signer 
                SET active = NOT active
            WHERE id = " . $id . "
        ";
        $query = $this->db->query($sql);

        return model_response($query, 1);
    }

}
