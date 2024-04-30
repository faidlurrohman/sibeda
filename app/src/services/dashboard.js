import axios from "./axios";
import { getUrl } from "../helpers/url";

// pendapatan & belanja
export const getInOut = (params) => {
  return axios.get(getUrl("/dashboard/in_out", params));
};

// pembiayaan
export const getCost = (params) => {
  return axios.get(getUrl("/dashboard/cost", params));
};
