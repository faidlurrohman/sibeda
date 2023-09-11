import axios from "./axios";
import { getUrl } from "../helpers/url";

export const getRealPlanCities = (params) => {
	return axios.get(getUrl("/report/real_plan_cities", params));
};

export const getRecapitulationCities = (params) => {
	return axios.get(getUrl("/report/recapitulation_cities", params));
};
