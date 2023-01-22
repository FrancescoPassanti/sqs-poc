export const orderRequest = {
  type: 'object',
  required: ['orderId'],
  properties: {
    customerId: { type: 'string' },
  },
}

export type OrderRequest = {
  orderId: string
}
