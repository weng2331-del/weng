
export type Category = 'Men' | 'Lady' | 'Boy' | 'Girl' | 'Shoe' | 'Craft' | 'Book';

export interface StockItem {
  id: string;
  stockNo: string;
  barcode?: string;
  name: string;
  itemName: string;
  category: Category;
  quantity: number;
  price: number;
  photoUrl?: string;
  createdAt: string;
}

export type UserRole = 'staff' | 'manager' | 'admin';

export interface User {
  id?: string;
  name: string;
  contact: string;
  email: string;
  password?: string;
  role?: UserRole;
  photoUrl?: string;
}

export interface ReportData {
  month: string;
  year: number;
  totalItems: number;
  totalValue: number;
  categoryDistribution: Record<Category, number>;
}

export type StockActionType = 'in' | 'out';

export interface StockAction {
  id?: string;
  itemId: string;
  itemName: string;
  type: StockActionType;
  quantity: number;
  performedBy: string;
  createdAt: string;
}
