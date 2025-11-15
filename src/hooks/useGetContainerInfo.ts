import { collection, endAt, onSnapshot, orderBy, query, startAt } from "firebase/firestore";
import { db } from "../config/firebase-config";
import type { Container, Category } from "../storage";

export const useGetContainerInfo = () => {
	const containerRef = collection(db, "containers");

	const getDBContainers = (
		nameFilter: string,
		brandFilter: string,
		styleFilter: string,
		sizeFilter: string,
		categories: Category[],           
		onUpdate: (containers: Container[]) => void
	) => {
		let q;

		if (nameFilter) {
			q = query(
				containerRef,
				orderBy("name"),
				startAt(nameFilter),
				endAt(nameFilter + "\uf8ff")
			);
		} else {
			q = query(containerRef);
		}

		const unsubscribe = onSnapshot(q, (snapshot) => {
			let list: Container[] = snapshot.docs.map(doc => ({
				id: doc.id,
				name: doc.data().name,
				items: doc.data().items || []
			}));

			if (brandFilter || styleFilter || sizeFilter) {
				list = list.filter(container => {
					return container.items.some(item => {
						const category = categories.find(c => c.id === item.categoryId);
						if (!category) return false;

						if (brandFilter && category.brand !== brandFilter) return false;
						if (styleFilter && category.style !== styleFilter) return false;
						if (sizeFilter && category.size !== sizeFilter) return false;

						return true;
					});
				});
			}

			onUpdate(list);
		});

		return unsubscribe;
	};

	return { getDBContainers };
};
