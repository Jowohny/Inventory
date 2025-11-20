import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase-config";

export const useGetLogin = () => {

	const getLogin = async (email: string) => {
		const emailDoc = doc(db, 'enabledUsers', email);
		const docSnapshot = await getDoc(emailDoc);

		if (!docSnapshot.exists) return { success: false }
	
		return { success: true }
	};

	return { getLogin }
}