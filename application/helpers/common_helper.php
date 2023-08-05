<?php

if (!defined('BASEPATH'))
    exit('No direct script access allowed');
    
function get_token() 
{
    $CI = &get_instance();
    $auth = $CI->input->get_request_header('Authorization');
    $token = explode("Bearer ", $auth)[1];

    return isset($token) ? $token : '';
}

function model_response($query, $type = 0)
{
    $CI = &get_instance();
    $e = $CI->db->error();
    $response = res_type($type, $query);

    if ($response['code'] == 200 && $e['code'] == '00000') {
        return $response;
    } else {
        return err_msg($response);
    }
}

function res_type($type, $query)
{
    $row = $query->row_array();
    $arr = $query->result_array();

    switch ($type) {
        // read data -> read_data procedure
        case 0:
            $data = json_decode($row['@read'], true);
            $data['data'] = $data['total'] == 0 ? [] : $data['data'];
            break;

        // list data -> list_data procedure
        case 1:
            $data = json_decode($row['@list'], true);
            $data['data'] = $data['total'] == 0 ? [] : $data['data'];
            break;

        // (save || update || delete) data -> cud_data procedure 
        case 2:
            $data = json_decode($row['@cud'], true);
            break;

        // auth -> login function
        case 10:
            $data = json_decode($row['login'], true);
            break;

        // validating token -> validate_token function
        case 11:
            $data = json_decode($row['validate_token'], true);
            break;
    }

    return $data;
}

// MYSQL ERROR REFERENCE => https://dev.mysql.com/doc/mysql-errors/8.0/en/server-error-reference.html
function err_msg($error){
    $code = $error['code'];

    switch ($code) {
        // data duplicate
        case 1062:
            $message = 'Data sudah ada';
            break;

        default : 
            $message = $error['message'];
    }

    return ['code' =>  $code, 'message' => $message, 'data' => [], 'query' => $error['query']];
}

function set_order($value){
    return str_replace('%20',' ',$value);
}