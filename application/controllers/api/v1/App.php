<?php

class App extends REST_Controller {

    /**
     * INDEX
     */
    public function index()
    {
        $this->do_init();
    }

    /**
     * INIT
     */
    private function do_init() 
    {
        $this->response(["success" => true, "message" => "eating some hamburger!!!"]);
    }

    /**
     * INDEX
     */
    public function ping()
    {
        $this->do_ping();
    }

	public function do_ping()
	{
		$this->CI = &get_instance();
		$this->DB = $this->CI->load->database('default', true);
		$r = false;
        $m = "";
        $c = 500;
		if (false != $this->DB->conn_id) {
			$r = true;
            $m = 'DB CONNECTED';
            $c = 200;
		}

        $this->response(["success" => $r, "message" => $m], $c);
	}
}
