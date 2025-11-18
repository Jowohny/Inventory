import { collection, endAt, onSnapshot, orderBy, query, startAt } from "firebase/firestore"
import { db } from "../config/firebase-config";
import type { Audit } from "../interface";

export const useGetAuditLogInfo = () => {
	const auditLogRef = collection(db, 'audit logs');

	const getAuditLogs = async (nameFilter: string, onUpdate: (auditLogs: Audit[]) => void ) => {
		let q;
		
		if (nameFilter) {
			q = query(
				auditLogRef,
				orderBy('name'),
				startAt(nameFilter),
				endAt(nameFilter + '\uf8ff')
			) 
		} else {
			q = query(auditLogRef)
		}

		const unsubscribe = onSnapshot(q, (snapshot) => {
			const list = snapshot.docs.map((doc) => ({
				message: doc.data().message,
				time: doc.data().time,
				user: doc.data().user
			}))

			onUpdate(list)
		})
	}
}