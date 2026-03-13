export interface PaymentHistory {
  _id: string;
  studentId: string;
  asaasPaymentId: string;
  asaasSubscriptionId?: string;
  amount: number;
  method: string;
  status: string;
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
}
