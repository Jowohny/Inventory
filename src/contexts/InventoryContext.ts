import { db } from "../config/firebase-config";
import React, { useContext, createContext, useEffect, useState } from "react";
import type { Container, Category } from "../interface";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

interface InventoryContextType {
  containers: Container[];
  categories: Category[];
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider = ({children}: {children: React.ReactNode}) => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() =>{
    const containerQuery = query(collection(db, 'containers'), orderBy("name"))
    const categoryQuery = query(collection(db, 'categories'))

    const unsubContainers = onSnapshot(containerQuery, (snapshot) => {
      const list = snapshot.docs.map(containerDoc => {
        const data = containerDoc.data();
        return { id: containerDoc.id, name: data.name, items: data.items ?? [] } as Container;
      });
      setContainers(list);
    });

    const unsubCategories = onSnapshot(categoryQuery, (snapshot) => {
      const list = snapshot.docs.map(categoryDoc => {
        const data = categoryDoc.data();
        return {
          id: data.id ?? categoryDoc.id,
          docId: categoryDoc.id,
          brand: data.brand,
          style: data.style,
          size: data.size,
        } as Category;
      });
      setCategories(list);
    });

    return () => {
      unsubCategories();
      unsubContainers();
    }
  }, [])

  return React.createElement(
    InventoryContext.Provider,
    { value: { containers, categories } },
    children
  );
}

export const useInventory = () => {
  return useContext(InventoryContext) as InventoryContextType;
};
