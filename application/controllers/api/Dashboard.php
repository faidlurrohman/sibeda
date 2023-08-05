<?php

defined('BASEPATH') or exit('No direct script access allowed');

require APPPATH . 'libraries/REST_Controller.php';
use Restserver\Libraries\REST_Controller;

class Dashboard extends REST_Controller {

    function __construct()
    {
        parent::__construct();
        
        // CORS
        $this->httpcors->_authenticate_CORS();
        
        // MODELS
        $this->load->model('Auth_model');
        $this->load->model('Dashboard_model');
    }

    public function index_get()
    {
        $this->do_get_index();
    }

    private function do_get_index()
    {   
        $validate = $this->Auth_model->validate_token();

        if ($validate['code'] == 200) {
            $filter = !empty($this->get('filter')) ? $this->get('filter') : new stdClass();
            $order = !empty($this->get('order')) ? $this->get('order') : 'account_base_id desc'; 
            $limit = !empty($this->get('limit')) ? $this->get('limit') : 0; 
            $offset = !empty($this->get('offset')) ? $this->get('offset') : 0; 
            $data = $this->Dashboard_model->get_dashboard($validate['data'], $filter, $order, $limit, $offset);

            if ($data['code'] == 200) {
                $this->response($data, REST_Controller::HTTP_OK);
            } else {
                $this->response($data, REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
            }
        } else {
            $this->response($validate, REST_Controller::HTTP_UNAUTHORIZED);
        }
    }

    public function recap_years_get()
    {
        $this->do_get_recap_years();
    }

    private function do_get_recap_years()
    {   
        $validate = $this->Auth_model->validate_token();

        if ($validate['code'] == 200) {
            $filter = !empty($this->get('filter')) ? $this->get('filter') : new stdClass();
            $order = !empty($this->get('order')) ? $this->get('order') : 'account_base_id desc'; 
            $limit = !empty($this->get('limit')) ? $this->get('limit') : 0; 
            $offset = !empty($this->get('offset')) ? $this->get('offset') : 0; 
            $data = $this->Dashboard_model->get_recap_years($validate['data'], $filter, $order, $limit, $offset);

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
