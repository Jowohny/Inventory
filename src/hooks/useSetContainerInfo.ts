import { addDoc, collection, deleteDoc, doc, getDocs, writeBatch } from "firebase/firestore";
import type { Item } from "../interface";
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
		const containerDoc = doc(db, 'containers', id);
		await deleteDoc(containerDoc);
	}

	const clearDBContainers = async () => {
		const snapshot = await getDocs(containerRef)

		for (let i = 0; i < snapshot.docs.length; i += 500) {
			const batch = writeBatch(db);
			snapshot.docs.slice(i, i + 500).forEach((snap) => batch.delete(snap.ref));
			await batch.commit();
		}
	}


	return { addDBContainer, deleteDBContainer, clearDBContainers };
}
