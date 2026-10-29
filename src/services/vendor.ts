import { api } from './api';

export type VendorOrder = {
  id: string;
  status: string;
  totalAmount?: number;
  createdAt?: string;
  orderVendorGroups?: any[];
  [key: string]: any;
};

export type VendorAnalytics = {
  totalRevenue?: number;
  revenueToday?: number;
  totalOrders?: number;
  ordersToday?: number;
  [key: string]: any;
};

export type VendorEarnings = {
  totalEarnings?: number;
  pendingAmount?: number;
  [key: string]: any;
};

export type VendorPayout = {
  id: string;
  amount: number;
  status: string;
  createdAt?: string;
  [key: string]: any;
};

export type LowStockItem = {
  productId: string;
  productName?: string;
  stock?: number;
  threshold?: number;
  [key: string]: any;
};

export const vendorService = {
  async getOrders(params?: Record<string, any>): Promise<VendorOrder[]> {
    return api.get<VendorOrder[]>('/orders/vendor', params);
  },

  async getAnalytics(): Promise<VendorAnalytics> {
    return api.get<VendorAnalytics>('/vendors/me/analytics');
  },

  async getEarnings(): Promise<VendorEarnings> {
    return api.get<VendorEarnings>('/vendors/me/earnings');
  },

  async getPayouts(): Promise<VendorPayout[]> {
    return api.get<VendorPayout[]>('/vendors/me/payouts');
  },

  async getLowStock(params?: Record<string, any>): Promise<LowStockItem[]> {
    return api.get<LowStockItem[]>('/inventory/low-stock', params);
  },
};
