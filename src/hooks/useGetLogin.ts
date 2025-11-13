import { query, getDocs, collection, where } from "firebase/firestore";
import { db } from "../config/firebase-config";

export const useGetLogin = () => {
	const enabledUsersRef = collection(db, "enabledUsers");

	const getLogin = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
		const q = query(enabledUsersRef, where("username", "==", username));
		const querySnapshot = await getDocs(q);

		if (querySnapshot.empty) {
			return { success: false, error: "User not found" };
		}

		let passMatch = false;
		querySnapshot.forEach((doc) => {
			const userData = doc.data();
			if (userData.password === password) {
				passMatch  = true;
			}
		});

		if (passMatch) {
			const userInfo = {
				username,
				isAuth: true
			}
			localStorage.setItem('userInfo', JSON.stringify(userInfo))
			return { success: true };
		} else {
			return { success: false, error: "Invalid password" };
		}

	};

	return { getLogin }
}