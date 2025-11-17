import { collection, doc, getDocs, getDoc } from "firebase/firestore";
import { db } from "../config/firebase-config";

export const useGetCategoryInfo = () => {
	const categoryRef = collection(db, "categories");

	const getDBCategories = async () => {
		const snapshot = await getDocs(categoryRef);

		if (!snapshot.empty) {
			return snapshot.docs.map((docs) => ({
				id: docs.id,
				brand: docs.data().brand,
				style: docs.data().style,
				size: docs.data().size
			}));		
		} else {
			return null;
		}

	};

	const getDBCategoryFromId = async (id: string) => {
		const categoryDoc = doc(db, 'categories', id);
		const docSnapshot = await getDoc(categoryDoc);

		if (docSnapshot.exists()) {
			return {
				id: docSnapshot.data().id,
				brand: docSnapshot.data().brand,
				style: docSnapshot.data().style,
				size: docSnapshot.data().size
			}
		} else {
			return null;
		}
	}



	return { getDBCategories, getDBCategoryFromId };
};
