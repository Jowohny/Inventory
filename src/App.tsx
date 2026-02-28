import Inventory from "./pages/Inventory";
import Categories from "./pages/Categories";
import AuditLogs from "./pages/AuditLogs";
import Login from "./pages/Login"
import { Route, Routes } from "react-router-dom";


const App = () => {
	return (
		<>
			<div className="flex justify-center round-full">
				<img className="w-3/4 md:w-1/4 rounded-full" src="/logo.jpg"/>
			</div>
			<Routes>
				<Route path='/' element={<Login />}/>
				<Route path='/inventory' element={<Inventory />}/>
				<Route path='/categories' element={<Categories />}/>
				<Route path='/auditlogs' element={<AuditLogs />}/>
			</Routes>
		</>
	);
}

export default App;
