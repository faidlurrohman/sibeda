<?php

class User extends REST_Controller {

    /**
     * INDEX
     */
    public function index()
    {
        $this->do_get_all();
    }

    /**
     * GET ALL USER
     */
    private function do_get_all() 
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $filter = !empty($this->get_param("filter")) ? $this->get_param("filter") : new stdClass();
            $order = !empty($this->get_param("order")) ? $this->get_param("order") : "id desc"; 
            $limit = !empty($this->get_param("limit")) ? $this->get_param("limit") : 0; 
            $offset = !empty($this->get_param("offset")) ? $this->get_param("offset") : 0; 
            $data = $this->User_model->get_all($filter, $order, $limit, $offset);

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
     * ADD USER
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
            $username = $this->get_post("username");
            $password = $this->get_post("password");
            $role_id = $this->get_post("role_id");
            $city_id = $this->get_post("city_id");
            $fullname = $this->get_post("fullname");
            $title = $this->get_post("title");
            $mode = $this->get_post("mode");

            $error = [];

            // check parameter format
            if (!$username || gettype($username) != "string") {
                $error[] = "Insert/Update Data Failed, `username` Expected STRING";
            }
            if (!$role_id || intval($role_id) <= 0) {
                $error[] = "Insert/Update Data Failed, `role_id` Expected INT";
            }
            if (!$city_id || intval($city_id) <= 0) {
                $error[] = "Insert/Update Data Failed, `city_id` Expected INT";
            }
            if (!$fullname || gettype($fullname) != "string") {
                $error[] = "Insert/Update Data Failed, `fullname` Expected STRING";
            }
            if (!$title || gettype($title) != "string") {
                $error[] = "Insert/Update Data Failed, `title` Expected STRING";
            }

            // check mode
            if (!$mode || gettype($mode) != "string" && ($mode != "C" || $mode != "U")) {
                $error[] = "Insert/Update Data Failed, `mode " . $mode . "` Not Found";
            } else {
                if ($mode == "C" && (!$password || gettype($password) != "string")) {
                    $error[] = "Insert/Update Data Failed, `password` Expected STRING";
                } else if ($mode == "U" && (!$id || intval($id) <= 0)) {
                    $error[] = "Insert/Update Data Failed, `id` Expected INT";
                }
            }
            
            if (count($error) > 0) {
                return $this->response(error_handler(1, 500, $error[0]), 500);
            }

            $params = $this->input_fields();
            $save = $this->User_model->save($params);

            if ($save['code'] == 200) {
                $this->response($save);
                // insert log
                $this->Log_model->log("user", $mode, $params, $validated->username);
            } else {
                $this->response($save, $save["code"]);
            }
        } else {
            $this->response(error_handler(1, 401), 401);
        }
    }

    /**
     * DISABLE USER
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

            $remove = $this->User_model->delete(intval($id));

            if ($remove['code'] == 200) {
                $this->response($remove);
                // insert log
                $this->Log_model->log("user", "D", array("id" => intval($id)), $validated->username);
            } else {
                $this->response($remove, $remove["code"]);
            }
        } else {
            $this->response(error_handler(1, 401), 401);
        }
    }

    /**
     * UPDATE USER PASSWORD
     */
    public function update_password()
    {
        $this->do_update_password();
    }

    private function do_update_password()
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $username = $this->get_post("username");
            $password = $this->get_post("new_password");

            $error = [];

            if (!$username || gettype($username) != "string") {
                $error[] = "Insert/Update Data Failed, `username` Expected STRING";
            }
            if (!$password || gettype($password) != "string") {
                $error[] = "Insert/Update Data Failed, `password` Expected STRING";
            }
            
            if (count($error) > 0) {
                return $this->response(error_handler(1, 500, $error[0]), 500);
            }

            $params = $this->input_fields(1);
            $update_password = $this->User_model->update_password($params);

            if ($update_password['code'] == 200) {
                $this->response($update_password);
                // insert log
                $this->Log_model->log("user", "U", $params, $validated->username);
            } else {
                $this->response($update_password, $update_password["code"]);
            }
        } else {
            $this->response(error_handler(1, 401), 401);
        }
    }


    /**
     * FORMAT REQUEST - FIELDS
     * @param is_only_password [BOOLEAN 0/1]
     */
    private function input_fields($is_only_password = 0)
    {
        if ($is_only_password == 0){
            return array(
                "id" => intval($this->get_post("id")),
                "username" => $this->get_post("username"),
                "password" => $this->Auth_model->do_generate_password($this->get_post("password")),
                "role_id" => intval($this->get_post("role_id")),
                "city_id" => intval($this->get_post("city_id")),
                "fullname" => $this->get_post("fullname"),
                "title" => $this->get_post("title"),
                "mode" => $this->get_post("mode"),
            );
        } else {
            return array(
                "username" => $this->get_post("username"),
                "password" => $this->Auth_model->do_generate_password($this->get_post("new_password")),
            );
        }
    }

}
