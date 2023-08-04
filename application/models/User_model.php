<?php

class User_model extends CI_Model {

    private $procedure = 'data';
    private $schema = 'user';

    function __construct()
    {
        parent::__construct();
        
        // HELPER
        $this->load->helper('common');
    }
    
    function get_all($user, $filter, $order, $limit, $offset)
    {
        $setOrder = set_order($order);
        $sql = "CALL read_{$this->procedure}('{$user['username']}', 'get_{$this->schema}', '".json_encode($filter)."', '".$setOrder."', {$limit}, {$offset}, @read)";
        $query = $this->db->query($sql);
        $query->next_result();
        $query = $this->db->query("SELECT @read");
            
        return model_response($query);
    }

    function save($user, $params)
    {
        $sql = "CALL cud_{$this->procedure}('{$params['mode']}', '{$this->schema}', '{$user['username']}', '[".json_encode($params)."]', @cud)";
        $query = $this->db->query($sql);
        $query->next_result();
        $query = $this->db->query("SELECT @cud");
            
        return model_response($query, 2);
    }

    function delete($user, $params)
    {
        $sql = "CALL cud_{$this->procedure}('D', '{$this->schema}', '{$user['username']}', '[".json_encode($params)."]', @cud)";
        $query = $this->db->query($sql);
        $query->next_result();
        $query = $this->db->query("SELECT @cud");

        return model_response($query, 2);
    }

    function update_password($user, $params)
    {
        $sql = "CALL cud_{$this->procedure}('U', '{$this->schema}', '{$user['username']}', '[".json_encode($params)."]', @cud)";
        $query = $this->db->query($sql);
        $query->next_result();
        $query = $this->db->query("SELECT @cud");
            
        return model_response($query, 2);
    }

}
