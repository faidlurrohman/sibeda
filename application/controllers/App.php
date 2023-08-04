<?php
defined('BASEPATH') or exit('No direct script access allowed');

class App extends CI_Controller {

	function __construct()
	{
		parent::__construct();

        // CORS
        $this->httpcors->_authenticate_CORS();

        // MODELS
        $this->load->model('Auth_model');
	}

	public function index()
	{
		$this->load->view('app');
	}

	public function rest_server()
	{
        $this->load->helper('url');
        $this->load->view('rest_server');
	}

	public function ping()
	{
		$this->CI = &get_instance();
		$this->DB = $this->CI->load->database('default', true);
		$r = false;
		if (false !== $this->DB->conn_id) {
			$r = true;
		}
		echo json_encode(['status' => $r]);
	}

	public function logo($image)
    {
		$file_path = "uploads/" . $image; //<-- specify the image  file

		if(file_exists($file_path)){ 
			$mime = mime_content_type($file_path); //<-- detect file type
			header('Content-Length: '.filesize($file_path)); //<-- sends filesize header
			header("Content-Type: $mime"); //<-- send mime-type header
			header('Content-Disposition: inline; filename="'.$file_path.'";'); //<-- sends filename header
			readfile($file_path); //<--reads and outputs the file onto the output buffer
		}
    }

}
