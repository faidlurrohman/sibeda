<?php

class Role_model extends CI_Model {

    private $procedure = 'data';
    private $schema = 'role';

    function __construct()
    {
        parent::__construct();
        
        // HELPER
        $this->load->helper('common');
    }

    function get_list($user)
    {
        $sql = "CALL list_{$this->procedure}('{$user['username']}', 'list_{$this->schema}', '{}', 'label asc', 0, 0, @list)";
        $query = $this->db->query($sql);
        $query->next_result();
        $query = $this->db->query("SELECT @list");
            
        return model_response($query, 1);
    }

}
