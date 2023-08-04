<?php

class Auth_model extends CI_Model {

    function __construct()
    {
        parent::__construct();
        
        // HELPER
        $this->load->helper('common');
    }

    function login($username, $password)
    {
        $sql = "SELECT login('{$username}', '{$password}') login";
        $query = $this->db->query($sql);
        return model_response($query, 10);
    }

    function validate_token()
    {
        $token = get_token();
        $sql = "SELECT validate_token('{$token}') validate_token";
        $query = $this->db->query($sql);
        return model_response($query, 11);
    }
    
}
