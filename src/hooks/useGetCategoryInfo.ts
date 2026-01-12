import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../config/firebase-config";
import type { Category } from "../interface";

export const useGetCategoryInfo = () => {
	const categoryRef = collection(db, "categories");

	const getDBCategories = async (): Promise<Category[]> => {
		const q = query(categoryRef, orderBy('id', 'desc'));
		const snapshot = await getDocs(q);

		const list = snapshot.docs.map(doc => ({
			id: doc.data().id,
			brand: doc.data().brand,
			style: doc.data().style,
			size: doc.data().size
		}));

		return list;
	};

	const getDBCategoryFromId = async (id: string) => {
    const q = query(categoryRef, where('id', '==', id));
    const querySnapshot = await getDocs(q);

		if (!querySnapshot.empty) {
			const docSnapshot = querySnapshot.docs[0]

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

	const findDBCategoryDuplicate = async (brand: string, style: string, size: string) => {
		const	q = query(
			categoryRef, 
			where('brand', '==', brand),
			where('style', '==', style),
			where('size', '==', size)
		);

		const querySnapshot = await getDocs(q);

		if (querySnapshot.empty) {
			return { success: false };
		}
		return { success: true }
	}

	return { getDBCategories, getDBCategoryFromId, findDBCategoryDuplicate };
};
