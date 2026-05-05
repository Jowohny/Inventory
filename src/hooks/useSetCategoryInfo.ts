import { addDoc, collection, doc, getDocs, deleteDoc, writeBatch } from "firebase/firestore"
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

	const deleteDBCategory = async (docId: string) => {
    const categoryDocRef = doc(db, 'categories', docId);
    await deleteDoc(categoryDocRef);
  }

	const clearDBCategories = async () => {
		const snapshot = await getDocs(categoryRef)

		for (let i = 0; i < snapshot.docs.length; i += 500) {
			const batch = writeBatch(db);
			snapshot.docs.slice(i, i + 500).forEach((snap) => batch.delete(snap.ref));
			await batch.commit();
		}
	}

	return { addDBCategory, deleteDBCategory, clearDBCategories };
}
