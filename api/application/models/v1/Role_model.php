<?php

class Role_model extends CI_Model {

    function get_all($order)
    {
        $order = set_order($order);
        
        $sql = "
            WITH r AS (
                SELECT 
                    id, id AS value, remark AS label
                FROM role
            ) SELECT *, COUNT(*) OVER() AS total FROM r WHERE TRUE  
            ORDER BY $order
        ";
        $query = $this->db->query($sql);
            
        return model_response($query);
    }

}
