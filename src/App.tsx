const App = () => {
	return (
    <nav className="border-b flex place-items-center">
      <div className="mx-auto px-6 py-4">
        <div className="flex gap-4">
					<button className={`px-4 py-2 rounded font-bold border ${ location.pathname === '/' ? 'bg-blue-400 text-white' : 'bg-white'}`}>
						Inventory
					</button>
					<button className={`px-4 py-2 rounded font-bold border ${ location.pathname === '/categories' ? 'bg-blue-400 text-white' : 'bg-white'}`}>
						Categories
					</button>
        </div>
      </div>
    </nav>
  );
};

export default App;
