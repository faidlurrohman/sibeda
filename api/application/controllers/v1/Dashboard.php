<?php

class Dashboard extends REST_Controller {

    /**
     * IN OUT (PENDAPATAN & BELANJA)
     */
    public function in_out()
    {
        $this->do_get_in_out();
    }

    /**
     * GET ALL IN OUT
     */
    private function do_get_in_out() 
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $filter = !empty($this->get_param("filter")) ? $this->get_param("filter") : [];
            $order = !empty($this->get_param("order")) ? $this->get_param("order") : "account_base_id asc"; 
            $limit = !empty($this->get_param("limit")) ? $this->get_param("limit") : 0; 
            $offset = !empty($this->get_param("offset")) ? $this->get_param("offset") : 0; 

            $exception = $this->Auth_model->user_exception($validated->username);

            if ($exception == "0") {
                $filter["city_id"] = $validated->city_id;
            }

            $data = $this->Dashboard_model->get_in_out($validated->username, $filter, $order, $limit, $offset);

            if ($data['code'] == 200) {
                $this->response($data);
            } else {
                $this->response($data, $data["code"]);
            }
        } else {
            $this->response(error_handler(1, 401), 401);
        }
    }

    /**
     * COST (PEMABIAYAAN)
     */
    public function cost()
    {
        $this->do_get_cost();
    }

    /**
     * GET ALL COST
     */
    private function do_get_cost() 
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $filter = !empty($this->get_param("filter")) ? $this->get_param("filter") : [];
            $order = !empty($this->get_param("order")) ? $this->get_param("order") : "account_base_id asc"; 
            $limit = !empty($this->get_param("limit")) ? $this->get_param("limit") : 0; 
            $offset = !empty($this->get_param("offset")) ? $this->get_param("offset") : 0; 

            $exception = $this->Auth_model->user_exception($validated->username);

            if ($exception == "0") {
                $filter["city_id"] = $validated->city_id;
            }

            $data = $this->Dashboard_model->get_cost($validated->username, $filter, $order, $limit, $offset);

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
