import axios from "./axios";
import { getUrl } from "../helpers/url";

export const getCities = (params) => {
	return axios.get(getUrl(`/city`, params));
};

export const getCityList = () => {
	return axios.get(`/city/list`);
};

export const addCity = (values) => {
	const formData = new FormData();
	formData.append("id", values?.id);
	formData.append("label", values?.label);
	formData.append("logo", values?.logo || ``);
	formData.append("blob", values?.blob);
	formData.append("mode", values?.mode);

	return axios.post(`/city/add`, formData, {
		headers: {
			"content-type": "multipart/form-data",
		},
	});
};

export const setActiveCity = (id) => {
	return axios.delete(`/city/remove/${id}`);
};
