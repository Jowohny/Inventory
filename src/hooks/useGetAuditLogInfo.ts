import { collection, getDocs, orderBy, query, limit, startAfter, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "../config/firebase-config";
import type { Audit } from "../interface";
import { useCallback } from "react";

export const useGetAuditLogInfo = () => {
	const getDBAuditLogs = useCallback(async (lastDoc: QueryDocumentSnapshot | null = null) => {
		const auditLogRef = collection(db, 'audit logs');
    let q = query(auditLogRef, orderBy('time', 'desc'), limit(10));

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
	  }, [])

	return { getDBAuditLogs };
}
