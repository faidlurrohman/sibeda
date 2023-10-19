<?php

class Real extends REST_Controller {

    /**
     * REAL IN
     * PENDAPATAN
     */
    public function in()
    {
        $this->do_get_in();
    }

    /**
     * GET ALL REAL IN
     */
    private function do_get_in() 
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $filter = !empty($this->get_param("filter")) ? $this->get_param("filter") : [];
            $order = !empty($this->get_param("order")) ? $this->get_param("order") : "id desc"; 
            $limit = !empty($this->get_param("limit")) ? $this->get_param("limit") : 0; 
            $offset = !empty($this->get_param("offset")) ? $this->get_param("offset") : 0; 

            $exception = $this->Auth_model->user_exception($validated->username);

            if ($exception == "0") {
                $filter["city_id"] = $validated->city_id;
                $filter["active"] = 1;
            }
            
            $data = $this->Real_model->get_all_in($filter, $order, $limit, $offset);

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
     * REAL OUT
     * BELANJA
     */
    public function out()
    {
        $this->do_get_out();
    }

    /**
     * GET ALL REAL OUT
     */
    private function do_get_out() 
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $filter = !empty($this->get_param("filter")) ? $this->get_param("filter") : [];
            $order = !empty($this->get_param("order")) ? $this->get_param("order") : "id desc"; 
            $limit = !empty($this->get_param("limit")) ? $this->get_param("limit") : 0; 
            $offset = !empty($this->get_param("offset")) ? $this->get_param("offset") : 0; 

            $exception = $this->Auth_model->user_exception($validated->username);

            if ($exception == "0") {
                $filter["city_id"] = $validated->city_id;
                $filter["active"] = 1;
            }
            
            $data = $this->Real_model->get_all_out($filter, $order, $limit, $offset);

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
     * REAL COST
     * PEMBIAYAAN
     */
    public function cost()
    {
        $this->do_get_cost();
    }

    /**
     * GET ALL REAL COST
     */
    private function do_get_cost() 
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $filter = !empty($this->get_param("filter")) ? $this->get_param("filter") : [];
            $order = !empty($this->get_param("order")) ? $this->get_param("order") : "id desc"; 
            $limit = !empty($this->get_param("limit")) ? $this->get_param("limit") : 0; 
            $offset = !empty($this->get_param("offset")) ? $this->get_param("offset") : 0; 

            $exception = $this->Auth_model->user_exception($validated->username);

            if ($exception == "0") {
                $filter["city_id"] = $validated->city_id;
                $filter["active"] = 1;
            }
            
            $data = $this->Real_model->get_all_cost($filter, $order, $limit, $offset);

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
     * ACCOUNT OBJECT DETAIL SUB REAL IN
     */
    public function detail_sub_real_in()
    {
        $this->do_get_detail_sub_real_in();
    }

    /**
     * GET ALL ACCOUNT OBJECT DETAIL SUB REAL IN
     */
    private function do_get_detail_sub_real_in() 
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $filter = "";
            $order = !empty($this->get_param("order")) ? $this->get_param("order") : "id desc"; 

            $exception = $this->Auth_model->user_exception($validated->username);

            if ($exception == "0") {
                $filter = " AND st.city_id = " . $validated->city_id;
            }
            
            $list = $this->Real_model->get_detail_sub_real_in($filter, $order);

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
     * ACCOUNT OBJECT DETAIL SUB REAL OUT
     */
    public function detail_sub_real_out()
    {
        $this->do_get_detail_sub_real_out();
    }

    /**
     * GET ALL ACCOUNT OBJECT DETAIL SUB REAL OUT
     */
    private function do_get_detail_sub_real_out() 
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $filter = "";
            $order = !empty($this->get_param("order")) ? $this->get_param("order") : "id desc"; 

            $exception = $this->Auth_model->user_exception($validated->username);

            if ($exception == "0") {
                $filter = " AND st.city_id = " . $validated->city_id;
            }
            
            $list = $this->Real_model->get_detail_sub_real_out($filter, $order);

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
     * ACCOUNT OBJECT DETAIL SUB REAL COST
     */
    public function detail_sub_real_cost()
    {
        $this->do_get_detail_sub_real_cost();
    }

