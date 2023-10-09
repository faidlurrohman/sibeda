<?php

class Signer extends REST_Controller {

    /**
     * INDEX
     */
    public function index()
    {
        $this->do_get_all();
    }

    /**
     * GET ALL SIGNER
     */
    private function do_get_all() 
    {   
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $filter = !empty($this->get_param("filter")) ? $this->get_param("filter") : [];
            $order = !empty($this->get_param("order")) ? $this->get_param("order") : "id desc"; 
            $limit = !empty($this->get_param("limit")) ? $this->get_param("limit") : 0; 
            $offset = !empty($this->get_param("offset")) ? $this->get_param("offset") : 0; 
            $data = $this->Signer_model->get_all($filter, $order, $limit, $offset);

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
     * GET ALL SIGNER ACTIVE
     */
    public function list()
    {
        $this->do_get_list();
    }

    private function do_get_list() 
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $order = !empty($this->get_param("order")) ? $this->get_param("order") : "id desc"; 
            $list = $this->Signer_model->get_list($order);

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
     * ADD SIGNER
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
            $nip = $this->get_post("nip");
            $fullname = $this->get_post("fullname");
            $title = $this->get_post("title");
            $position = $this->get_post("position");
            $mode = $this->get_post("mode");

            $error = [];

            // check parameter format
            if (!$nip || gettype($nip) != "string") {
                $error[] = "Insert/Update Data Failed, `nip` Expected STRING";
            }
            if (!$fullname || gettype($fullname) != "string") {
                $error[] = "Insert/Update Data Failed, `fullname` Expected STRING";
            }
            if (!$title || gettype($title) != "string") {
                $error[] = "Insert/Update Data Failed, `title` Expected STRING";
            }
            if (!$position || gettype($position) != "string") {
                $error[] = "Insert/Update Data Failed, `position` Expected STRING";
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
            $save = $this->Signer_model->save($params);

            if ($save['code'] == 200) {
                $this->response($save);
                // insert log
                $this->Log_model->log("signer", $mode, $params, $validated->username);
            } else {
                $this->response($save, $save["code"]);
            }
        } else {
            $this->response(error_handler(1, 401), 401);
        }
    }

    /**
     * DISABLE SIGNER
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

            $remove = $this->Signer_model->delete(intval($id));

            if ($remove['code'] == 200) {
                $this->response($remove);
                // insert log
                $this->Log_model->log("signer", "D", array("id" => intval($id)), $validated->username);
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
            "nip" => $this->get_post("nip"),
            "fullname" => $this->get_post("fullname"),
            "title" => $this->get_post("title"),
            "position" => $this->get_post("position"),
            "mode" => $this->get_post("mode"),
        );
    }

}
