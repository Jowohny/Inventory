import { useState, useEffect} from 'react';
import { NavLink } from 'react-router-dom';
import type { Container, Item, Category, Audit } from '../storage';
import { storage } from '../storage'

const Inventory = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
	const [audits, setAudits] = useState<Audit[]>([])
  const [newContainerName, setNewContainerName] = useState('');
  const [addingItemTo, setAddingItemTo] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
	const [quantity, setQuantity] = useState('1');
	const [username, setUsername] = useState('')
	const [unsure, setUnsure] = useState(false)
	const [editingQuantity, setEditingQuantity] = useState<string | null>(null);
	const [editingQuantityValue, setEditingQuantityValue] = useState<string>('');

  useEffect(() => {
    setContainers(storage.getContainers());
    setCategories(storage.getCategories());
		setUsername(storage.getLastUser())
    setAudits(storage.getAudits());
  }, []);

  const addContainer = () => {
		if (username.length === 0) {
			alert("Please enter a username before you make any changes...");
			return;
		}
    if (!newContainerName.trim()) return;

    const isDuplicate = containers.some(
      c => c.name.toLowerCase() === newContainerName.trim().toLowerCase()
    );

    if (isDuplicate) {
      alert('A container with this name already exists!');
      return;
    }

    const newContainer: Container = {
      id: Date.now().toString(),
      name: newContainerName.trim(),
      items: [],
    };

		const newAudit: Audit = {
			message: `${username} added a container. (${newContainer.name})`,
			user: username,
			time: new Date(Date.now())
		}

    const updatedContainers = [...containers, newContainer];
    const updatedAudits = [...audits, newAudit];
    setContainers(updatedContainers);
		setAudits(updatedAudits);
    storage.saveContainers(updatedContainers);
    storage.saveAudits(updatedAudits);
    setNewContainerName('');
  };

  const deleteContainer = (id: string) => {
		if (username.length === 0) {
			alert("Please enter a username before you make any changes...");
			return;
		}

		const containerDeleted = containers.find(c => c.id === id);

		const newAudit: Audit = {
			message: `${username} deleted a container. (${containerDeleted!.name})`,
			user: username,
			time: new Date(Date.now())
		}

		const updateAudits = [...audits, newAudit]
		const containerToDelete = containers.filter(c => c.id !== id);
    setContainers(containerToDelete);
		setAudits(updateAudits)
    storage.saveContainers(containerToDelete);
		storage.saveAudits(updateAudits)
  };

	const addItem = (containerId: string) => {
    if (username.length === 0) {
      alert("Please enter a username before you make any changes...");
      return;
    }
    if (!selectedBrand || !selectedStyle || !selectedSize || !quantity) return;

    const category = categories.find(
      (c) =>
        c.brand === selectedBrand &&
        c.style === selectedStyle &&
        c.size === selectedSize
    );

    if (!category) {
      alert("Could not find a matching category.");
      return;
    }

    const itemContainer = containers.find((c) => c.id === containerId);
    if (!itemContainer) {
			return;
		} 

    const existingItem = itemContainer.items.find(
      (i) => i.categoryId === category.id
    );

    let updatedContainers: Container[];
    const incrementBy = parseInt(quantity);

    if (existingItem) {
      updatedContainers = containers.map((c) =>
        c.id === containerId
          ? {
              ...c,
              items: c.items.map((i) =>
                i.id === existingItem.id
                  ? { ...i, quantity: i.quantity + incrementBy } 
                  : i
              ),
            }
          : c
      );
    } else {
      const newItem: Item = {
        id: Date.now().toString(),
        categoryId: category.id,
        quantity: incrementBy,
      };

      updatedContainers = containers.map((c) =>
        c.id === containerId
          ? {
              ...c,
              items: [...c.items, newItem],
            }
          : c
      );
    }

    const newAudit: Audit = {
      message: `${username} added ${incrementBy} of '${category.size} ${category.brand} ${category.style}'. (${itemContainer.name})`,
      user: username,
      time: new Date(Date.now()),
    };

    const updateAudits = [...audits, newAudit];
    setContainers(updatedContainers);
    setAudits(updateAudits);
    storage.saveContainers(updatedContainers);
    storage.saveAudits(updateAudits);

    setAddingItemTo(null);
    setSelectedBrand('');
    setSelectedStyle('');
    setSelectedSize('');
    setQuantity('1');
  };

  const deleteItem = (containerId: string, itemId: string) => {
		if (username.length === 0) {
			alert("Please enter a username before you make any changes...");
			return;
		}

		const itemContainer = containers.find(c => c.id === containerId)
		const itemDeleted = itemContainer?.items.find(c => c.id == itemId)
		const itemToDelete = containers.map(c =>
      c.id === containerId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c
    );

		const category = getCategoryInfo(itemDeleted!.categoryId);
		const newAudit: Audit = {
			message: `${username} deleted ${category!.size} ${category!.brand} ${category!.style} from a container. (${itemContainer!.name})`,
			user: username,
			time: new Date(Date.now())
		};

		const updatedAudits = [...audits, newAudit];
		setContainers(itemToDelete);
		setAudits(updatedAudits);
		storage.saveContainers(itemToDelete);
		storage.saveAudits(updatedAudits);
	};

	const updateItemQuantity = (containerId: string, itemId: string, newQuantity: number) => {
		if (username.length === 0) {
			alert("Please enter a username before you make any changes...");
			return;
		}

		const itemContainer = containers.find(c => c.id === containerId);
		const item = itemContainer?.items.find(i => i.id === itemId);
		if (!item || !itemContainer) return;

		const oldQuantity = item.quantity;
		if (newQuantity === oldQuantity) {
			setEditingQuantity(null);
			return;
		}

		const category = getCategoryInfo(item.categoryId);
		const updatedContainers = containers.map(c =>
			c.id === containerId ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, quantity: newQuantity }: i)}: c
		);

		const newAudit: Audit = {
			message: `${username} changed quantity of '${category!.size} ${category!.brand} ${category!.style}' from ${oldQuantity} to ${newQuantity}. (${itemContainer.name})`,
			user: username,
			time: new Date(Date.now()),
		};

		const updatedAudits = [...audits, newAudit];
		setContainers(updatedContainers);
		setAudits(updatedAudits);
		storage.saveContainers(updatedContainers);
		storage.saveAudits(updatedAudits);
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

	const clearContainers = () => {
		if (username.length === 0) {
			alert("Please enter a username before you make any changes...");
			return;
		}
		if (!unsure) {
			alert('Are you sure you want to clear all containers? \nIf so, press Clear All Containers again.');
			setUnsure(true);
			return;
		}
		setContainers([]);
		storage.saveContainers([]);
		const newAudit: Audit = {
			message: `${username} cleared all containers.`,
			user: username,
			time: new Date(Date.now()),
		};
		const updatedAudits = [...audits, newAudit];
		setAudits(updatedAudits);
		storage.saveAudits(updatedAudits);
		setUnsure(false);
	};

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId);
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
        <input
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            storage.saveLastUser(e.target.value);
          }}
          placeholder="Enter Username"
          className="block w-full max-w-xs mx-auto px-4 py-2 text-center bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 mb-6"/>

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
                  {container.items.map((item) => {
                    const cat = getCategoryInfo(item.categoryId);
                    return (
                      <div
                        key={item.id}
                        className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                        <div className="text-sm flex-1">
                          <span className="font-medium text-gray-800">
														{cat!.brand} - {cat!.style} - {cat!.size}
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
