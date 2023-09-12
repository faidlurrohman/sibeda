<?php

class Auth_model extends CI_Model {

    function do_login($username, $password)
    {
        $sql = "
            SELECT u.username, u.fullname, u.title, u.token
            FROM user u
            JOIN city c ON c.id = u.city_id AND c.active
            WHERE u.username = '$username' AND u.password = '$password' AND u.active
        ";
        $query = $this->db->query($sql);

        return model_response($query, 2);
    }

    function do_logout($username)
    {
        $sql = "
            UPDATE user
                SET token = NULL
            WHERE username = '$username'
        ";
        $query = $this->db->query($sql);

        return model_response($query, 1);
    }

    function do_update_token($username, $token)
    {
        $sql = "
            UPDATE user 
                SET token = '$token' 
            WHERE username = '$username'
        ";
        $query = $this->db->query($sql);

        return model_response($query, 1);
    }

    function validating_token()
    {
        $current_token = get_token();

        if ($current_token && $current_token != "") {   
            $sql = "
                SELECT u.id, u.username, u.role_id, u.city_id
                FROM user u 
                JOIN city c ON c.id=u.city_id AND c.active 
                WHERE u.token = '$current_token' AND u.active
            ";
            $query = $this->db->query($sql);

            return $query->row();
        } else {
            return false;
        }
    }

    function do_generate_password($password)
    {
        $sql = "
            SELECT MD5(
                CONCAT(
                    MD5((SELECT COALESCE(value, 'bulk_app') FROM setting WHERE name = 'app')), 
                    (SELECT COALESCE(value, 'bulk_delimiter') FROM setting WHERE name = 'delimiter'), 
                    '$password'
                )
            ) AS password
        ";
        $query = $this->db->query($sql);

        return $query->row()->password;
    }

    function do_generate_token($username)
    {
        $sql = "
            SELECT CONCAT(MD5(NOW()), MD5(id), MD5(username), role_id) AS token 
            FROM user WHERE username='$username'
        ";
        $query = $this->db->query($sql);

        return model_response($query, 3);
    }
    
    function user_exception($username)
    {
        $sql = "
            SELECT JSON_CONTAINS(
                (SELECT CAST(value AS JSON) FROM setting WHERE name = 'role_exception'), 
                CONCAT('\"', (SELECT role_id FROM user WHERE username = '$username'), '\"'), 
                \"$\"
            ) AS check_exception
        ";
        $query = $this->db->query($sql);

        return $query->row()->check_exception;
    }

}
