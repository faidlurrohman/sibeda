<?php

class Dashboard_model extends CI_Model {

    private $procedure = 'data';
    private $schema_dashboard = 'get_dashboard';
    private $schema_recap = 'get_dashboard_recap_years';

    function __construct()
    {
        parent::__construct();
        // HELPER
        $this->load->helper('common');
    }
    
    function get_dashboard($user, $filter, $order, $limit, $offset)
    {
        $setOrder = set_order($order);
        $sql = "CALL read_{$this->procedure}('{$user['username']}', '{$this->schema_dashboard}', '".json_encode($filter)."', '".$setOrder."', {$limit}, {$offset}, @read)";
        $query = $this->db->query($sql);
        $query->next_result();
        $query = $this->db->query("SELECT @read");
            
        return model_response($query);
    }
    
    function get_recap_years($user, $filter, $order, $limit, $offset)
    {
        $setOrder = set_order($order);
        $sql = "CALL read_{$this->procedure}('{$user['username']}', '{$this->schema_dashboard}', '".json_encode($filter)."', '".$setOrder."', {$limit}, {$offset}, @read)";
        $query = $this->db->query($sql);
        $query->next_result();
        $query = $this->db->query("SELECT @read");
            
        return model_response($query);
    }

}
