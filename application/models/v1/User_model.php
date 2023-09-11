<?php

class User_model extends CI_Model {
    
    function get_all($filter, $order, $limit, $offset)
    {
        $filter = set_filter($filter, "user");
        $order = set_order($order);
        $limit_offset = set_limit_offset($limit, $offset);

        $sql = "
            WITH r AS (
                SELECT 
                    id, username, role_id, city_id, fullname, title, active 
                FROM user
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
                INSERT INTO user(username, password, role_id, city_id, fullname, title)
                VALUES (
                    '" . $params['username'] . "',
                    '" . $params['password'] . "',
                    " . $params['role_id'] . ",
                    " . $params['city_id'] . ",
                    '" . $params['fullname'] . "',
                    '" . $params['title'] . "'
                )
            ";
            $query = $this->db->query($sql);
        } else if ($params["mode"] == "U") {
            $sql = "
                UPDATE user 
                    SET username = '" . $params['username'] . "',
                        role_id = " . $params['role_id'] . ",
                        city_id = " . $params['city_id'] . ",
                        fullname = '" . $params['fullname'] . "',
                        title = '" . $params['title'] . "'
                WHERE id = " . $params['id'] . "
            ";
            $query = $this->db->query($sql);
            
            if ($params["password"]) {
                $sql = "
                    UPDATE user 
                        SET password = '" . $params["password"] . "'
                    WHERE id = " . $params['id'] . "
                ";
                $query = $this->db->query($sql);
            }
        }

        return model_response($query, 1);
    }

    function delete($id)
    {
        $sql = "
            UPDATE user 
                SET active = NOT active
            WHERE id = " . $id . "
        ";
        $query = $this->db->query($sql);

        return model_response($query, 1);
    }

    function update_password($params)
    {
        $sql = "
            UPDATE user 
                SET password = '" . $params["password"] . "'
            WHERE username = '" . $params['username'] . "'
        ";
        $query = $this->db->query($sql);
        
        return model_response($query, 1);
    }

}
