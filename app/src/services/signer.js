import axios from "./axios";
import { getUrl } from "../helpers/url";

export const getSigner = (params) => {
	return axios.get(getUrl("/signer", params));
};

export const addSigner = (values) => {
	return axios.post("/signer/add", values);
};

export const getSignerList = () => {
	return axios.get(`/signer/list`);
};

export const setActiveSigner = (id) => {
	return axios.delete(`/signer/remove/${id}`);
};
