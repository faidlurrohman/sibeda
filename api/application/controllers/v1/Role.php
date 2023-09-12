<?php

class Role extends REST_Controller {

    /**
     * INDEX
     */
    public function index()
    {
        $this->do_get_all();
    }

    /**
     * GET ALL ROLE
     */
    private function do_get_all() 
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $order = !empty($this->get_param("order")) ? $this->get_param("order") : "id desc"; 
            $data = $this->Role_model->get_all($order);

            if ($data['code'] == 200) {
                $this->response($data);
            } else {
                $this->response($data, $data["code"]);
            }
        } else {
            $this->response(error_handler(1, 401), 401);
        }
    }

}
