export type MenuItem = {
  _id?: string;
  id?: string;
  name?: string;
  itemName?: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  images?: string[];
  rating?: number;
  status?: "pending" | "approved" | "rejected" | "inactive";
  isAvailable?: boolean;
  isActive?: boolean;
  location?: string;
  vendorName?: string;
  vendorPlan?: string;
  vendorSubscriptionPlan?: string;
  vendor?: {
    name?: string;
    businessName?: string;
    subscriptionPlan?: string;
  };
  createdAt?: string;
};