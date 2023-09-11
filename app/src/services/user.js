import axios from "./axios";
import { getUrl } from "../helpers/url";

export const getUsers = (params) => {
	return axios.get(getUrl("/user", params));
};

export const addUser = (values) => {
	return axios.post("/user/add", values);
};

export const setActiveUser = (id) => {
	return axios.delete(`/user/remove/${id}`);
};

export const updatePasswordUser = (values) => {
	return axios.post("/user/update_password", values);
};
