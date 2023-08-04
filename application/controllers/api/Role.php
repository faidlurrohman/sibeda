<?php

defined('BASEPATH') or exit('No direct script access allowed');

require APPPATH . 'libraries/REST_Controller.php';
use Restserver\Libraries\REST_Controller;

class Role extends REST_Controller {

    function __construct()
    {
        parent::__construct();

        // CORS
        $this->httpcors->_authenticate_CORS();
        
        // MODELS
        $this->load->model('Auth_model');
        $this->load->model('Role_model');
    }

    public function list_get()
    {
        $this->do_get_list();
    }

    private function do_get_list()
    {   
        $validate = $this->Auth_model->validate_token();

        if ($validate['code'] == 200) {
            $data = $this->Role_model->get_list($validate['data']);

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
