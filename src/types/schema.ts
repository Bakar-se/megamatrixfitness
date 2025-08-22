export type Role = 'SUPERADMIN' | 'OWNER' | 'MEMBER';
export type BillingModel = 'MONTHLY' | 'YEARLY';
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  date_of_birth: string;
  cnic: string;
  profile_picture: string;
  email: string;
  password: string;
  role: Role;
  subscription_id: string;
  billing_model: BillingModel;
  next_payment_date: string;
  is_active: boolean;
  is_deleted: boolean;
  subscription: Subscription;
  createdAt: string;
  updatedAt: string;
  gyms_owned: Gym[];
  member: Member;
}
export interface Gym {
  id: string;
  name: string;
  owner_id: string;
  createdAt: string;
  updatedAt: string;
  is_active: boolean;
  is_deleted: boolean;
  owner: User;
  members: Member[];
  equipment: Equipment[];
}
export interface Member {
  id: string;
  user_id: string;
  gym_id: string;
  joinedAt: string;
  user: User;
  gym: Gym;
}
export interface Equipment {
  id: string;
  name: string;
  type: string;
  quantity: string;
  weight: string;
  is_active: boolean;
  is_deleted: boolean;
  gym_id: string;
  gym: Gym;
}
export interface Subscription {
  id: string;
  name: string;
  monthly_price: number;
  yearly_price: number;
  max_gyms: number;
  max_members: number;
  max_equipment: number;
  createdAt: Date;
  updatedAt: Date;
  User: User[];
  SubscriptionFeature: SubscriptionFeature[];
  is_active: boolean;
  is_deleted: boolean;
}
export interface SubscriptionFeature {
  id: string;
  subscription_id: string;
  subscription: Subscription;
  feature_id: string;
  feature: Feature;
  createdAt: Date;
  updatedAt: Date;
}
export interface Feature {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  SubscriptionFeature: SubscriptionFeature[];
  is_active: boolean;
  is_deleted: boolean;
}
