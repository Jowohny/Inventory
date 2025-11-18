import { collection, onSnapshot, query, where } from "firebase/firestore"
import { db } from "../config/firebase-config";
import type { Audit } from "../interface";

export const useGetAuditLogInfo = () => {
	const auditLogRef = collection(db, 'audit logs');

	const getDBAuditLogs = (nameFilter: string, onUpdate: (auditLogs: Audit[]) => void ) => {
		let q;
		
		if (nameFilter) {
			q = query(
				auditLogRef,
				where('user', '==', nameFilter)
			);
		} else {
			q = query(auditLogRef);
		}

		const unsubscribe = onSnapshot(q, (snapshot) => {
			const list = snapshot.docs.map((doc) => ({
				message: doc.data().message,
				time: doc.data().time.toDate(),
				user: doc.data().user
			}));

			onUpdate(list);
		});

		return unsubscribe;
	}

	const getUniqueUsers = (onUpdate: (users: string[]) => void) => {
		const q = query(auditLogRef);
	
		const unsubscribe = onSnapshot(q, (snapshot) => {
			const uniqueUsers = new Set<string>();
	
			snapshot.docs.forEach((doc) => {
				uniqueUsers.add(doc.data().user);
			});
	
			onUpdate([...uniqueUsers]);
		});
	
		return unsubscribe;
	};
	

	return { getDBAuditLogs, getUniqueUsers };
}