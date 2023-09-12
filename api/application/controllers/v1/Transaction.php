<?php

class Transaction extends REST_Controller {

    /**
     * PLAN
     */
    public function plan()
    {
        $this->do_get_plan();
    }

    /**
     * GET ALL TRANSACTION PLAN
     */
    private function do_get_plan() 
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $filter = !empty($this->get_param("filter")) ? $this->get_param("filter") : new stdClass();
            $order = !empty($this->get_param("order")) ? $this->get_param("order") : "id desc"; 
            $limit = !empty($this->get_param("limit")) ? $this->get_param("limit") : 0; 
            $offset = !empty($this->get_param("offset")) ? $this->get_param("offset") : 0; 

            $exception = $this->Auth_model->user_exception($validated->username);

            if ($exception == "0") {
                $filter->city_id = $validated->city_id;
                $filter->active = 1;
            }
            
            $data = $this->Transaction_model->get_all_plan($filter, $order, $limit, $offset);

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
     * REAL
     */
    public function real()
    {
        $this->do_get_real();
    }

    /**
     * GET ALL TRANSACTION REAL
     */
    private function do_get_real() 
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $filter = !empty($this->get_param("filter")) ? $this->get_param("filter") : new stdClass();
            $order = !empty($this->get_param("order")) ? $this->get_param("order") : "id desc"; 
            $limit = !empty($this->get_param("limit")) ? $this->get_param("limit") : 0; 
            $offset = !empty($this->get_param("offset")) ? $this->get_param("offset") : 0; 

            $exception = $this->Auth_model->user_exception($validated->username);

            if ($exception == "0") {
                $filter->city_id = $validated->city_id;
                $filter->active = 1;
            }
            
            $data = $this->Transaction_model->get_all_real($filter, $order, $limit, $offset);

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
     * ADD TRANSACTION
     */
    public function add() 
    {
        $this->do_create();
    }

    private function do_create() 
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $id = $this->get_post("id");
            $account_object_id = $this->get_post("account_object_id");
            $city_id = $this->get_post("city_id");
            $trans_date = $this->get_post("trans_date");
            $mode = $this->get_post("mode");

            $error = [];

            // check parameter format
            if (!$account_object_id || intval($account_object_id) <= 0) {
                $error[] = "Insert/Update Data Failed, `account_object_id` Expected INT";
            }
            if (!$city_id || intval($city_id) <= 0) {
                $error[] = "Insert/Update Data Failed, `city_id` Expected INT";
            }
            if (!$trans_date || gettype($trans_date) != "string") {
                $error[] = "Insert/Update Data Failed, `trans_date` Expected STRING";
            }

            // check mode
            if (!$mode || gettype($mode) != "string" && ($mode != "C" || $mode != "U")) {
                $error[] = "Insert/Update Data Failed, `mode " . $mode . "` Not Found";
            } else {
                if ($mode == "U" && (!$id || intval($id) <= 0)) {
                    $error[] = "Insert/Update Data Failed, `id` Expected INT";
                }
            }
            
            if (count($error) > 0) {
                return $this->response(error_handler(1, 500, $error[0]), 500);
            }

            $params = $this->input_fields();
            $save = $this->Transaction_model->save($params);

            if ($save['code'] == 200) {
                $this->response($save);
                // insert log
                $this->Log_model->log("transaction", $mode, $params, $validated->username);
            } else {
                $this->response($save, $save["code"]);
            }
        } else {
            $this->response(error_handler(1, 401), 401);
        }
    }

    /**
     * DISABLE TRANSACTION
     * @param id [INT]
     */
    public function remove($id)
    {
        return $this->do_remove($id);
    }

    private function do_remove($id)
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $error = [];

            // check parameter format
            if (!$id || intval($id) <= 0) {
                $error[] = "Insert/Update Data Failed, `id` Expected INT";
            }
            
            if (count($error) > 0) {
                return $this->response(error_handler(1, 500, $error[0]), 500);
            }

            $remove = $this->Transaction_model->delete(intval($id));

            if ($remove['code'] == 200) {
                $this->response($remove);
                // insert log
                $this->Log_model->log("transaction", "D", array("id" => intval($id)), $validated->username);
            } else {
                $this->response($remove, $remove["code"]);
            }
        } else {
            $this->response(error_handler(1, 401), 401);
        }
    }
    
    /**
     * ACCOUNT OBJECT PLAN LIST
     */
    public function account_object_plan()
    {
        $this->do_get_account_object_plan();
    }

    /**
     * GET ALL ACCOUNT OBJECT PLAN LIST
     */
    private function do_get_account_object_plan() 
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $filter = "";
            $order = !empty($this->get_param("order")) ? $this->get_param("order") : "id desc"; 

            $exception = $this->Auth_model->user_exception($validated->username);

            if ($exception == "0") {
                $filter = " AND st.city_id = " . $validated->city_id;
            }
            
            $list = $this->Transaction_model->get_account_object_plan($filter, $order);

            if ($list['code'] == 200) {
                $this->response($list);
            } else {
                $this->response($list, $list["code"]);
            }
        } else {
            $this->response(error_handler(1, 401), 401);
        }
    }
    
    /**
     * ACCOUNT OBJECT REAL LIST
     */
    public function account_object_real()
    {
        $this->do_get_account_object_real();
    }

    /**
     * GET ALL ACCOUNT OBJECT REAL LIST
     */
    private function do_get_account_object_real() 
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $filter = "";
            $order = !empty($this->get_param("order")) ? $this->get_param("order") : "id desc"; 

            $exception = $this->Auth_model->user_exception($validated->username);

            if ($exception == "0") {
                $filter = " AND st.city_id = " . $validated->city_id;
            }
            
            $list = $this->Transaction_model->get_account_object_real($filter, $order);

            if ($list['code'] == 200) {
                $this->response($list);
            } else {
                $this->response($list, $list["code"]);
            }
        } else {
            $this->response(error_handler(1, 401), 401);
        }
    }

    /**
     * LAST TRANSACTION
     */
    public function last_transaction()
    {
        $this->do_get_last_transaction();
    }

    /**
     * GET LAST TRANSACTION
     */
    private function do_get_last_transaction() 
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $filter = !empty($this->get_param("filter")) ? $this->get_param("filter") : new stdClass();
            $order = !empty($this->get_param("order")) ? $this->get_param("order") : "trans_date desc"; 
            $limit = !empty($this->get_param("limit")) ? $this->get_param("limit") : 1; 
            $offset = !empty($this->get_param("offset")) ? $this->get_param("offset") : 0; 

            $exception = $this->Auth_model->user_exception($validated->username);

            if ($exception == "0") {
                $filter->city_id = $validated->city_id;
            }
            
            $data = $this->Transaction_model->get_last_transaction($filter, $order, $limit, $offset);

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
     * FORMAT REQUEST - FIELDS
     */
    private function input_fields()
    {
        return array(
            "id" => intval($this->get_post("id")),
            "account_object_id" => intval($this->get_post("account_object_id")),
            "city_id" => intval($this->get_post("city_id")),
            "plan_amount" => $this->get_post("plan_amount"),
            "real_amount" => $this->get_post("real_amount"),
            "trans_date" => $this->get_post("trans_date"),
            "mode" => $this->get_post("mode"),
        );
    }

}
