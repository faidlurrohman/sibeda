<?php

defined('BASEPATH') or exit('No direct script access allowed');

require APPPATH . 'libraries/REST_Controller.php';
use Restserver\Libraries\REST_Controller;

class Account_base extends REST_Controller {

    function __construct()
    {
        parent::__construct();

        // CORS
        $this->httpcors->_authenticate_CORS();

        // MODELS
        $this->load->model('Auth_model');
        $this->load->model('Account_base_model');
    }

    public function data_get()
    {
        $this->do_get_all();
    }

    private function do_get_all()
    {   
        $validate = $this->Auth_model->validate_token();

        if ($validate['code'] == 200) {
            $filter = !empty($this->get('filter')) ? $this->get('filter') : new stdClass();
            $order = !empty($this->get('order')) ? $this->get('order') : 'label desc'; 
            $limit = !empty($this->get('limit')) ? $this->get('limit') : 0; 
            $offset = !empty($this->get('offset')) ? $this->get('offset') : 0; 
            $data = $this->Account_base_model->get_all($validate['data'], $filter, $order, $limit, $offset);

            if ($data['code'] == 200) {
                $this->response($data, REST_Controller::HTTP_OK);
            } else {
                $this->response($data, REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
            }
        } else {
            $this->response($validate, REST_Controller::HTTP_UNAUTHORIZED);
        }
    }

    public function list_get()
    {
        $this->do_get_list();
    }

    private function do_get_list()
    {   
        $validate = $this->Auth_model->validate_token();

        if ($validate['code'] == 200) {
            $data = $this->Account_base_model->get_list($validate['data']);

            if ($data['code'] == 200) {
                $this->response($data, REST_Controller::HTTP_OK);
            } else {
                $this->response($data, REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
            }
        } else {
            $this->response($validate, REST_Controller::HTTP_UNAUTHORIZED);
        }
    }

    public function add_post()
    {
        $this->do_create();
    }

    private function do_create()
    {
        $validate = $this->Auth_model->validate_token();

        if ($validate['code'] == 200) {
            $data = $this->Account_base_model->save($validate['data'], $this->input_fields());

            if ($data['code'] == 200) {
                $this->response($data, REST_Controller::HTTP_OK);
            } else {
                $this->response($data, REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
            }
        } else {
            $this->response($validate, REST_Controller::HTTP_UNAUTHORIZED);
        }
    }

    public function remove_delete($id)
    {
        return $this->do_delete($id);
    }

    private function do_delete($id)
    {
        $validate = $this->Auth_model->validate_token();

        if ($validate['code'] == 200) {
            $data = $this->Account_base_model->delete($validate['data'], array('id' => $id));

            if ($data['code'] == 200) {
                $this->response($data, REST_Controller::HTTP_OK);
            } else {
                $this->response($data, REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
            }
        } else {
            $this->response($validate, REST_Controller::HTTP_UNAUTHORIZED);
        }
    }

    private function input_fields($is_edit = 0)
    {
        return array(
            'id' => $this->post_or_put('id', $is_edit),
            'label' => $this->post_or_put('label', $is_edit),
            'remark' => $this->post_or_put('remark', $is_edit),
            'mode' => $this->post_or_put('mode', $is_edit),
        );
    }

    private function post_or_put($field, $is_edit = 0)
    {
        return ($is_edit == 0) ? $this->post($field) : $this->put($field);
    }

}
