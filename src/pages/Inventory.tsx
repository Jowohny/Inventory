import { useState, useEffect} from 'react';
import { NavLink } from 'react-router-dom';
import type { Container, Item, Category } from '../storage';
import { storage } from '../storage'

const Inventory = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newContainerName, setNewContainerName] = useState('');
  const [addingItemTo, setAddingItemTo] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState('1');
	const [username, setUsername] = useState('')

  useEffect(() => {
    setContainers(storage.getContainers());
    setCategories(storage.getCategories());
  }, []);

  const addContainer = () => {
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

    const updated = [...containers, newContainer];
    setContainers(updated);
    storage.saveContainers(updated);
    setNewContainerName('');
  };

  const deleteContainer = (id: string) => {
    const containerToDelete = containers.filter(c => c.id !== id);
    setContainers(containerToDelete);
    storage.saveContainers(containerToDelete);
  };

  const addItem = (containerId: string) => {
    if (!selectedBrand || !selectedStyle || !selectedSize || !quantity) return;

    const category = categories.find(
      c => c.brand === selectedBrand && c.style === selectedStyle && c.size === selectedSize
    );

    if (!category) return;

    const newItem: Item = {
      id: Date.now().toString(),
      categoryId: category.id,
      quantity: parseInt(quantity),
    };

    const updated = containers.map(c =>
      c.id === containerId ? { ...c, items: [...c.items, newItem] } : c
    );

    setContainers(updated);
    storage.saveContainers(updated);
    setAddingItemTo(null);
    setSelectedBrand('');
    setSelectedStyle('');
    setSelectedSize('');
    setQuantity('1');
  };

  const deleteItem = (containerId: string, itemId: string) => {
    const itemToDelete = containers.map(c =>
      c.id === containerId
        ? { ...c, items: c.items.filter(i => i.id !== itemId) }
        : c
    );

    setContainers(itemToDelete);
    storage.saveContainers(itemToDelete);
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
    <div className="min-h-screen p-6">
      <div className="mx-auto mb-4">
        <h1 className="text-3xl text-center font-bold text-foreground mb-2">Inventory Tracker</h1>
				<input               
					type="text"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					placeholder="Enter Username"
					className="block flex place-self-center px-2 py-1 text-center bg-background border mx-auto rounded-md mb-4"/>

        <div className="border border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl text-center font-semibold mb-4">Add New Container</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={newContainerName}
              onChange={(e) => setNewContainerName(e.target.value)}
              placeholder="Input your new containers name"
              className="flex-1 px-3 py-2 border rounded-md"/>
            <button
              onClick={addContainer}
              className="px-4 py-2 rounded-md font-medium bg-green-500 text-white">
              Add Container
            </button>
          </div>
        </div>

        {containers.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">There are currently no containers...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {containers.map((container) => (
                <div key={container.id} className="border rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">{container.name}</h3>
                    <button
                      onClick={() => deleteContainer(container.id)}
                      className="px-3 py-1 bg-red-600 rounded-md text-sm text-white">
                      Delete
                    </button>
                  </div>


									<div className="mb-4">
										{container.items.map((item) => {
											const cat = getCategoryInfo(item.categoryId);
											return (
												<div
													key={item.id}
													className="flex justify-between items-center p-1 rounded">
													<div>
														<span className="font-medium">
															{cat ? `${cat.brand} - ${cat.style} - ${cat.size}` : 'Unknown'}
														</span>
														<span className="ml-3">Qty: {item.quantity}</span>
													</div>
													<button
														onClick={() => deleteItem(container.id, item.id)}
														className="px-3 py-1 rounded-md text-sm bg-pink-400 text-white">
														Remove
													</button>
												</div>
											);
										})}
									</div>

                  {addingItemTo === container.id ? (
                    <div className="space-y-3 p-4 rounded">
                      <div>
                        <label className="block text-sm font-medium mb-2">Select Brand</label>
                        <select
                          value={selectedBrand}
                          onChange={(e) => {
                            setSelectedBrand(e.target.value);
                            setSelectedStyle('');
                            setSelectedSize('');
                          }}
                          className="w-full p-2 border rounded">
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
                          <label className="block text-sm font-medium mb-2">Select Style</label>
                          <select
                            value={selectedStyle}
                            onChange={(e) => {
                              setSelectedStyle(e.target.value);
                              setSelectedSize('');
                            }}
                            className="w-full p-2 border rounded">
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
                          <label className="block text-sm font-medium mb-2">Select Size</label>
                          <select
                            value={selectedSize}
                            onChange={(e) => setSelectedSize(e.target.value)}
                            className="w-full p-2 border rounded">
                            <option value="">Choose size...</option>
                            {getSizesForBrandAndStyle(selectedBrand, selectedStyle).map((size) => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium mb-2">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md"/>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => addItem(container.id)}
                          className="px-4 py-2 rounded-md font-medium bg-emerald-500 text-white">
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setAddingItemTo(null);
                            setSelectedBrand('');
                            setSelectedStyle('');
                            setSelectedSize('');
                          }}
                          className="px-4 py-2 rounded-md font-medium bg-yellow-600 text-white">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingItemTo(container.id)}
                      className="px-4 py-2 rounded-md font-medium bg-black text-white">
                      Add Item
                    </button>
                  )}
                </div> 
						))}
          </div>
        )}
      </div>
			<button className='border bg-red-600 text-lg font-semibold text-white px-3 py-2 rounded-xl block mx-auto mb-2 w-1/6'>Clear All Containers</button>
			<NavLink to="/categories">
				<button className='border bg-blue-400 text-lg font-semibold text-white px-3 py-2 rounded-xl block mx-auto mb-2 w-1/6'>Add Categories</button>
			</NavLink>
			<NavLink to="/auditlogs">
				<button className='border bg-orange-400 text-lg font-semibold text-white px-3 py-2 rounded-xl block mx-auto w-1/6'>View Audit Logs</button>
			</NavLink>
    </div>
  );
};

export default Inventory;
