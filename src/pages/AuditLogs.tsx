import { useEffect, useRef, useState } from "react"
import type { Audit } from "../interface"
import { NavLink, useNavigate } from "react-router-dom"
import { useSetAuditLogInfo } from "../hooks/useSetAuditLogInfo"
import { useGetAuditLogInfo } from "../hooks/useGetAuditLogInfo"
import { useGetCurrentUser } from "../hooks/useGetCurrentUser"
import { QueryDocumentSnapshot } from "firebase/firestore"

const AuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState<Audit[]>([]);
  const [unsure, setUnsure] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const pageCursors = useRef<(QueryDocumentSnapshot | null)[]>([null]);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [authString, setAuthString] = useState<string>('')
  const { isAuth, username } = useGetCurrentUser()
  const { clearDBAudits, addDBAudit } = useSetAuditLogInfo();
  const { getDBAuditLogs } = useGetAuditLogInfo();
  const upperUsername = username ? username.toUpperCase() : "";
  const navigate = useNavigate();
  const clearString = 'Clear-All-Audits';

  useEffect(() => {
    if (!isAuth) {
      navigate('/');
      return;
    }
  
    let isCurrent = true;

    const loadAuditLogs = async () => {
      const result = await getDBAuditLogs(pageCursors.current[currentPage]);
      if (!isCurrent) return;

      setAuditLogs(result.list);
      setHasNextPage(result.list.length === 10);

      if (result.lastVisible && pageCursors.current.length <= currentPage + 1) {
        pageCursors.current = [...pageCursors.current, result.lastVisible];
      }
    };

    loadAuditLogs();
    return () => {
      isCurrent = false;
    };
  }, [isAuth, currentPage, getDBAuditLogs, navigate]);

  const onLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  }

  const paginate = (direction: string) => {
    if (direction === 'previous' && currentPage > 0) {
      setCurrentPage(currentPage - 1)
    } else if (direction === 'next' && hasNextPage) {
      setCurrentPage(currentPage + 1)
    }
  }

  const clearAudits = async () => {
    if (!unsure) {
      alert('Are you sure you want to clear all audits? \nIf so, then type in Clear All Audits and click the button again.\nReload the page if this was a mistake.');
      setUnsure(true);
      return;
    } else {
      if (authString === clearString) {
        await clearDBAudits();
        await addDBAudit(
          `${username} cleared all audits.`,
          username,
          new Date(Date.now())
        );

        setCurrentPage(0);
        pageCursors.current = [null];
        setUnsure(false);
      } else {
        alert('The input code doesn\'t match. Reload the page if you change your mind.');
      }     
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl text-center font-bold text-gray-900 mb-6">
          Audit Logs
        </h1>
        <h1 className="block mx-auto px-4 py-2 text-center text-2xl font-bold text-black mb-6 flex gap-4 justify-center content-center">
          { upperUsername }
          <button onClick={onLogout} className='text-center flex border rounded-lg px-2 py-1 text-lg bg-gray-300'>
            Logout
          </button>
        </h1>
        <div className="bg-white border border-gray-200 rounded-md shadow-md p-6 hover:shadow-lg duration-200">
          {auditLogs.length === 0 ? (
            <p className="text-gray-500 text-lg text-center p-6">
              No audit logs found...
            </p>
          ) : (
            <>
              <div className="space-y-2">
                {auditLogs.map((audit: Audit, index) => (
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
            </>
          )}
        </div>

				<div className="mt-4 flex items-center justify-between">
					<button
						onClick={() => paginate('previous')}
						disabled={currentPage === 0}
						className={`px-4 py-2 rounded-lg font-medium ${ currentPage === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600' }`}>
						Previous
					</button>
					<span className="text-gray-600 text-sm">
						Page {currentPage + 1}
					</span>
					<button
						onClick={() => paginate('next')}
						disabled={!hasNextPage}
						className={`px-4 py-2 rounded-lg font-medium ${ !hasNextPage ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600' }`}>
						Next
					</button>
				</div>
        <div className="mt-12 flex flex-col items-center gap-4">
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
        <div className='block'>
          <h1 className='text-3xl text-red-500 font-black text-center mt-[50rem] mb-[50rem]'>Danger Zone</h1>
          { unsure && (
            <input  
              onChange={(e) => setAuthString(e.target.value)}
              type="text" 
              value={authString}
              className='w-full px-2 py-1 text-center mb-8 border border-blue-500 text-xl rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700'
              placeholder={clearString}
            />
          )}
          <button
            onClick={clearAudits}
            className="w-full px-6 py-3 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors">
            Clear All Audits
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuditLogs;
