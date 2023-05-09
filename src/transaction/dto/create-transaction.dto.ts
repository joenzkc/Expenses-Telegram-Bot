export interface CreateTransactionDto {
  event_id: number;
  created_at: number;
  cost: number;
  telegram_id: string;
  description: string;
}
