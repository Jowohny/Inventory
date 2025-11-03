import { useEffect, useState } from "react"
import { storage } from "../storage"
import type { Audit } from "../storage"
import { NavLink } from "react-router-dom"

const AuditLogs = () => {
	const [auditLogs, setAuditLogs] = useState<Audit[]>([]);
	const [unsure, setUnsure] = useState<boolean>(false);
	const [username, setUsername] = useState<string>('');
	const [currentPage, setCurrentPage] = useState<number>(0);
	const [currentPaginate, setCurrentPaginate] = useState<Audit[]>([]);
	const [maxPages, setMaxPages] = useState<number>(0);
	const [userFilter, setUserFilter] = useState<string>('');
	const paginCount: number = 8;

	useEffect(() => {
		setUsername(storage.getLastUser());
		setAuditLogs(storage.getAudits().reverse())
	}, [])

	useEffect(() => {
		let filterUser: Audit[] = [];
		if (userFilter !== '') {
			filterUser = auditLogs.filter(c => c.user === userFilter);
			if (Math.ceil(filterUser.length/paginCount) < maxPages) {
				setCurrentPage(Math.ceil(filterUser.length/paginCount)-1)
			}
		} else {
			filterUser = auditLogs;
		}
		const pageItems: Audit[] = [];
		const totalPages = Math.ceil(filterUser.length/paginCount);
		setMaxPages(totalPages);

		for (let i: number = currentPage * paginCount; i < (currentPage * paginCount) + paginCount; i++) {
			if (filterUser[i]) {
				pageItems.push(filterUser[i]);
			} else {
				break;
			}
		}
		setCurrentPaginate(pageItems);
	}, [auditLogs, currentPage, userFilter])

	const paginate = (direction: string) => {
		if (direction === 'previous' && currentPage > 0) {
			setCurrentPage(currentPage - 1)
		} else if (direction === 'next' && currentPage < maxPages - 1) {
			setCurrentPage(currentPage + 1)
		}
	}

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

	const getUsers = () => {
		const users = auditLogs.map(c => c.user)
		return [...new Set(users)]
	}

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl text-center font-bold text-gray-900 mb-6">
          Audit Logs
        </h1>
        <input
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            storage.saveLastUser(e.target.value);
          }}
          placeholder="Enter Username"
          className="block w-full max-w-xs mx-auto px-4 py-2 text-center bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 mb-6"/>
				<div className="bg-slate-200 justify-around flex flex-col p-4 mb-2 rounded-lg">
					<h1 className="text-2xl font-semibold text-center tracking-wide block flex-1">
						Filter By:
					</h1>
					<span>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Name:
						</label>
						<select
							value={userFilter}
							onChange={(e) => { setUserFilter(e.target.value) }}

							className="w-full p-2 border border-gray-400 rounded-lg shadow-sm bg-white focus:ring-blue-500 focus:border-blue-500">
							<option value="">Choose user...</option>
							{getUsers().map((user) => (
								<option key={user} value={user}>
									{user}
								</option>
							))}
						</select>
					</span>
				</div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
          {auditLogs.length === 0 ? (
            <p className="text-gray-500 text-lg text-center p-6">
              No audit logs found...
            </p>
          ) : (
            <>
              <div className="space-y-2">
                {currentPaginate.map((audit, index) => (
                  <div key={index} className="bg-gray-100 p-3 rounded-md hover:bg-gray-300 hover:scale-102 duration-300">
                    <p className="font-medium text-gray-800 text-sm">
                      {audit.message}
                    </p>
                    <p className="text-gray-600 text-xs mt-1">
                      {audit.time.toLocaleDateString()}{' '}
                      {audit.time.toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
              {maxPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => paginate('previous')}
                    disabled={currentPage === 0}
                    className={`px-4 py-2 rounded-lg font-medium ${ currentPage === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600' }`}>
                    Previous
                  </button>
                  <span className="text-gray-600 text-sm">
                    Page {currentPage + 1} of {maxPages}
                  </span>
                  <button
                    onClick={() => paginate('next')}
                    disabled={currentPage >= maxPages - 1}
                    className={`px-4 py-2 rounded-lg font-medium ${ currentPage >= maxPages - 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600' }`}>
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <button
            onClick={clearAudits}
            className="w-full px-6 py-3 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors">
            Clear All Audits
          </button>
          <NavLink to="/" className="w-full">
            <span className="block w-full text-center px-6 py-3 rounded-lg font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors">
              View Inventory
            </span>
          </NavLink>
          <NavLink to="/categories" className="w-full">
            <span className="block w-full text-center px-6 py-3 rounded-lg font-semibold text-white bg-gray-700 hover:bg-gray-800 transition-colors">
              Add Categories
            </span>
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default AuditLogs;