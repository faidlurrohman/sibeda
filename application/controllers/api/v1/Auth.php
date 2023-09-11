<?php

class Auth extends REST_Controller {

    /**
     * LOGIN
     */
    public function login() 
    {   
        $error = [];
        $username = $this->get_post("username");
        $password = $this->get_post("password");

        // check parameter format
        if (!$username || gettype($username) != "string") {
            $error[] = "Login Failed, `username` Expected STRING";
        }

        // check parameter format
        if (!$password || gettype($password) != "string") {
            $error[] = "Login Failed, `password` Expected STRING";
        }
            
        if (count($error) > 0) {
            return $this->response(error_handler(1, 500, $error[0]), 500);
        }

        // check user
        $login = $this->Auth_model->do_login($username, $this->generate_password($password));
        
        if ($login["code"] == 200) {
            if ($login["data"]){
                // generate token
                $token = $this->generate_token($username);

                if ($token["code"] == 200) {
                    // update token
                    $update_token = $this->Auth_model->do_update_token($username, $token["data"]);

                    if ($update_token["code"] == 200) {
                        $login["data"]->token = $token["data"];
                        $this->response($login);
                    } else {
                        $this->response(error_handler(1, 500, "Nama Pengguna tidak ditemukan atau Kata Sandi tidak benar"), 500);
                    }
                } else {
                    $this->response(error_handler(1, 500, "Nama Pengguna tidak ditemukan atau Kata Sandi tidak benar"), 500);
                }
            } else {
                $this->response(error_handler(1, 500, "Nama Pengguna tidak ditemukan atau Kata Sandi tidak benar"), 500);
            }
        } else {
            $this->response($login, $login["code"]);
        }
    }

    /**
     * LOGOUT
     */
    public function logout() 
    {
        $logout = $this->Auth_model->do_logout($this->get_post("username"));

        if ($logout["code"] == 200) {
            $this->response($logout);
        } else {
            $this->response($logout, $logout["code"]);
        }
    }

    /**
     * GENERATE PASSWORD 
     * @param password [STRING]
     */
    private function generate_password($password = "")
    {
        $error = [];

        if ($password != "") {
            // check parameter format
            if (gettype($password) != "string") {
                $error[] = "Generate Password Failed, `password` Expected STRING";
            }
            
            if (count($error) > 0) {
                return $this->response(error_handler(1, 500, $error[0]), 500);
            }

            return $this->Auth_model->do_generate_password($password);
        }
    }

    /**
     * GENERATE TOKEN 
     * @param username [STRING]
     */
    private function generate_token($username = "")
    {
        $error = [];

        if ($username != "") {
            // check parameter format
            if (gettype($username) != "string") {
                $error[] = "Generate Token Failed, `username` Not Found";
            }
            
            if (count($error) > 0) {
                return $this->response(error_handler(1, 500, $error[0]), 500); 
            }

            return $this->Auth_model->do_generate_token($username);
        }
    }
    
}
