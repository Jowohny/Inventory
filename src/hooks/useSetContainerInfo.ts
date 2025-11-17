import { addDoc, collection, deleteDoc, doc, getDoc, getDocs } from "firebase/firestore";
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
		const docSnapshot = await getDoc(containerDoc);

		if (docSnapshot.exists()) {
			await deleteDoc(docSnapshot.ref);
		}
	}

	const clearDBContainers = async () => {
		const snapshot = await getDocs(containerRef)

		snapshot.forEach(async (snap) => { await deleteDoc(snap.ref) })
	}


	return { addDBContainer, deleteDBContainer, clearDBContainers };
}

