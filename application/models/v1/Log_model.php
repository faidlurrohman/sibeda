<?php

class Log_model extends CI_Model {

    function __construct()
    {
        parent::__construct();
    }
    
    function log($table_name, $mode, $data, $username)
    {
        $sql = "
            INSERT INTO log(`\"table\"`, mode, start_value, end_value, created_at, created_by) 
            VALUES (LOWER('$table_name'), UPPER('$mode'), '{}', '" . json_encode($data) . "', DATE_FORMAT(NOW(),'%Y-%m-%d %H:%i'), '$username')
        ";
        $query = $this->db->query($sql);
    }

}
