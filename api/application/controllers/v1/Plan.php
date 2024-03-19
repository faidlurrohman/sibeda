<?php

class Plan extends REST_Controller {

    /**
     * PLAN IN
     * PENDAPATAN
     */
    public function in()
    {
        $this->do_get_in();
    }

    /**
     * GET ALL PLAN IN
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
            
            $data = $this->Plan_model->get_all_in($validated->username, $filter, $order, $limit, $offset);

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
     * PLAN OUT
     * BELANJA
     */
    public function out()
    {
        $this->do_get_out();
    }

    /**
     * GET ALL PLAN OUT
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
            
            $data = $this->Plan_model->get_all_out($validated->username, $filter, $order, $limit, $offset);

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
     * PLAN COST
     * PEMBIAYAAN
     */
    public function cost()
    {
        $this->do_get_cost();
    }

    /**
     * GET ALL PLAN COST
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
            
            $data = $this->Plan_model->get_all_cost($validated->username, $filter, $order, $limit, $offset);

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
     * ACCOUNT OBJECT DETAIL SUB PLAN IN
     */
    public function detail_sub_plan_in()
    {
        $this->do_get_detail_sub_plan_in();
    }

    /**
     * GET ALL ACCOUNT OBJECT DETAIL SUB PLAN IN
     */
    private function do_get_detail_sub_plan_in() 
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $filter = "";
            $order = !empty($this->get_param("order")) ? $this->get_param("order") : "id desc"; 

            $exception = $this->Auth_model->user_exception($validated->username);

            if ($exception == "0") {
                $filter = " AND st.city_id = " . $validated->city_id;
            }
            
            $list = $this->Plan_model->get_detail_sub_plan_in($validated->username, $filter, $order);

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
     * ACCOUNT OBJECT DETAIL SUB PLAN OUT
     */
    public function detail_sub_plan_out()
    {
        $this->do_get_detail_sub_plan_out();
    }

    /**
     * GET ALL ACCOUNT OBJECT DETAIL SUB PLAN OUT
     */
    private function do_get_detail_sub_plan_out() 
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $filter = "";
            $order = !empty($this->get_param("order")) ? $this->get_param("order") : "id desc"; 

            $exception = $this->Auth_model->user_exception($validated->username);

            if ($exception == "0") {
                $filter = " AND st.city_id = " . $validated->city_id;
            }
            
            $list = $this->Plan_model->get_detail_sub_plan_out($validated->username, $filter, $order);

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
     * ACCOUNT OBJECT DETAIL SUB PLAN COST
     */
    public function detail_sub_plan_cost()
    {
        $this->do_get_detail_sub_plan_cost();
    }

    /**
     * GET ALL ACCOUNT OBJECT DETAIL SUB PLAN COST
     */
    private function do_get_detail_sub_plan_cost() 
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $filter = "";
            $order = !empty($this->get_param("order")) ? $this->get_param("order") : "id desc"; 

            $exception = $this->Auth_model->user_exception($validated->username);

            if ($exception == "0") {
                $filter = " AND st.city_id = " . $validated->city_id;
            }
            
            $list = $this->Plan_model->get_detail_sub_plan_cost($validated->username, $filter, $order);

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
            
            $data = $this->Plan_model->get_last_in($filter, $order, $limit, $offset);

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
            
            $data = $this->Plan_model->get_last_out($filter, $order, $limit, $offset);

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
            
            $data = $this->Plan_model->get_last_cost($filter, $order, $limit, $offset);

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
            $mode = $this->get_post("mode");

            $error = [];

            // check parameter format
            if (!$account_object_detail_sub_id || intval($account_object_detail_sub_id) <= 0) {
                $error[] = "Insert/Update Data Failed, `account_object_detail_sub_id` Expected INT";
            }
            if (!$city_id || intval($city_id) <= 0) {
                $error[] = "Insert/Update Data Failed, `city_id` Expected INT";
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
            $save = $this->Plan_model->save($params, $validated->username);

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

            $remove = $this->Plan_model->delete(intval($id));

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
            "mode" => $this->get_post("mode"),
        );
    }
}
