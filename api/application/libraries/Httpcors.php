<?php
defined("BASEPATH") OR exit("No direct script access allowed");
 
class Httpcors {
    
    protected $CI;
	
	public function __construct()
	{
		$this->CI = &get_instance();
    }
    
    function _authenticate_CORS()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: ACCEPT, ORIGIN, X-REQUESTED-WITH, CONTENT-TYPE, AUTHORIZATION, X-CLIENT-ID, SECRET-KEY');
        if ("OPTIONS" === $_SERVER['REQUEST_METHOD']) {
            die();
        }
    }
}