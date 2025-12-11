import { addDoc, collection, doc, getDocs, deleteDoc, query, where } from "firebase/firestore"
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
    const q = query(categoryRef, where('id', '==', id));
    const querySnapshot = await getDocs(q);

    const docToDelete = querySnapshot.docs[0];
    
    const categoryDocRef = doc(db, 'categories', docToDelete.id);
    
    await deleteDoc(categoryDocRef);
  }

	const clearDBCategories = async () => {
		const snapshot = await getDocs(categoryRef)

		snapshot.forEach(async (snap) => { await deleteDoc(snap.ref) })
	}

	return { addDBCategory, deleteDBCategory, clearDBCategories };
}