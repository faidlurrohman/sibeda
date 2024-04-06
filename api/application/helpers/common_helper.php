<?php

if (!defined('BASEPATH'))
    exit("No direct script access allowed");
    
function get_token() 
{
    $CI = &get_instance();
    
    /**
     * ! DO CHECK
     * ??? why in server not read authorization header
     */

    $_authorization = $CI->input->get_request_header("AUTHORIZATION", TRUE);
    $_xclientid = $CI->input->get_request_header("X-CLIENT-ID", TRUE);
    $_secretkey = $CI->input->get_request_header("SECRET-KEY", TRUE);

    if (isset($_authorization)) {
        $token = explode("Bearer ", $_authorization)[1];
    } else if (isset($_xclientid)) {
        $token = explode("Bearer ", $_xclientid)[1];
    } else if (isset($_secretkey)) {
        $token = explode("Bearer ", $_secretkey)[1];
    } else {
        $token = "";
    }

    return isset($token) ? $token : "";
}

function model_response($query, $type = 0)
{
    $CI = &get_instance();
    $error = $CI->db->error();

    if ($error["code"] == "0") {
        return success_handler($query, $type);
    } else {
        return error_handler(0, $error);
    }
}

function success_handler($query, $type)
{
    switch ($type) {
        // (data || list) 
        case 0:
            $status = true; 
            $code = 200;
            $data = $query->result();
            $message = "";
            $total = intval($data[0]->total);
            break;
        // (save || update || delete) 
        case 1:
            $status = true; 
            $code = 200;
            $data = [];
            $message = "";
            $total = 0;
            break;
        // (login) 
        case 2:
            $status = true; 
            $code = 200;
            $data = $query->row();
            $message = "";
            $total = 1;
            break;
        // (generate_token) 
        case 3:
            $status = true; 
            $code = 200;
            $data = $query->row()->token;
            $message = "";
            $total = 1;
            break;
        default :
            $status = false; 
            $code = 500;
            $data = [];
            $message = "HELPER ::: No response type";
            $total = 0;
    }

    return ["status" => $status, "code" =>  $code, "data" => $data, "message" => $message, "total" => $total];
}

// MYSQL ERROR REFERENCE => https://dev.mysql.com/doc/mysql-errors/8.0/en/server-error-reference.html
function error_handler($target, $error, $error_message = "")
{
    $code = $target == 0 ? $error["code"] : $error;

    switch ($code) {
        // mysql error here
        // duplicate
        case 1062:
            $message = "Data sudah ada";
            break;

        // manual error here
        // authorized
        case 401:
            $message = "Data User tidak ditemukan, hubungi admin";
            break;
        // 500 
        case 500:
            $message = $error_message;
            break;

        default : 
            $message = $error["message"];
    }

    return ["status" => false, "code" =>  $code, "data" => [], "message" => $message, "total" => 0];
}

function set_filter($filters, $table_name, $additional = []) 
{

    $generate_filter = "";
    $fields = "";

    if (count((array)$filters)) {
        if($table_name != ""){
            $CI = &get_instance();
            $CI->load->model("v1/Schema_model");
            $fields = $CI->Schema_model->get_field_type($table_name);
        }

        foreach ($filters as $kf => $filter) {
            // default from field type from table
            if ($fields && count($fields) > 0) {
                foreach ($fields as $kt => $field) {
                    if ($fields[$kt]->COLUMN_NAME == $kf) {
                        if (
                            $fields[$kt]->DATA_TYPE == 'int' ||
                            $fields[$kt]->DATA_TYPE == 'tinyint' ||
                            $fields[$kt]->DATA_TYPE == 'float'
                        ) {
                        $generate_filter .= " AND " . $kf . " = " . intval($filter);
                        } else if (
                            $fields[$kt]->DATA_TYPE == 'text' ||
                            $fields[$kt]->DATA_TYPE == 'varchar'
                        ) {
                            $generate_filter .= " AND " . $kf . " LIKE '%" . $filter . "%'";
                        } else if (
                            $fields[$kt]->DATA_TYPE == 'date'
                        ) {
                        $generate_filter .= " AND " . $kf . " = '" . $filter . "'";
                        }
                    }
                }
            }
            // modified filter and clause here
            if (count($additional) > 0) {
                foreach ($additional as $adt) {
                    $spl_clause = set_clause($adt, $kf, $filter);

                    if ($spl_clause != "") {
                        $generate_filter .= $spl_clause;
                    } else {
                        $spl_field = explode("_TYPE_", $adt)[0];
                        $spl_type = explode("_TYPE_", $adt)[1];

                        if ($spl_field == $kf && $filter) {
                            if (
                                $spl_type == 'int' ||
                                $spl_type == 'tinyint' ||
                                $spl_type == 'float'
                            ) {
                                $generate_filter .= " AND " . $kf . " = " . intval($filter);
                            } else if (
                                $spl_type == 'text' ||
                                $spl_type == 'varchar'
                            ) {
                                $generate_filter .= " AND " . $kf . " LIKE '%" . $filter . "%'";
                            } else if (
                                $spl_type == 'date'
                            ) {
                                $generate_filter .= " AND " . $kf . " = '" . $filter . "'";
                            } else if (
                                $spl_type == 'daterange_start'
                            ) {
                                $spl_kf = explode("_", $kf);
                                $generate_filter .= " AND " . $spl_kf[0] . " >= '" . $filter . "'";
                            } else if (
                                $spl_type == 'daterange_end'
                            ) {
                                $spl_kf = explode("_", $kf);
                                $generate_filter .= " AND " . $spl_kf[0] . " <= '" . $filter . "'";
                            }
                        }
                    }
                }
            }
        }
    }

    return $generate_filter;
}

function set_clause($value, $key, $filter) 
{
    $clause = "";
    $spl_clause = explode("_CLAUSE_", $value);

    if ($spl_clause[1] && $spl_clause[1] != "") {
        $spl_field = explode("_TYPE_", $spl_clause[0])[0];
        $spl_type = explode("_TYPE_", $spl_clause[0])[1];

        if ($spl_field == $key && $spl_clause[1] == "IN") {
            if (
                $filter &&
                (
                    $spl_type == 'int' ||
                    $spl_type == 'tinyint' ||
                    $spl_type == 'float'
                )
            ) {
                $clause = " AND " . $spl_field . " IN (" . $filter . ")";
            }
        }
    }

    return $clause;
}

function set_order($value)
{
    return str_replace("%20"," ",$value);
}

function set_limit_offset($limit, $offset) 
{
    $generate_limit_offset = "";

    if ($limit != 0) {
        $generate_limit_offset .= " LIMIT " . $limit;
    }

    if ($offset != 0) {
        $generate_limit_offset .= " OFFSET " . $limit;
    }

    return $generate_limit_offset;
}