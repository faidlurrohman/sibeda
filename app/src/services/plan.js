import axios from "./axios";
import { getUrl } from "../helpers/url";

export const getPlan = (which, params) => {
  return axios.get(getUrl(`/plan/${which}`, params));
};

export const addPlan = (values) => {
  return axios.post("/plan/add", values);
};

export const findPlan = (which, params) => {
  return axios.get(getUrl(`/plan/find_budget_${which}`, params));
};

export const removePlan = (id) => {
  return axios.delete(`/plan/remove/${id}`);
};

export const getAccountObjectDetailSub = (which) => {
  return axios.get(`/plan/detail_sub_plan_${which}`);
};

export const getLastPlan = (which, { account_object_detail_sub_id }) => {
  return axios.get(
    `/plan/last_${which}?filter[account_object_detail_sub_id]=${account_object_detail_sub_id}`
  );
};
