<?php

defined('BASEPATH') or exit('No direct script access allowed');

require APPPATH . 'libraries/REST_Controller.php';
use Restserver\Libraries\REST_Controller;

class Auth extends REST_Controller {

    function __construct()
    {
        parent::__construct();

        // CORS
        $this->httpcors->_authenticate_CORS();

        // MODELS
        $this->load->model('Auth_model');
    }

    public function index_get() 
    {
        echo '<br><br>eating some hamburger!!!';
    }

    public function login_post() 
    {
        $data = $this->Auth_model->login($this->post('username'),$this->post('password'));

        if ($data['code'] == 200) {
            $this->response($data, REST_Controller::HTTP_OK);
        } else {
            $this->response($data, REST_Controller::HTTP_UNAUTHORIZED);
        }
    }
}
