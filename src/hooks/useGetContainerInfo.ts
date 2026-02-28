import { collection, orderBy, getDoc, query, doc, getDocs } from "firebase/firestore";
import { db } from "../config/firebase-config";

export const useGetContainerInfo = () => {
	const containerRef = collection(db, "containers");

	const getDBContainers = async () => {
		const q = query(containerRef, orderBy('name', 'asc'))
		const snapshot = await getDocs(q)

		const list = snapshot.docs.map(doc => ({
			id: doc.data().id,
			name: doc.data().name,
			items: doc.data().items
		}))

		return list;
	}

	const getDBContainerFromId = async (id: string) => {
		const containerDoc = doc(db, 'containers', id)
		const docSnapshot = await getDoc(containerDoc);

		if (docSnapshot.exists()) {
			return {
				id: docSnapshot.id,
				name: docSnapshot.data().name,
				items: docSnapshot.data().items
			};		
		} else {
			return null;
		}
	}

	return { getDBContainers, getDBContainerFromId };
};
