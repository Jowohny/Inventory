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

export interface Audit {
	message: string;
	user: string;
	time: Date
}

const STORAGE_KEYS = {
  CONTAINERS: 'inventory_containers',
  CATEGORIES: 'inventory_categories',
	AUDITLOGS: 'inventory_auditlogs',
	USERNAME: 'inventory_lastuser'
};

export const storage = {
  getContainers: (): Container[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CONTAINERS);
    return data ? JSON.parse(data) : [];
  },

  getCategories: (): Category[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [];
  },

	getAudits: (): Audit[] => {
		const data = localStorage.getItem(STORAGE_KEYS.AUDITLOGS)
		return data ? JSON.parse(data) : [];
	},

	getLastUser: (): string => {
		const data = localStorage.getItem(STORAGE_KEYS.USERNAME)
		return data ? JSON.parse(data) : '';
	},

  saveContainers: (containers: Container[]) => {
    localStorage.setItem(STORAGE_KEYS.CONTAINERS, JSON.stringify(containers));
  },

	saveAudits: (auditLogs: Audit[]) => {
		localStorage.setItem(STORAGE_KEYS.AUDITLOGS, JSON.stringify(auditLogs))
	},

	saveCategories: (categories: Category[]) => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

	saveLastUser: (lastUser: string) => {
		localStorage.setItem(STORAGE_KEYS.USERNAME, JSON.stringify(lastUser))
	}
};
