import { addDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore"
import { db } from "../config/firebase-config"

export const useSetCategoryInfo = () => {
	const categoryRef = collection(db, 'categories')

	const addDBCategory = async (id: string, brand: string, style: string, size: string) => {
		await addDoc(categoryRef, {
			id,
			brand,
			style,
			size
		})
	}

	const deleteDBCategory = async (id: string) => {
		const q = query(categoryRef, where('id', '==', id))

		const querySnapshot = await getDocs(q);

		if (querySnapshot) {
			await deleteDoc(querySnapshot.docs[0].ref)
		}
	}

	return { addDBCategory, deleteDBCategory };
}