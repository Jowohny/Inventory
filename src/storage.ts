export interface Category {
  id: string;
  brand: string;
  style: string;
  size: string;
}

export interface Item {
  id: string;
  categoryId: string;
  quantity: number;
}

export interface Container {
  id: string;
  name: string;
  items: Item[];
}

const STORAGE_KEYS = {
  CONTAINERS: 'inventory_containers',
  CATEGORIES: 'inventory_categories',
};

export const storage = {
  getContainers: (): Container[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CONTAINERS);
    return data ? JSON.parse(data) : [];
  },

  saveContainers: (containers: Container[]) => {
    localStorage.setItem(STORAGE_KEYS.CONTAINERS, JSON.stringify(containers));
  },

  getCategories: (): Category[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [];
  },

  saveCategories: (categories: Category[]) => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },
};
