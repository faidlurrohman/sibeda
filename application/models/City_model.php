<?php

class City_model extends CI_Model {

    private $procedure = 'data';
    private $schema = 'city';

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

    function get_list($user)
    {
        $sql = "CALL list_{$this->procedure}('{$user['username']}', 'list_{$this->schema}', '{}', 'label asc', 0, 0, @list)";
        $query = $this->db->query($sql);
        $query->next_result();
        $query = $this->db->query("SELECT @list");
            
        return model_response($query, 1);
    }

    function save($user, $params)
    {
        if (!empty($_FILES['blob']['name'])) {
            $config['encrypt_name'] = TRUE;
            $config['upload_path'] = 'uploads/';
            $config['allowed_types'] = 'jpg|jpeg|png';  
            $config['file_name'] = $_FILES['blob']['name'];
            $config['overwrite'] = true;
            $this->load->library('upload', $config);

            if(!$this->upload->do_upload('blob'))  
            {  
                $error = $this->upload->display_errors();
                return ['msg' => $error, 'code' =>  9000, 'data' => []];
            } else {
                $params["logo"] = $this->upload->data()['file_name'];
                $sql = "CALL cud_{$this->procedure}('{$params['mode']}', '{$this->schema}', '{$user['username']}', '[".json_encode($params)."]', @cud)";
                $query = $this->db->query($sql);
                $query->next_result();
                $query = $this->db->query("SELECT @cud");
                return model_response($query, 2);
            }
        } else {
            $sql = "CALL cud_{$this->procedure}('{$params['mode']}', '{$this->schema}', '{$user['username']}', '[".json_encode($params)."]', @cud)";
            $query = $this->db->query($sql);
            $query->next_result();
            $query = $this->db->query("SELECT @cud");
            return model_response($query, 2);
        }
    }

    function delete($user, $params)
    {
        $sql = "CALL cud_{$this->procedure}('D', '{$this->schema}', '{$user['username']}', '[".json_encode($params)."]', @cud)";
        $query = $this->db->query($sql);
        $query->next_result();
        $query = $this->db->query("SELECT @cud");

        return model_response($query, 2);
    }

}
