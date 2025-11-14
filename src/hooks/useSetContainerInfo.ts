import { addDoc, collection, deleteDoc, where, query, getDocs } from "firebase/firestore";
import type { Item } from "../storage";
import { db } from "../config/firebase-config";

export const useSetContainerInfo = () => {
	const containerRef = collection(db, "containers")

	const addDBContainer = async (id: string, name: string, items: Item[]) => {
		await addDoc(containerRef, {
			id,
			name, 
			items
		});
	}

	const deleteDBContainer = async (id: string) => {
		const q = query(
				containerRef,
				where('id', '==', id)
		);

		const querySnapshot = await getDocs(q);

		if (!querySnapshot.empty) {
			await deleteDoc(querySnapshot.docs[0].ref)
		}
}


	return { addDBContainer, deleteDBContainer };
}

