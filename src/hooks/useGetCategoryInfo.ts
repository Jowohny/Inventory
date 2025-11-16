import { collection, doc, getDocs, getDoc } from "firebase/firestore";
import { db } from "../config/firebase-config";

export const useGetCategoryInfo = () => {
	const categoryRef = collection(db, "categories");

	const getDBCategories = async () => {
		const snapshot = await getDocs(categoryRef);

		return snapshot.docs.map((docs) => ({
			id: docs.id,
			brand: docs.data().brand,
			style: docs.data().style,
			size: docs.data().size
		}));
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
		}
	}

	return { getDBCategories, getDBCategoryFromId };
};
