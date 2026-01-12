import { collection, getDocs, orderBy, query, where } from "firebase/firestore"
import { db } from "../config/firebase-config";
import type { Audit } from "../interface";

export const useGetAuditLogInfo = () => {
	const auditLogRef = collection(db, 'audit logs');

	const getDBAuditLogs = async (nameFilter: string): Promise<Audit[]> => {
		let q;
		
		if (nameFilter) {
			q = query(
				auditLogRef,
				where('user', '==', nameFilter),
				orderBy('time', 'desc')
			);
		} else {
			q = query(
				auditLogRef,
				orderBy('time', 'desc')
			);
		}

		const snapshot = await getDocs(q);
		const list = snapshot.docs.map((doc) => ({
			message: doc.data().message,
			time: doc.data().time.toDate(),
			user: doc.data().user
		}));

		return list;
	}

	const getUniqueUsers = async (): Promise<string[]> => {
		const q = query(auditLogRef);
		const snapshot = await getDocs(q);
	
		const uniqueUsers = new Set<string>();
		snapshot.docs.forEach((doc) => {
			uniqueUsers.add(doc.data().user);
		});
	
		return [...uniqueUsers];
	};
	

	return { getDBAuditLogs, getUniqueUsers };
}