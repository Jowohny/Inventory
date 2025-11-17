import { useState, useEffect, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import type { Category } from '../interface';
import { useSetCategoryInfo } from '../hooks/useSetCategoryInfo'
import { useGetCurrentUser } from '../hooks/useGetCurrentUser';
import { useGetCategoryInfo } from '../hooks/useGetCategoryInfo';
import { useSetAuditLogInfo } from '../hooks/useSetAuditLogInfo';

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brand, setBrand] = useState('');
  const [style, setStyle] = useState('');
  const [size, setSize] = useState('');
	const [unsure, setUnsure] = useState(false);
	const [openBrand, setOpenBrand] = useState<string>('');
  const [openStyle, setOpenStyle] = useState<string>('');
	const { username, isAuth } = useGetCurrentUser();
	const { addDBCategory, deleteDBCategory, clearDBCategories } = useSetCategoryInfo();
	const { getDBCategories, findDBCategoryDuplicate } = useGetCategoryInfo()
	const { addDBAudit } = useSetAuditLogInfo();
	const upperUsername = username ? username.toUpperCase() : "";
	const navigate = useNavigate();

  useEffect(() => {
		if (!isAuth) {
			navigate('/');
		}
	  const unsubscribe = getDBCategories((updateList) => {
			setCategories(updateList);
		});
		
		return () => unsubscribe();
  }, []);

	const onLogout = () => {
		localStorage.removeItem('userInfo');
		navigate('/');
	}

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

  const addCategory = async () => {
    if (!brand.trim() || !style.trim() || !size.trim()) return;

		const isDuplicate = await findDBCategoryDuplicate(brand, style, size);

    if (isDuplicate.success) {
      alert('This category already exists!');
      return;
    }

		await addDBCategory(Date.now().toString(), brand.trim(), style.trim(), size.trim());

		await addDBAudit(
			`${username} added category: ${size} ${brand} ${style}`,
			username,
			new Date(Date.now())
		);
  };

  const deleteCategory = async (id: string) => {
    const categoryToDelete = categories.find(c => c.id === id);

		await deleteDBCategory(id);

    if (!categoryToDelete) return; 
		
		await addDBAudit(
			 `${username} deleted category: ${categoryToDelete.size} ${categoryToDelete.brand} ${categoryToDelete.style}`,
			 username,
			 new Date(Date.now())
		);
  };

  const clearCategories = async () => {
    if (!unsure) {
      alert('Are you sure you want to clear all categories? \nIf, so press clear all categories again.');
      setUnsure(true);
      return;
    } else {
			await clearDBCategories();

			await addDBAudit(
				`${username} cleared all categories.`,
				username,				
				new Date(Date.now())
			);
		
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
				<h1 className="block mx-auto px-4 py-2 text-center text-2xl font-bold text-black mb-6 flex gap-4 justify-center content-center">
					{ upperUsername }
					<button onClick={onLogout} className='text-center flex border rounded-lg px-2 py-1 text-lg bg-gray-300'>
						Logout
					</button>
				</h1>

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
