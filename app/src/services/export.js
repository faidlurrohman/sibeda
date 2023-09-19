import axios from "./axios";

export const addExportLog = (values) => {
  return axios.post("/export/log", values);
};
