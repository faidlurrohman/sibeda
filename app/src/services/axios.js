import axios from "axios";
import Cookies from "js-cookie";
import { store } from "../store";
import { logoutAction } from "../store/actions/session";
import { swal } from "../helpers/swal";

const axiosInstance = axios.create({
	baseURL: process.env.REACT_APP_BASE_URL_API,
	headers: {
		Accept: "application/json",
		"Content-Type": "application/json",
		Authorization: `Bearer ${Cookies.get(process.env.REACT_APP_ACCESS_TOKEN)}`,
	},
});

axiosInstance.interceptors.request.use((config) => {
	return {
		...config,
		headers: {
			...config.headers,
			Authorization: `Bearer ${Cookies.get(
				process.env.REACT_APP_ACCESS_TOKEN
			)}`,
		},
	};
});

axiosInstance.interceptors.response.use(
	(response) => {
		// console.log("RESPONSE :::", response?.data);
		return response?.data;
	},
	async (error) => {
		// console.log("ERROR :::", error);
		// due internet connection
		if (!navigator.onLine) {
			swal("Tidak ada koneksi internet", "warning");
		} else {
			if (
				error?.response?.status === 401 ||
				error?.response?.data?.code === 401
			) {
				swal(`${error?.response?.data?.message || error.message}.`, "warning");
				store.dispatch(logoutAction());
			} else {
				swal(`${error?.response?.data?.message || error.message}.`);
			}
		}

		return error;
	}
);

export default axiosInstance;
