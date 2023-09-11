import axios from "./axios";
import { getUrl } from "../helpers/url";

export const getTransactionPlan = (params) => {
	return axios.get(getUrl("/transaction/plan", params));
};

export const getTransactionReal = (params) => {
	return axios.get(getUrl("/transaction/real", params));
};

export const addTransaction = (values) => {
	return axios.post("/transaction/add", values);
};

export const setActiveTransaction = (id) => {
	return axios.delete(`/transaction/remove/${id}`);
};

export const getTransactionAccountObjectPlan = () => {
	return axios.get(`/transaction/account_object_plan`);
};

export const getTransactionAccountObjectReal = () => {
	return axios.get(`/transaction/account_object_real`);
};

export const getLastTransaction = ({ trans_date, account_object_id }) => {
	return axios.get(
		`/transaction/last_transaction?filter[trans_date]=${trans_date}&filter[account_object_id]=${account_object_id}`
	);
};
