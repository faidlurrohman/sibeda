<?php
defined("BASEPATH") OR exit("No direct script access allowed");

class REST_Controller extends CI_Controller
{

    protected $_supported_formats = [
        'json' => 'application/json',
    ];

    public function __construct()
    {
        parent::__construct();       
        
        // CORS
        $this->httpcors->_authenticate_CORS();

        // HELPER
        $this->load->helper("common");

        // CORE MODEL
        $this->load->model("v1/Auth_model");  
        $this->load->model("v1/Log_model"); 
        // ANY MODEL
        $this->load->model("v1/City_model");   
        $this->load->model("v1/Role_model");  
        $this->load->model("v1/User_model");    
        $this->load->model("v1/Signer_model");
        $this->load->model("v1/Account_base_model");  
        $this->load->model("v1/Account_group_model");  
        $this->load->model("v1/Account_type_model");  
        $this->load->model("v1/Account_object_model");  
        $this->load->model("v1/Account_object_detail_model");  
        $this->load->model("v1/Account_object_detail_sub_model");  
        $this->load->model('v1/Transaction_model');
        $this->load->model('v1/Report_model');
        $this->load->model('v1/Dashboard_model');
    }

    /**
     * Return response JSON 
     */
    protected function response($data, $status = 200)
    {
        //set response code
        http_response_code($status); 
        $data['code'] = $status;
        $this->to_json($data);
        exit();
    }

    /**
     * Retreive POST INPUT
     */
    protected function get_param($input)
    {
        return $this->input->get($input);
    }

    /**
     * Retreive POST INPUT
     */
    protected function get_post($input)
    {
        $content_type = $this->input->server('CONTENT_TYPE');
        $content_type = (strpos($content_type, ';') !== FALSE ? current(explode(';', $content_type)) : $content_type);
        //cek jika input content type adalah JSON
        if ($content_type == 'application/json') {
            $body = json_decode($this->input->raw_input_stream, true);
            return isset($body[$input]) ? $body[$input] : null;
        } else {
            return $this->input->post($input);
        }
    }

    /**
     * Retreive POST File
     */
    protected function get_file($input)
    {
        return isset($_FILES[$input]) ? $_FILES[$input] : null;
    }

    /**
     * Set Output to JSON
     */
    protected function to_json($data)
    {
        return $this->output
            ->set_content_type('application/json')
            ->set_output(json_encode($data, JSON_PRETTY_PRINT))->_display();
    }

}