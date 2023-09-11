<?php

class Schema_model extends CI_Model {
    
    function get_field_type($table_name)
    {
        $sql = "
            SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = '$table_name'
        ";
        $query = $this->db->query($sql);

        return $query->result();
    }

}
