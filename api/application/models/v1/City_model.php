<?php

class City_model extends CI_Model {
    
    function get_all($filter, $order, $limit, $offset)
    {
        $filter = set_filter($filter, "city");
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH r AS (
                SELECT * FROM city
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            $filter 
            ORDER BY $order
            $limit_offset
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function get_list($filter, $order)
    {
        $filter = set_filter($filter, "city");
        $order = set_order($order);
        
        $sql = "
            WITH r AS (
                SELECT id, id AS value, label FROM city WHERE active
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            $filter
            ORDER BY $order
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

    function save($params)
    {
        if ($params["mode"] == "C") {
            $sql = "
                INSERT INTO city(label, logo)
                VALUES (
                    '" . $params['label'] . "',
                    '" . $params['logo'] . "'
                )
            ";
            $query = $this->db->query($sql);
        } else if ($params["mode"] == "U") {
            $sql = "
                UPDATE city 
                    SET label = '" . $params['label'] . "',
                        logo = '" . $params['logo'] . "'
                WHERE id = " . $params['id'] . "
            ";
            $query = $this->db->query($sql);
        }

        return model_response($query, 1);
    }

    function delete($id)
    {
        $sql = "
            UPDATE city 
                SET active = NOT active
            WHERE id = " . $id . "
        ";
        $query = $this->db->query($sql);
        
        return model_response($query, 1);
    }

}
