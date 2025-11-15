import { addDoc, collection, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "../config/firebase-config";

export const useSetAuditLogInfo = () => {
	const auditLogRef = collection(db, 'audit logs');

	const addDBAudit = async (message: string, user: string, time: Date) => {
		await addDoc(auditLogRef, {
			message,
			user,
			time
		});
	}

	const clearDBAudits = async () => {
		const snapshot = await getDocs(auditLogRef);

		snapshot.forEach((doc) => { deleteDoc(doc.ref) })
	}

	return { addDBAudit, clearDBAudits }
}