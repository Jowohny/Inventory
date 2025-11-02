import { useState, useEffect, useMemo } from 'react';
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
	const [unsure, setUnsure] = useState(false);
  const [audits, setAudits] = useState<Audit[]>([]);

  const [openBrand, setOpenBrand] = useState<string>('');
  const [openStyle, setOpenStyle] = useState<string>('');

  useEffect(() => {
    setCategories(storage.getCategories());
    setUsername(storage.getLastUser());
    setAudits(storage.getAudits());
  }, []);

  const groupedCategories = useMemo(() => {
    const groups: {
      [brand: string]: {
        [style: string]: { id: string; size: string }[];
      };
    } = {};

    categories.forEach((category) => {
      if (!groups[category.brand]) {
        groups[category.brand] = {};
      }
      if (!groups[category.brand][category.style]) {
        groups[category.brand][category.style] = [];
      }
      groups[category.brand][category.style].push({
        id: category.id,
        size: category.size,
      });
    });
    return groups;
  }, [categories]);

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
      alert('Are you sure you want to clear all categories? \nIf, so press clear all categories again.');
      setUnsure(true);
      return;
    } else {
      setCategories([]);
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
  };

  const handleBrandClick = (brandName: string) => {
    if (openBrand === brandName) {
      setOpenBrand('');
      setOpenStyle('');
    } else {
      setOpenBrand(brandName);
      setOpenStyle('');
    }
  };

  const handleStyleClick = (styleName: string) => {
    if (openStyle === styleName) {
      setOpenStyle('');
    } else {
      setOpenStyle(styleName);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl text-center font-bold text-gray-900 mb-6">
          Manage Categories
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
            Add New Category
          </h2>
          <div className="flex flex-col gap-4 mb-4">
            <div>
              <h2 className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </h2>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
              <h2 className="block text-sm font-medium text-gray-700 mb-1">
                Style
              </h2>
              <input
                type="text"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
              <h2 className="block text-sm font-medium text-gray-700 mb-1">
                Size
              </h2>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"/>
            </div>
          </div>
          <button
            onClick={addCategory}
            className="w-full px-5 py-2 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors">
            Add Category
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Existing Categories
          </h2>
          {categories.length === 0 ? (
            <p className="text-gray-500 text-lg text-center p-6">
              No categories found...
            </p>
          ) : (
            <div className="space-y-2">
              {Object.keys(groupedCategories).map((brandName) => (
                <div key={brandName}>
                  <button
                    onClick={() => handleBrandClick(brandName)}
                    className="w-full flex justify-between items-center text-left p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <span className="font-semibold text-lg text-gray-800">
                      {brandName}
                    </span>
										<img src="/down.png" className='h-4 w-4 rounded-full'/>
                  </button>

                  {openBrand === brandName && (
                    <div className="pl-4 pt-2 space-y-2">
                      {Object.keys(groupedCategories[brandName]).map(
                        (styleName) => (
                          <div key={styleName}>
                            <button
                              onClick={() => handleStyleClick(styleName)}
                              className="w-full flex justify-between items-center text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <span className="font-medium text-gray-700">
                                {styleName}
                              </span>
															<img src="/down.png" className='h-4 w-4 rounded-full'/>
                            </button>

                            {openStyle === styleName && (
                              <div className="pl-4 pt-2 space-y-2">
                                {groupedCategories[brandName][styleName].map(
                                  (item) => (
                                    <div
                                      key={item.id}
                                      className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200">
                                      <span className="font-medium text-gray-600 text-sm">
                                        Size: {item.size}
                                      </span>
                                      <button
                                        onClick={() => deleteCategory(item.id)}
                                        className="px-3 py-1 rounded-md text-sm font-medium bg-red-500 text-red-800 hover:bg-red-700 transition-colors">
                                        <img src="delete.png" className='w-4 h-4'/>
                                      </button>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <button
            onClick={clearCategories}
            className="w-full px-6 py-3 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Clear All Categories
          </button>
          <NavLink to="/" className="w-full">
            <span className="block w-full text-center px-6 py-3 rounded-lg font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors">
              View Inventory
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

export default Categories;
