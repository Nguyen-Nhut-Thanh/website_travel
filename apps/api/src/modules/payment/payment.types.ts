export type PaymentCreateUrlBody = {
  bookingId: number;
  amount: number;
};

export type PaymentVerifyQuery = Record<string, string | string[] | undefined>;
