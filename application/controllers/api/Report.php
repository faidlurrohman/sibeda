<?php

defined('BASEPATH') or exit('No direct script access allowed');

require APPPATH . 'libraries/REST_Controller.php';
use Restserver\Libraries\REST_Controller;

class Report extends REST_Controller {

    function __construct()
    {
        parent::__construct();
        
        // CORS
        $this->httpcors->_authenticate_CORS();
        
        // MODELS
        $this->load->model('Auth_model');
        $this->load->model('Report_model');
    }

    public function real_plan_cities_get()
    {
        $this->do_get_real_plan_cities();
    }

    private function do_get_real_plan_cities()
    {    
        $validate = $this->Auth_model->validate_token();

        if ($validate['code'] == 200) {
            $filter = !empty($this->get('filter')) ? $this->get('filter') : new stdClass();
            $order = !empty($this->get('order')) ? $this->get('order') : 'city_label desc'; 
            $limit = !empty($this->get('limit')) ? $this->get('limit') : 0; 
            $offset = !empty($this->get('offset')) ? $this->get('offset') : 0; 
            $data = $this->Report_model->get_real_plan_cities($validate['data'], $filter, $order, $limit, $offset);

            if ($data['code'] == 200) {
                $this->response($data, REST_Controller::HTTP_OK);
            } else {
                $this->response($data, REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
            }
        } else {
            $this->response($validate, REST_Controller::HTTP_UNAUTHORIZED);
        }
    }

    public function recapitulation_cities_get()
    {
        $this->do_get_recapitulation_cities();
    }

    private function do_get_recapitulation_cities()
    {   
        $validate = $this->Auth_model->validate_token();

        if ($validate['code'] == 200) {
            $filter = !empty($this->get('filter')) ? $this->get('filter') : new stdClass();
            $order = !empty($this->get('order')) ? $this->get('order') : 'city_label desc'; 
            $limit = !empty($this->get('limit')) ? $this->get('limit') : 0; 
            $offset = !empty($this->get('offset')) ? $this->get('offset') : 0; 
            $data = $this->Report_model->get_recapitulation_cities($validate['data'], $filter, $order, $limit, $offset);

            if ($data['code'] == 200) {
                $this->response($data, REST_Controller::HTTP_OK);
            } else {
                $this->response($data, REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
            }
        } else {
            $this->response($validate, REST_Controller::HTTP_UNAUTHORIZED);
        }
    }

}
