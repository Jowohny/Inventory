import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { storage } from '../storage';
import type { Category } from '../storage';
import type { Audit } from '../storage';

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brand, setBrand] = useState('');
  const [style, setStyle] = useState('');
  const [size, setSize] = useState('');
	const [username, setUsername] = useState('');
	const [unsure, setUnsure] = useState(false)
  const [audits, setAudits] = useState<Audit[]>([]);

  useEffect(() => {
    setCategories(storage.getCategories());
		setUsername(storage.getLastUser())
    setAudits(storage.getAudits());
  }, []);

  const addCategory = () => {
		if (username.length === 0) {
			alert("Please enter a username before you make any changes...");
			return;
		}
    if (!brand.trim() || !style.trim() || !size.trim()) return;

    const isDuplicate = categories.some(
      c => c.brand.toLowerCase() === brand.trim().toLowerCase() &&
           c.style.toLowerCase() === style.trim().toLowerCase() &&
           c.size.toLowerCase() === size.trim().toLowerCase()
    );

    if (isDuplicate) {
      alert('This category already exists!');
      return;
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      brand: brand.trim(),
      style: style.trim(),
      size: size.trim(),
    };

    const updated = [...categories, newCategory];
    setCategories(updated);
    storage.saveCategories(updated);

    const newAudit: Audit = {
      message: `${username} added category: ${newCategory.size} ${newCategory.brand} ${newCategory.style}`,
      user: username,
      time: new Date(Date.now()),
    };
    const updatedAudits = [...audits, newAudit];
    setAudits(updatedAudits);
    storage.saveAudits(updatedAudits);
  };

  const deleteCategory = (id: string) => {
		if (username.length === 0) {
			alert("Please enter a username before you make any changes...");
			return;
		}
    const categoryToDelete = categories.find(c => c.id === id);
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    storage.saveCategories(updated);

    if (categoryToDelete) {
      const newAudit: Audit = {
        message: `${username} deleted category: ${categoryToDelete.size} ${categoryToDelete.brand} ${categoryToDelete.style}`,
        user: username,
        time: new Date(Date.now()),
      };
      const updatedAudits = [...audits, newAudit];
      setAudits(updatedAudits);
      storage.saveAudits(updatedAudits);
    }
  };

	const clearCategories = () => {
		if (!unsure) {
			alert('Are you sure you want to clear all categories? \n If, so press clear all categories again.');
			setUnsure(true);
			return;
		} else {
			setCategories([])
			storage.saveCategories([]);
			if (username.length > 0) {
				const newAudit: Audit = {
					message: `${username} cleared all categories.`,
					user: username,
					time: new Date(Date.now()),
				};
				const updatedAudits = [...audits, newAudit];
				setAudits(updatedAudits);
				storage.saveAudits(updatedAudits);
			}
			setUnsure(false);
		}
	}

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto mb-4">
        <h1 className="text-3xl text-center font-bold mb-3">Manage Categories</h1>
				<input               
					type="text"
					value={username}
					onChange={(e) => { setUsername(e.target.value); storage.saveLastUser(e.target.value); }}
					placeholder="Enter Username"
					className="block flex place-self-center px-2 py-1 text-center border mx-auto rounded-md mb-4"/>

        <div className="border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Nike"
                className="w-full px-3 py-2 border rounded-md"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Style</label>
              <input
                type="text"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="e.g. T-Shirt"
                className="w-full px-3 py-2 border rounded-md"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Size</label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g. M"
                className="w-full px-3 py-2 border border-input rounded-md"/>
            </div>
          </div>
          <button
            onClick={addCategory}
            className="px-4 py-2 rounded-md font-medium bg-indigo-400 text-white">
            Add Category
          </button>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Existing Categories</h2>
          {categories.length === 0 ? (
            <p className="font-thin tracking-wide text-2xl">No categories found</p>
          ) : (
            <div>
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-1 bg-secondary rounded-lg" >
                  <span className="font-medium">
										{category.size} {category.brand} {category.style} 
                  </span>
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className="px-3 py-1 rounded-md text-sm bg-red-600 text-white" >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
			<button onClick={clearCategories} className='flex-1 border bg-red-600 text-lg font-semibold text-white px-3 py-2 rounded-xl block mx-auto mb-2'>Clear All Categories</button>
			<NavLink to="/">
				<button className='border bg-blue-400 text-lg font-semibold text-white px-3 py-2 rounded-xl block mx-auto mb-2 flex-1'>View Inventory</button>
			</NavLink>
			<NavLink to="/auditlogs">
				<button className='border bg-orange-400 text-lg font-semibold text-white px-3 py-2 rounded-xl block mx-auto flex-1'>View Audit Logs</button>
			</NavLink>
    </div>
  );
};

export default Categories;
