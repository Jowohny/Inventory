import { useEffect, useState } from "react"
import { storage } from "../storage"
import type { Audit } from "../storage"
import { NavLink } from "react-router-dom"

const AuditLogs = () => {
	const [auditLogs, setAuditLogs] = useState<Audit[]>([])
	const [unsure, setUnsure] = useState<boolean>(false)
	const [username, setUsername] = useState<string>('')

	useEffect(() => {
		setAuditLogs(storage.getAudits().reverse())
		setUsername(storage.getLastUser())
	}, [])

	const clearAudits = () => {
		if (username.length === 0) {
			alert("Please enter a username before you make any changes...");
			return;
		}
		if (!unsure) {
			alert('Are you sure you want to clear all audits? \nIf so, then press Clear All Audits again');
			setUnsure(true);
			return;
		} else {
			const newAudit: Audit = {
				message: username + " cleared all audits.",
				user: username,
				time: new Date(Date.now())
			};
			setAuditLogs([newAudit]);
			storage.saveAudits([newAudit]);
			setUnsure(false);
		}
	}

	return (
		<div className="min-h-screen min-w-fit">
				<input               
					type="text"
					value={username}
					onChange={(e) => { setUsername(e.target.value); storage.saveLastUser(e.target.value); }}
					placeholder="Enter Username"
					className="block flex place-self-center px-2 py-1 text-center bg-background border mx-auto rounded-md mb-4"/>
			<div className="m-8 border min-h-screen rounded-xl shadow-lg">
				<h1 className="block font-bold text-3xl mx-2 mt-2 text-center tracking-wide border-b-1">
					AUDIT LOGS
				</h1>
				{ auditLogs ? (
					auditLogs.map((audit, index) => (
						<div key={index} className="flex justify-between mx-4 py-2 border-b">
							<span className="text-start text-xl font-thin">{audit.message}</span>
							<span className="text-end text-lg font-thin">{audit.time.toLocaleDateString()} {audit.time.toLocaleTimeString()}</span>
						</div>
					))
				) : (
					<div></div>
				)}
			</div>
			<button onClick={clearAudits} className='flex-1 border bg-red-600 text-lg font-semibold text-white px-3 py-2 rounded-xl block mx-auto mb-2'>Clear All Audits</button>
			<NavLink to="/categories">
				<button className='flex-1 border bg-blue-400 text-lg font-semibold text-white px-3 py-2 rounded-xl block mx-auto mb-2'>Add Categories</button>
			</NavLink>
			<NavLink to="/">
				<button className='border bg-blue-400 text-lg font-semibold text-white px-3 py-2 rounded-xl block mx-auto mb-2 flex-1'>View Inventory</button>
			</NavLink>
		</div>
	)
}

export default AuditLogs