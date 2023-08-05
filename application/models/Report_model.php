<?php

class Report_model extends CI_Model {

    private $procedure = 'data';
    private $schema_real_plan = 'get_real_plan_cities';
    private $schema_recapitulation = 'get_recapitulation_cities';

    function __construct()
    {
        parent::__construct();
        
        // HELPER
        $this->load->helper('common');
    }

    function get_real_plan_cities($user, $filter, $order, $limit, $offset)
    {
        $setOrder = set_order($order);
        $sql = "CALL read_{$this->procedure}('{$user['username']}', '{$this->schema_real_plan}', '".json_encode($filter)."', '".$setOrder."', {$limit}, {$offset}, @read)";
        $query = $this->db->query($sql);
        $query->next_result();
        $query = $this->db->query("SELECT @read");
            
        return model_response($query);
    }

    function get_recapitulation_cities($user, $filter, $order, $limit, $offset)
    {
        $setOrder = set_order($order);
        $sql = "CALL read_{$this->procedure}('{$user['username']}', '{$this->schema_recapitulation}', '".json_encode($filter)."', '".$setOrder."', {$limit}, {$offset}, @read)";
        $query = $this->db->query($sql);
        $query->next_result();
        $query = $this->db->query("SELECT @read");
            
        return model_response($query);
    }

}
