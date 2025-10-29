import Inventory from "./pages/Inventory";
import Categories from "./pages/Categories";
import AuditLogs from "./pages/AuditLogs";
import { Route, Routes } from "react-router-dom";


const App = () => {
	return (
		<>
			<div className="flex justify-center round-full">
				<img className="w-1/5 rounded-full" src="/logo.jpg"/>
			</div>
			<Routes>
				<Route path='/' element={<Inventory />}/>
				<Route path='/categories' element={<Categories />}/>
				<Route path='/auditlogs' element={<AuditLogs />}/>
			</Routes>
		</>
	);
}

export default App;
