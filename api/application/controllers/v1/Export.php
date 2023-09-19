<?php

class Export extends REST_Controller {

    /**
     * LOG EXPORT
     */
    public function log() 
    {
        $this->do_create();
    }

    private function do_create() 
    {
        $validated = $this->Auth_model->validating_token();

        if ($validated) {
            $table = $this->get_post("table");
            $mode = $this->get_post("mode");
            $error = [];

            // check mode
            if (!$mode || gettype($mode) != "string" && ($mode != "E")) {
                $error[] = "Insert Data Failed, `mode " . $mode . "` Not Found";
            } 
            
            if (count($error) > 0) {
                return $this->response(error_handler(1, 500, $error[0]), 500);
            }

            // insert log
            $this->Log_model->log($table, "E", $this->input_fields(), $validated->username);
            $this->response(["status" => true, "code" =>  200, "data" => [], "message" => "", "total" => 0]);
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
            "table" => $this->get_post("table"),
            "export" => $this->get_post("export"),
            "mode" => $this->get_post("mode"),
        );
    }

}
