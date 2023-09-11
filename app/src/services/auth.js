import axios from "./axios";

export const doLogin = (values) => {
	return axios.post("/auth/login", values);
};

export const doLogout = (values) => {
	return axios.post("/auth/logout", values);
};
