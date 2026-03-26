import { useCallback } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase-config';
import type { Category, Container } from '../interface';

export const useCleanupOrphanedItems = () => {

	const cleanupOrphanedItems = useCallback(async (categories: Category[], containers: Container[]) => {
		if (categories.length === 0 || containers.length === 0) return;
		
		const totalValidCategories = new Set(categories.map(cat => cat.id));

		for (const container of containers) {
			const items = container.items || [];
			const validItems = items.filter(item => totalValidCategories.has(item.categoryId));

			if (validItems.length !== items.length) {
				const containerDoc = doc(db, 'containers', container.id);
				await updateDoc(containerDoc, { items: validItems });
			}
		}
	}, []);

	return { cleanupOrphanedItems };
};

