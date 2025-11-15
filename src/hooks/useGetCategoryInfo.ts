import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase-config";

export const useGetCategoryInfo = () => {
	const categoryRef = collection(db, "categories");

	const getCategories = async () => {
		const snapshot = await getDocs(categoryRef);

		return snapshot.docs.map((docs) => ({
			id: docs.id,
			brand: docs.data().brand,
			style: docs.data().style,
			size: docs.data().size
		}));
	};

	return { getCategories };
};
