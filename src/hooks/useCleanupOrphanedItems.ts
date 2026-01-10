import { useCallback } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase-config';
import type { Category, Item } from '../interface';

export const useCleanupOrphanedItems = () => {
	const cleanupOrphanedItems = useCallback(async (categories: Category[]) => {
		if (categories.length === 0) return;
		
		const containerRef = collection(db, 'containers');
		const containersSnapshot = await getDocs(containerRef);
		
		const validCategoryIds = new Set(categories.map(cat => cat.id));
		
		
		for (const containerDoc of containersSnapshot.docs) {
			const containerData = containerDoc.data();
			const items: Item[] = containerData.items || [];
			
			const validItems = items.filter(item => validCategoryIds.has(item.categoryId));
			
			if (validItems.length !== items.length) {
				const containerDocRef = doc(db, 'containers', containerDoc.id);
				await updateDoc(containerDocRef, { items: validItems });
			}
		}
		
	}, []);

	return { cleanupOrphanedItems };
};

