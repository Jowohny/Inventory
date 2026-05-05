import Inventory from "./pages/Inventory";
import Categories from "./pages/Categories";
import AuditLogs from "./pages/AuditLogs";
import Login from "./pages/Login"
import { InventoryProvider } from "./contexts/InventoryContext";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useGetCurrentUser } from "./hooks/useGetCurrentUser";

const InventoryDataRoutes = () => {
	const { isAuth } = useGetCurrentUser();

	if (!isAuth) {
		return <Navigate to="/" replace />;
	}

	return (
		<InventoryProvider>
			<Outlet />
		</InventoryProvider>
	);
}

const App = () => {
	return (
		<>
			<div className="flex justify-center round-full">
				<img className="w-3/4 md:w-1/4 rounded-full" src="/logo.jpg"/>
			</div>
			<Routes>
				<Route path='/' element={<Login />}/>
				<Route element={<InventoryDataRoutes />}>
					<Route path='/inventory' element={<Inventory />}/>
					<Route path='/categories' element={<Categories />}/>
				</Route>
				<Route path='/auditlogs' element={<AuditLogs />}/>
			</Routes>
		</>
	);
}

export default App;
