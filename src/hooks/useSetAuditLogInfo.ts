import { addDoc, collection, getDocs, writeBatch } from "firebase/firestore";
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

		for (let i = 0; i < snapshot.docs.length; i += 500) {
			const batch = writeBatch(db);
			snapshot.docs.slice(i, i + 500).forEach((doc) => batch.delete(doc.ref));
			await batch.commit();
		}
	}

	return { addDBAudit, clearDBAudits }
}
