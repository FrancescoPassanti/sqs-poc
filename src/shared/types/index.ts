export type Nullable<T> = T | null
export type Optional<T> = T | undefined

export enum QUEUES_NAME {
  ORDER_CREATED_SEND_EMAIL = 'OrderCreatedSendEmail',
  ORDER_CREATED_CONSUMER_1 = 'OrderCreatedConsumer1',
  ORDER_CREATED_CONSUMER_2 = 'OrderCreatedConsumer2',
}

export enum SNS_TOPIC_NAME {
  ORDER_CREATED = 'OrderCreated',
}
