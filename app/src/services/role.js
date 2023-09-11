import axios from "./axios";

export const getRoleList = () => {
	return axios.get("/role");
};
