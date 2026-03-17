import { collection, getDocs, orderBy, query, where, limit, startAfter, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "../config/firebase-config";
import type { Audit } from "../interface";

export const useGetAuditLogInfo = () => {
	const auditLogRef = collection(db, 'audit logs');

	const getDBAuditLogs = async (nameFilter: string, lastDoc: QueryDocumentSnapshot | null = null) => {
    let q = query(auditLogRef, orderBy('time', 'desc'), limit(10));
    
    if (nameFilter) {
      q = query(q, where('user', '==', nameFilter));
    }

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    
	  const list: Audit[] = snapshot.docs.map((doc) => ({
      message: doc.data().message,
      time: doc.data().time.toDate(),
      user: doc.data().user
    }));

    return {
      list,
      lastVisible: snapshot.docs[snapshot.docs.length - 1]
    };
  }

	return { getDBAuditLogs };
}