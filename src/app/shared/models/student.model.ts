import { FinancialStatus, PaymentMethod, PlanType } from './enums';

export interface Student {
  _id: string;
  registrationNumber: string;
  name: string;
  cpf: string;
  email?: string;
  phone?: string;
  monthlyFee: number;
  priceLocked: number;
  planType: PlanType;
  paymentMethod: PaymentMethod;
  financialStatus: FinancialStatus;
  asaasCustomerId?: string;
  asaasCheckoutId?: string;
  checkoutUrl?: string;
  asaasSubscriptionId?: string;
  active: boolean;
  createdAt: Date;
}

export interface StudentSearchResult {
  id: string;
  name: string;
}

export interface RegisterStudentDto {
  name: string;
  cpf: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  postalCode?: string;
  monthlyFee: number;
  planType: PlanType;
}

export interface UpdateStudentDto {
  name?: string;
  email?: string;
  phone?: string;
  monthlyFee?: number;
  planType?: PlanType;
  financialStatus?: FinancialStatus;
  active?: boolean;
}

export interface RegisterStudentResponse {
  checkoutUrl?: string;
  studentId: string;
}
