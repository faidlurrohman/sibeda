import axios from "./axios";
import { getUrl } from "../helpers/url";

export const getReal = (which, params) => {
  return axios.get(getUrl(`/real/${which}`, params));
};

export const addReal = (values) => {
  return axios.post("/real/add", values);
};

export const removeReal = (id) => {
  return axios.delete(`/real/remove/${id}`);
};

export const getTemplate = (which) => {
  return axios.get(`/real/template_${which}`);
};

export const getAccountObjectDetailSub = (which) => {
  return axios.get(`/real/detail_sub_real_${which}`);
};

export const getLastReal = (
  which,
  { realization_date, account_object_detail_sub_id }
) => {
  return axios.get(
    `/real/last_${which}?filter[realization_date]=${realization_date}&filter[account_object_detail_sub_id]=${account_object_detail_sub_id}`
  );
};
