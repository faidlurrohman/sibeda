<?php

class City extends REST_Controller {

    /**
     * INDEX
     */
    public function index()
    {
        $this->do_get_all();
    }

    /**
     * GET ALL CITY
     */
    private function do_get_all() 
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $filter = !empty($this->get_param("filter")) ? $this->get_param("filter") : [];
            $order = !empty($this->get_param("order")) ? $this->get_param("order") : "id desc"; 
            $limit = !empty($this->get_param("limit")) ? $this->get_param("limit") : 0; 
            $offset = !empty($this->get_param("offset")) ? $this->get_param("offset") : 0; 
            $data = $this->City_model->get_all($filter, $order, $limit, $offset);

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
     * GET ALL CITY ACTIVE
     */
    public function list()
    {
        $this->do_get_list();
    }

    private function do_get_list() 
    {   
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $filter = [];
            $order = !empty($this->get_param("order")) ? $this->get_param("order") : "id desc"; 

            $exception = $this->Auth_model->user_exception($validated->username);
            
            if ($exception == "0") {
                $filter["id"] = $validated->city_id;
            }
            
            $list = $this->City_model->get_list($filter, $order);

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
     * ADD CITY
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
            $label = $this->get_post("label");
            $mode = $this->get_post("mode");

            $error = [];

            // check parameter format
            if (!$label || gettype($label) != "string") {
                $error[] = "Insert/Update Data Failed, `label` Expected STRING";
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

            if (!empty($_FILES['blob']['name'])) {
                $config['encrypt_name'] = TRUE;
                $config['upload_path'] = 'uploads/';
                $config['allowed_types'] = 'jpg|jpeg|png';  
                $config['file_name'] = $_FILES['blob']['name'];
                $config['overwrite'] = true;
                $this->load->library('upload', $config);

                if (!$this->upload->do_upload('blob')) {  
                    $error = $this->upload->display_errors();
                    return $this->response(error_handler(1, 500, $error), 500);
                } else {
                    $params["logo"] = $this->upload->data()['file_name'];
                }
            }

            $save = $this->City_model->save($params);

            if ($save['code'] == 200) {
                $this->response($save);
                // insert log
                $this->Log_model->log("city", $mode, $params, $validated->username);
            } else {
                $this->response($save, $save["code"]);
            }
        } else {
            $this->response(error_handler(1, 401), 401);
        }
    }

    /**
     * DISABLE CITY
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
            
            $remove = $this->City_model->delete(intval($id));

            if ($remove['code'] == 200) {
                $this->response($remove);
                // insert log
                $this->Log_model->log("city", "D", array("id" => intval($id)), $validated->username);
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
            "label" => $this->get_post("label"),
            "logo" => $this->get_post("logo"),
            "blob" => $this->get_post("blob"),
            "mode" => $this->get_post("mode"),
        );
    }

}
