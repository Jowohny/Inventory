import { addDoc, collection, doc, getDocs, deleteDoc } from "firebase/firestore"
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
		const categoryDoc = doc(db, 'categories', id);
		await deleteDoc(categoryDoc)
	}

	const clearDBCategories = async () => {
		const snapshot = await getDocs(categoryRef)

		snapshot.forEach(async (snap) => { await deleteDoc(snap.ref) })
	}

	return { addDBCategory, deleteDBCategory, clearDBCategories };
}