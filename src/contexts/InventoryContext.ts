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
      const list = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name, items: doc.data().items } as Container));
      setContainers(list);
    });

    const unsubCategories = onSnapshot(categoryQuery, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.data().id, brand: doc.data().brand, style: doc.data().style, size: doc.data().size } as Category));
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