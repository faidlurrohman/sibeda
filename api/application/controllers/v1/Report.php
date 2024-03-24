<?php

class Report extends REST_Controller {

    /**
     * REAL PLAN CITIES
     */
    public function real_plan_cities()
    {
        $this->do_get_real_plan_cities();
    }

    /**
     * GET ALL REAL PLAN CITIES
     */
    private function do_get_real_plan_cities() 
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $filter = !empty($this->get_param("filter")) ? $this->get_param("filter") : [];
            $order = !empty($this->get_param("order")) ? $this->get_param("order") : "city_label desc"; 
            $limit = !empty($this->get_param("limit")) ? $this->get_param("limit") : 0; 
            $offset = !empty($this->get_param("offset")) ? $this->get_param("offset") : 0; 

            $exception = $this->Auth_model->user_exception($validated->username);

            if ($exception == "0") {
                $filter["city_id"] = $validated->city_id;
            }

            $data = $this->Report_model->get_real_plan_cities($validated->username, $filter, $order, $limit, $offset);

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
     * RECAPITULATION CITIES
     */
    public function recapitulation_cities()
    {
        $this->do_get_recapitulation_cities();
    }

    /**
     * GET ALL RECAPITULATION CITIES
     */
    private function do_get_recapitulation_cities() 
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $filter = !empty($this->get_param("filter")) ? $this->get_param("filter") : [];
            $order = !empty($this->get_param("order")) ? $this->get_param("order") : "city_label desc"; 
            $limit = !empty($this->get_param("limit")) ? $this->get_param("limit") : 0; 
            $offset = !empty($this->get_param("offset")) ? $this->get_param("offset") : 0; 

            $exception = $this->Auth_model->user_exception($validated->username);

            if ($exception == "0") {
                $filter["city_id"] = $validated->city_id;
            }

            $data = $this->Report_model->get_recapitulation_cities($validated->username, $filter, $order, $limit, $offset);

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
