export type PaymentMethod = 'bKash' | 'Nagad' | 'Rocket' | 'Cash';
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'confirmed';
export type MemberType = 'leader' | 'trainer';

export interface TeamMember {
  id: string;
  name: string;
  type: MemberType;
  password?: string;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  selectedMemberName: string;
  lastDigit: string;
  amount: number;
  whatsapp: string;
  paymentMethod: PaymentMethod;
  status: BookingStatus;
  adminNote?: string;
  createdAt: any;
  updatedAt?: any;
}

export interface AdminConfig {
  adminEmails: string[];
}
