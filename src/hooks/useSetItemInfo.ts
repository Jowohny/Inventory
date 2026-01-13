import { doc, updateDoc } from "firebase/firestore";
import type { Item } from "../interface";
import { db } from "../config/firebase-config";

export const useSetItemInfo = () => {

	const addItemToContainer = async (containerID: string, item: Item, currentItems: Item[]) => {
		const containerDoc = doc(db, 'containers', containerID);
		const itemList = [...currentItems, item];
		await updateDoc(containerDoc, { items: itemList });
		return {
			id: containerID,
			items: itemList
		};
	}

	const deleteItemFromContainer = async (containerID: string, itemID: string, currentItems: Item[]) => {
		const containerDoc = doc(db, 'containers', containerID);
		const itemList = currentItems.filter((item: Item) => item.id !== itemID);
		await updateDoc(containerDoc, { items: itemList });
		return {
			id: containerID,
			items: itemList
		};
	}

	const adjustItemQuantityFromContainer = async (containerID: string, itemID: string, quantity: number, currentItems: Item[]) => {
		const containerDoc = doc(db, "containers", containerID);
		const items = [...currentItems];
		const index = items.findIndex(item => item.id === itemID);

		if (index === -1) {
			return null;
		}

		const previousQuantity = items[index].quantity;

		items[index] = { ...items[index], quantity: quantity };

		await updateDoc(containerDoc, {
			items: items,
		});

		return {
			oldAmount: previousQuantity,
			newAmount: quantity,
			difference: quantity - previousQuantity,
			updatedItem: items[index],
			items: items,
		};
	};


	return { addItemToContainer, deleteItemFromContainer, adjustItemQuantityFromContainer };
}
