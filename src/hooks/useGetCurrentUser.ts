export const useGetCurrentUser = () => {
	const data = localStorage.getItem('userInfo');
	if (!data) {
		return { username: null, isAuth: false };
	}

	const { username, isAuth } = JSON.parse(data);
	return { username, isAuth };
}
