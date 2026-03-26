import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../config/firebase-config";
import type { Container } from "../interface";

export const useGetContainerInfo = () => {
  const containerRef = collection(db, "containers");

  const getDBContainers = (         
    onUpdate: (containers: Container[]) => void
  ) => {
    const q = query(containerRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let list: Container[] = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        items: doc.data().items || []
      }));

      onUpdate(list);
    });

    return unsubscribe;
  };

  return { getDBContainers };
};