    /**
     * GET ALL ACCOUNT OBJECT DETAIL SUB REAL COST
     */
    private function do_get_detail_sub_real_cost() 
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $filter = "";
            $order = !empty($this->get_param("order")) ? $this->get_param("order") : "id desc"; 

            $exception = $this->Auth_model->user_exception($validated->username);

            if ($exception == "0") {
                $filter = " AND st.city_id = " . $validated->city_id;
            }
            
            $list = $this->Real_model->get_detail_sub_real_cost($filter, $order);

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
     * LAST IN
     */
    public function last_in()
    {
        $this->do_get_last_in();
    }

    /**
     * GET LAST IN
     */
    private function do_get_last_in() 
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $filter = !empty($this->get_param("filter")) ? $this->get_param("filter") : [];
            $order = !empty($this->get_param("order")) ? $this->get_param("order") : "trans_date desc"; 
            $limit = !empty($this->get_param("limit")) ? $this->get_param("limit") : 1; 
            $offset = !empty($this->get_param("offset")) ? $this->get_param("offset") : 0; 

            $exception = $this->Auth_model->user_exception($validated->username);

            if ($exception == "0") {
                $filter["city_id"] = $validated->city_id;
            }
            
            $data = $this->Real_model->get_last_in($filter, $order, $limit, $offset);

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
     * LAST OUT
     */
    public function last_out()
    {
        $this->do_get_last_out();
    }

    /**
     * GET LAST OUT
     */
    private function do_get_last_out() 
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $filter = !empty($this->get_param("filter")) ? $this->get_param("filter") : [];
            $order = !empty($this->get_param("order")) ? $this->get_param("order") : "trans_date desc"; 
            $limit = !empty($this->get_param("limit")) ? $this->get_param("limit") : 1; 
            $offset = !empty($this->get_param("offset")) ? $this->get_param("offset") : 0; 

            $exception = $this->Auth_model->user_exception($validated->username);

            if ($exception == "0") {
                $filter["city_id"] = $validated->city_id;
            }
            
            $data = $this->Real_model->get_last_out($filter, $order, $limit, $offset);

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
     * LAST COST
     */
    public function last_cost()
    {
        $this->do_get_last_cost();
    }

    /**
     * GET LAST COST
     */
    private function do_get_last_cost() 
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $filter = !empty($this->get_param("filter")) ? $this->get_param("filter") : [];
            $order = !empty($this->get_param("order")) ? $this->get_param("order") : "trans_date desc"; 
            $limit = !empty($this->get_param("limit")) ? $this->get_param("limit") : 1; 
            $offset = !empty($this->get_param("offset")) ? $this->get_param("offset") : 0; 

            $exception = $this->Auth_model->user_exception($validated->username);

            if ($exception == "0") {
                $filter["city_id"] = $validated->city_id;
            }
            
            $data = $this->Real_model->get_last_cost($filter, $order, $limit, $offset);

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
            $account_object_detail_sub_id = $this->get_post("account_object_detail_sub_id");
            $city_id = $this->get_post("city_id");
            $trans_date = $this->get_post("trans_date");
            $mode = $this->get_post("mode");

            $error = [];

            // check parameter format
            if (!$account_object_detail_sub_id || intval($account_object_detail_sub_id) <= 0) {
                $error[] = "Insert/Update Data Failed, `account_object_detail_sub_id` Expected INT";
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
            $save = $this->Real_model->save($params);

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

            $remove = $this->Real_model->delete(intval($id));

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
     * FORMAT REQUEST - FIELDS
     */
    private function input_fields()
    {
        return array(
            "id" => intval($this->get_post("id")),
            "account_object_detail_sub_id" => intval($this->get_post("account_object_detail_sub_id")),
            "city_id" => intval($this->get_post("city_id")),
            "plan_amount" => $this->get_post("plan_amount"),
            "real_amount" => $this->get_post("real_amount"),
            "trans_date" => $this->get_post("trans_date"),
            "mode" => $this->get_post("mode"),
        );
    }
}
