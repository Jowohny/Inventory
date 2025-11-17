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