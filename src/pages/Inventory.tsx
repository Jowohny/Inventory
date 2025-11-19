import { useState, useEffect, useMemo} from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import type { Container, Item, Category } from '../interface';
import { useGetCurrentUser } from '../hooks/useGetCurrentUser';
import { useSetContainerInfo } from '../hooks/useSetContainerInfo';
import { useSetAuditLogInfo } from '../hooks/useSetAuditLogInfo';
import { useGetCategoryInfo } from '../hooks/useGetCategoryInfo'
import { useGetContainerInfo } from '../hooks/useGetContainerInfo'
import { useSetItemInfo } from '../hooks/useSetItemInfo';

const Inventory = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newContainerName, setNewContainerName] = useState('');
  const [addingItemTo, setAddingItemTo] = useState<string | null>(null);
	const [openTotal, setOpenTotal] = useState<boolean>(false)
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
	const [filterBrand, setFilterBrand] = useState('');
  const [filterStyle, setFilterStyle] = useState('');
  const [filterSize, setFilterSize] = useState('');
	const [quantity, setQuantity] = useState('1');
	const [unsure, setUnsure] = useState(false);
	const [editingQuantity, setEditingQuantity] = useState<string | null>(null);
	const [editingQuantityValue, setEditingQuantityValue] = useState<string>('');
	const [containerSearch, setContainerSearch] = useState<string>('');
	const [inventoryDisplay, setInventoryDisplay] = useState<{ categoryId: string; qty: number; name: string }[]>([]);
	const [itemCategories, setItemCategories] = useState<Record<string, Category | null>>({});
	const { username, isAuth } = useGetCurrentUser();
	const { addDBAudit } = useSetAuditLogInfo();
	const { addDBContainer, deleteDBContainer, clearDBContainers } = useSetContainerInfo();
	const { getDBContainerFromId } = useGetContainerInfo()
	const { getDBCategories, getDBCategoryFromId }  = useGetCategoryInfo();
	const { getDBContainers } = useGetContainerInfo();
	const { addItemToContainer, deleteItemFromContainer, adjustItemQuantityFromContainer } = useSetItemInfo();
	const upperUsername = username ? username.toUpperCase() : "";
	const navigate = useNavigate();

  useEffect(() => {
		if (!isAuth) {
			navigate('/');
		}

	  const loadCategories = getDBCategories((updatedCategories) => {
			setCategories(updatedCategories)
		});

		return () => loadCategories();
  }, []);

	useEffect(() => {
		if (categories.length === 0) return;
	
		let unsubscribe: (() => void) | null = null;
	
		const load = () => {
			unsubscribe = getDBContainers (
				containerSearch,
				filterBrand,
				filterStyle,
				filterSize,
				categories,      
				(updated) => setContainers(updated)
			);
		};
	
		load();
	
		return () => {
			if (unsubscribe) unsubscribe();
		};
	}, [containerSearch, filterBrand, filterStyle, filterSize, categories]);

	useEffect(() => {
    const load = async () => {
        const allItems = containers.flatMap(c => c.items);
        
        const result: Record<string, Category | null> = {};
        for (const item of allItems) {
            result[item.id] = await getDBCategoryFromId(item.categoryId);
        }

        setItemCategories(result);
    };

    if (containers.length === 0) return;
		
		load();
}, [containers]);


	const totalInventory = useMemo(() => {
		const groups: { [categoryId: string]: number } = {};
		containers.forEach((container) => {
			container.items.forEach((item) => {
				groups[item.categoryId] = (groups[item.categoryId] ?? 0) + item.quantity;
			});
		});
		return groups;
	}, [containers]);

	useEffect(() => {
		const load = async () => {
			const entries = Object.entries(totalInventory);

			const results = await Promise.all(
				entries.map(async ([categoryId, qty]) => {
					const cat = await getDBCategoryFromId(categoryId);
					if (!cat) return null;

					return {
						categoryId,
						qty,
						name: `${cat.brand} ${cat.style} ${cat.size}`.trim(),
					};
				})
			);

			setInventoryDisplay(
				results
					.filter((r): r is { categoryId: string; qty: number; name: string } => r !== null)
					.sort((a, b) => a.name.localeCompare(b.name))
			);
		};

		load();
	}, [totalInventory]);

	const onLogout = () => {
		localStorage.removeItem('userInfo')
		navigate('/')
	}

  const addContainer = async () => {
    if (!newContainerName.trim()) return;

    const isDuplicate = containers.some(
      c => c.name.toLowerCase() === newContainerName.trim().toLowerCase()
    );

    if (isDuplicate) {
      alert('A container with this name already exists!');
      return;
    }

		await addDBContainer(Date.now().toString(), newContainerName.trim(), []);
		await addDBAudit(
			`${username} added a container. (${newContainerName.trim()})`,
			username,
			new Date(Date.now())
		);

		setNewContainerName('');
  };

  const deleteContainer = async (id: string) => {
		await deleteDBContainer(id);

		const containerDeleted = containers.find(c => c.id === id);

		await addDBAudit(
			`${username} deleted a container. (${containerDeleted!.name.trim()})`,
			username,
			new Date(Date.now())
		);
  };

	const addItem = async (containerId: string) => {
    if (!selectedBrand || !selectedStyle || !selectedSize || !quantity) return;

    const category = categories.find(
      (c) =>
        c.brand === selectedBrand &&
        c.style === selectedStyle &&
        c.size === selectedSize
    );

    const itemContainer = containers.find((c) => c.id === containerId);
    if (!itemContainer || !category) return;


    const existingItem = itemContainer.items.find(
      (i) => i.categoryId === category.id
    );

    const incrementBy = parseInt(quantity);

    if (existingItem) {
      await adjustItemQuantityFromContainer(containerId, existingItem.id, incrementBy)
    } else {
      const newItem: Item = {
        id: Date.now().toString(),
        categoryId: category.id,
        quantity: incrementBy,
      };

			await addItemToContainer(containerId, newItem)
    }

		await addDBAudit(
			`${username} added ${incrementBy} of '${category.size} ${category.brand} ${category.style}'. (${itemContainer.name})`,
			username,
			new Date(Date.now())
		);
		
    setAddingItemTo(null);
    setSelectedBrand('');
    setSelectedStyle('');
    setSelectedSize('');
    setQuantity('1');
  };

  const deleteItem = async (containerId: string, itemId: string) => {
		const itemContainer = await getDBContainerFromId(containerId)
		if (!itemContainer) return;

		const itemDeleted: Item = itemContainer.items.find((c: Item) => c.id == itemId)
		if (!itemDeleted) return;

		const category = await getDBCategoryFromId(itemDeleted.categoryId);
		if (!category) return;

		await deleteItemFromContainer(containerId, itemId)

		await addDBAudit(
			`${username} deleted ${category.size} ${category.brand} ${category.style} from a container. (${itemContainer!.name})`,
			username,
			new Date(Date.now())
		)
	};

	const updateItemQuantity = async (containerId: string, itemId: string, newQuantity: number) => {
		const itemContainer = await getDBContainerFromId(containerId)
		if (!itemContainer) return;

		const item = itemContainer.items.find((i: Item) => i.id === itemId);
		if (!item) return;

		const results = await adjustItemQuantityFromContainer(itemContainer.id, item.id, newQuantity)

		const category = await getDBCategoryFromId(item.categoryId)

		if (!category || !results) return

		if (results.newAmount === results.oldAmount) {
			setEditingQuantity(null);
			return;
		} else if (results!.difference < 0) {
			await addDBAudit(
				`${username} removed ${-results.difference} from '${category.size} ${category.brand} ${category.style}'. (${results.oldAmount} -> ${results.newAmount}) (${itemContainer.name})`,
				username,
				new Date(Date.now())
			);
		} else {
			await addDBAudit(
				`${username} added ${results.difference} to '${category.size} ${category.brand} ${category.style}'. (${results.oldAmount} -> ${results.newAmount}) (${itemContainer.name})`,
				username,
				new Date(Date.now())
			);
		}
		setEditingQuantity(null);
	};

	const startEditQuantity = (itemId: string, currentQuantity: number) => {
		setEditingQuantity(itemId);
		setEditingQuantityValue(currentQuantity.toString());
	};

	const saveQuantity = (containerId: string, itemId: string) => {
		const numValue = parseInt(editingQuantityValue);
		if (!isNaN(numValue) && numValue >= 0) {
			updateItemQuantity(containerId, itemId, numValue);
		}
	};

	const cancelEditQuantity = () => {
		setEditingQuantity(null);
		setEditingQuantityValue('');
	};

	const clearContainers = async () => {
		if (!unsure) {
			alert('Are you sure you want to clear all containers? \nIf so, press Clear All Containers again.');
			setUnsure(true);
			return;
		}

		await clearDBContainers();

		await addDBAudit(
			`${username} cleared all containers.`,
			username,
			new Date(Date.now())
		);

		setUnsure(false);
	};

  const getBrands = () => {
    const brands = categories.map(c => c.brand);
    return [...new Set(brands)];
  };

  const getStylesForBrand = (brand: string) => {
    const styles = categories.filter(c => c.brand === brand).map(c => c.style);
    return [...new Set(styles)];
  };

  const getSizesForBrandAndStyle = (brand: string, style: string) => {
		const sizes = categories.filter(c => c.brand === brand && c.style === style).map(c => c.size)
    return [...new Set(sizes)];
  };

	return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl text-center font-bold text-gray-900 mb-6">
          Inventory Tracker
        </h1>
				<h1 className="block mx-auto px-4 py-2 text-center text-2xl font-bold text-black mb-6 flex gap-4 justify-center content-center">
					{ upperUsername }
					<button onClick={onLogout} className='text-center flex border rounded-lg px-2 py-1 text-lg bg-gray-300'>
						Logout
					</button>
				</h1>

        <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Add New Container
          </h2>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={newContainerName}
              onChange={(e) => setNewContainerName(e.target.value)}
              placeholder="Input your new container's name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
            <button
              onClick={addContainer}
              className="w-full px-5 py-2 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors">
              Add Container
            </button>
          </div>
        </div>

				<div className='bg-white border border-gray-200 rounded-xl shadow-md mb-6 px-4 py-3 flex flex-col justify-center'>
					<h1 className='block text-center mb-2 text-3xl tracking-wide font-semibold'>Filter By:</h1>				
					<div className='block w-full flex mb-3'>
						<label className='text-lg font-medium mr-4'>Search Containers: </label>
						<input
							type="text"
							value={containerSearch}
							onChange={(e) => setContainerSearch(e.target.value)}
							placeholder='Search among existing containers...'
							className='px-2 py-1 rounded-lg border border-gray-200 flex-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm'/>
					</div>
					<div className='ml-4 block flex space-x-2 flex-row'>
						<select
							value={filterBrand}
							onChange={(e) => { setFilterBrand(e.target.value) }}
							className="w-full p-2 border border-gray-400 rounded-lg shadow-sm bg-white focus:ring-blue-500 focus:border-blue-500">
							<option value="">All Brands</option>
							{getBrands().map((brand) => (
								<option key={brand} value={brand}>
									{brand}
								</option>
							))}
						</select>
						<select
							value={filterStyle}
							onChange={(e) => { setFilterStyle(e.target.value) }}
							className="w-full p-2 border border-gray-400 rounded-lg shadow-sm bg-white focus:ring-blue-500 focus:border-blue-500">
							<option value="">
								{filterBrand ? `${filterBrand} styles` : 'Select brand'}
							</option>
							{getStylesForBrand(filterBrand).map((style) => (
								<option key={style} value={style}>
									{style}
								</option>
							))}
						</select>
						<select
							value={filterSize}
							onChange={(e) => { setFilterSize(e.target.value) }}
							className="w-full p-2 border border-gray-400 rounded-lg shadow-sm bg-white focus:ring-blue-500 focus:border-blue-500">
							<option value="">
								{filterBrand ? (
									filterStyle ? `${filterBrand} & ${filterStyle} sizes` : `Select style`
									) : (
										'Select brand'
									)}
							</option>
							{getSizesForBrandAndStyle(filterBrand, filterStyle).map((size) => (
								<option key={size} value={size}>
									{size}
								</option>
							))}
						</select>												
					</div>
				</div>
				
				<div className="bg-white border border-gray-200 rounded-xl shadow-md mb-6">
					<button
						onClick={() => setOpenTotal(!openTotal)}
						className="w-full flex justify-between items-center text-left p-4 hover:bg-gray-50 rounded-xl transition-colors">
							<span className="font-semibold text-lg text-gray-800">Total Inventory</span>
							<img src="/down.png" className='h-4 w-4 rounded-full'/>
						</button>
					{openTotal && (
						<div className="px-4 pb-4">
							<div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
								<span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
									<p className="text-gray-800 font-bold">Types:</p>
									{Object.keys(totalInventory).length}
								</span>
								<span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
									<p className="font-bold text-gray-800">Total Qty:</p>
									{Object.values(totalInventory).reduce((a, b) => a + b, 0)}
								</span>
							</div>
							<div className="divide-y divide-gray-200 rounded-lg border border-gray-100">
								{inventoryDisplay.map(({ categoryId, qty, name }) => (
									<div key={categoryId} className="flex items-center justify-between bg-white px-3 py-2">
										<span className="text-sm text-gray-800">{name}</span>
										<span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
											Qty: {qty}
										</span>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

        {containers.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <p className="text-gray-500 text-lg">
              There are currently no containers...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {containers.map((container) => (
              <div
                key={container.id}
                className="bg-white shadow-md border border-gray-200 rounded-xl p-6 flex flex-col transition-all hover:shadow-xl hover:scale-101 duration-300">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-semibold text-gray-800">
                    {container.name}
                  </h3>
                  <button
                    onClick={() => deleteContainer(container.id)}
                    className="flex-shrink-0 bg-red-500 rounded-full p-2 hover:bg-red-700 transition-colors">
                    <img src="/delete.png" className="h-5 w-5" alt="Delete"/>
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  {container.items.map( (item) => {
                    const cat = itemCategories[item.id];
                    return (
                      <div
                        key={item.id}
                        className="flex justify-between items-center bg-gray-100 p-3 hover:bg-gray-200 transition-all duration-300 rounded-md">
                        <div className="text-sm flex-1">
                          <span className="font-medium text-gray-800">
													{cat ? `${cat.brand} - ${cat.style} - ${cat.size}` : "Loading..."}
                          </span>
                          <span className="ml-3 text-gray-500">
														Qty: {item.quantity}
													</span>
                        </div>
                        <div className="flex gap-2 items-center">
													{editingQuantity === item.id ? (
														<div>
															<input 
																type="number"
																min="0"
																value={editingQuantityValue}
																onChange={(e) => setEditingQuantityValue(e.target.value)}
																className="w-20 px-2 py-1 ml-2 border border-blue-500 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700"
															/>
															<button
																onClick={() => saveQuantity(container.id, item.id)}
																className="px-3 py-1 ml-2 rounded-md text-sm bg-green-500 text-white font-medium hover:bg-green-600">
																Save
															</button>
															<button
																onClick={cancelEditQuantity}
																className="px-3 py-1 ml-2 rounded-md text-sm bg-gray-500 text-white font-medium hover:bg-gray-600">
																Cancel
															</button>
														</div>
													) : (
														<div>
															<button
																onClick={() => startEditQuantity(item.id, item.quantity)}
																className="px-3 py-1 ml-2 rounded-md text-sm bg-blue-500 text-white font-medium hover:bg-blue-600">
																Edit
															</button>
															<button
																onClick={() => deleteItem(container.id, item.id)}
																className="px-3 py-1 ml-2 rounded-md text-sm bg-pink-300 font-bold text-pink-800 hover:bg-pink-500">
																-
															</button>
														</div>
													)}
												</div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex-grow" />

                {addingItemTo === container.id ? (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Brand
                      </label>
                      <select
                        value={selectedBrand}
                        onChange={(e) => {
                          setSelectedBrand(e.target.value);
                          setSelectedStyle('');
                          setSelectedSize('');
                        }}

                        className="w-full p-2 border border-gray-400 rounded-lg shadow-sm bg-white focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Choose brand...</option>
                        {getBrands().map((brand) => (
                          <option key={brand} value={brand}>
                            {brand}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedBrand && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Style
                        </label>
                        <select
                          value={selectedStyle}
                          onChange={(e) => {
                            setSelectedStyle(e.target.value);
                            setSelectedSize('');
                          }}
                          className="w-full p-2 border border-gray-400 rounded-lg shadow-sm bg-white focus:ring-blue-500 focus:border-blue-500">
                          <option value="">Choose style...</option>
                          {getStylesForBrand(selectedBrand).map((style) => (
                            <option key={style} value={style}>
                              {style}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {selectedBrand && selectedStyle && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Size
                        </label>
                        <select
                          value={selectedSize}
                          onChange={(e) => setSelectedSize(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg shadow-sm bg-white focus:ring-blue-500 focus:border-blue-500">
                          <option value="">Choose size...</option>
                          {getSizesForBrandAndStyle(
                            selectedBrand,
                            selectedStyle
                          ).map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

										{selectedBrand && selectedStyle && selectedSize && (
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Quantity
												</label>
												<input
													type="number"
													min="1"
													value={quantity}
													onChange={(e) => setQuantity(e.target.value)}
													className="w-full p-2 border border-gray-300 rounded-lg shadow-sm bg-white focus:ring-blue-500 focus:border-blue-500"/>
											</div>
										)}

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => addItem(container.id)}
                        className="px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700">
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setAddingItemTo(null);
                          setSelectedBrand('');
                          setSelectedStyle('');
                          setSelectedSize('');
                        }}
                        className="px-4 py-2 rounded-lg font-medium bg-gray-500 text-white hover:bg-gray-600">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingItemTo(container.id)}
                    className="w-full mt-4 px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                    Add Item
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 flex flex-col items-center gap-4">
          <button
            onClick={clearContainers}
            className="w-full px-6 py-3 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors">
            Clear All Containers
          </button>
          <NavLink to="/categories" className="w-full">
            <span className="block w-full text-center px-6 py-3 rounded-lg font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors">
              Add Categories
            </span>
          </NavLink>
          <NavLink to="/auditlogs" className="w-full">
            <span className="block w-full text-center px-6 py-3 rounded-lg font-semibold text-white bg-gray-700 hover:bg-gray-800 transition-colors">
              View Audit Logs
            </span>
          </NavLink>
        </div>
      </div>
    </div>
	);
};

export default Inventory;
