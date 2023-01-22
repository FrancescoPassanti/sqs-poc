import { SQSEvent, SQSRecord } from 'aws-lambda'

exports.handler = async (
  event: SQSEvent,
): Promise<{ batchItemFailures: { itemIdentifier: string }[] }> => {
  const batchItemFailures: { itemIdentifier: string }[] = []

  console.log(event?.Records?.map((value) => value.messageId))

  event?.Records?.map((record: SQSRecord) => {
    const body = JSON.parse(record?.body)
    console.log(body)

    if (body.orderId === '000002') {
      batchItemFailures.push({ itemIdentifier: record.messageId })
    }
  })

  return { batchItemFailures }
}
