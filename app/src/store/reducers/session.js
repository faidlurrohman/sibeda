import {
	CLEAR_SESSION,
	LOGIN_USER_FAILURE,
	LOGIN_USER_REQUEST,
	LOGIN_USER_SUCCESS,
} from "../types";

const initialState = { loading: false, user: null };

export default function sessionReducer(state = initialState, action) {
	const { type, user } = action;

	switch (type) {
		case LOGIN_USER_REQUEST:
			return { ...state, loading: true };
		case LOGIN_USER_SUCCESS:
			return { loading: false, user };
		case LOGIN_USER_FAILURE:
			return { ...state, loading: false };
		case CLEAR_SESSION:
			return initialState;
		default:
			return state;
	}
}
