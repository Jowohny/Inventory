import { doc, getDoc, updateDoc } from "firebase/firestore";
import type { Item } from "../storage";
import { db } from "../config/firebase-config";

export const useSetItemInfo = () => {

	const addItemToContainer = async (containerID: string, item: Item) => {
		const containerDoc = doc(db, 'containers', containerID);
		const docSnapshot = await getDoc(containerDoc);
		if (docSnapshot.exists()) {
			const itemList = [...(docSnapshot.data().items || []), item];
			await updateDoc(containerDoc, { items: itemList });
			return {
				id: containerID,
				name: docSnapshot.data().name,
				items: itemList
			};
		} else {
			return null;
		}
	}

	const deleteItemFromContainer = async (containerID: string, itemID: string) => {
		const containerDoc = doc(db, 'containers', containerID);
		const docSnapshot = await getDoc(containerDoc);

		if (docSnapshot.exists()) {
			const itemList = (docSnapshot.data().items || []).map((item: Item) => item.id !== itemID);

			if (itemList.length === 0) {
				await updateDoc(containerDoc, {items: itemList});
				return {
					id: containerID,
					name: docSnapshot.data().name,
					items: itemList
				};
			} else {
				await updateDoc(containerDoc, { items: [] });
				return {
					id: containerID,
					name: docSnapshot.data().name,
					items: []
				};
			}			

		} else {
			return null;
		}
	}

	const adjustItemQuantityFromContainer = async (containerID: string, itemID: string, quantity: number) => {
    const containerDoc = doc(db, "containers", containerID);
    const docSnapshot = await getDoc(containerDoc);

    if (docSnapshot.exists()) {
			const data = docSnapshot.data();
			const items: Item[] = data.items || [];

			const index = items.findIndex(item => item.id === itemID);

			const previousQuantity = items[index].quantity;

			const updatedItems = [...items];
			updatedItems[index] = {
					...updatedItems[index],
					quantity: quantity,
			};

			await updateDoc(containerDoc, {
					items: updatedItems,
			});

			return {
					difference: quantity - previousQuantity,
					updatedItem: updatedItems[index],
					items: updatedItems,
			};
		} else {
			return null;
		}
};


	return { addItemToContainer, deleteItemFromContainer, adjustItemQuantityFromContainer };
}
