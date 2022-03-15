import * as coda from '@codahq/packs-sdk'

function replaceNewline(message: string): string {
  return message.replace('\n', '\\n')
}

export const pack = coda.newPack()

pack.addNetworkDomain('googleapis.com')

pack.addFormula({
  name: 'SendToWebhook',
  description: "Send message to Google Chat's webhook",
  isAction: true,
  resultType: coda.ValueType.String,
  parameters: [
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: 'webhookUrl',
      description: 'URL for webhook (should begins with `https://chat.googleapis.com`)',
    }),
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: 'message',
      description: 'Message to send (as plain text or JSON format)',
    }),
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: 'threadKey',
      description: 'Thread key in order to send multiple messages to the same thread',
      optional: true,
    }),
  ],
  execute: async ([webhookUrl, message, threadKey], context) => {
    const isJSON = message.startsWith('{') && message.endsWith('}')
    const payload = isJSON ? JSON.parse(replaceNewline(message)) : { text: message }

    if (threadKey) {
      webhookUrl = coda.withQueryParams(webhookUrl, {
        threadKey,
      })
    }

    const response = await context.fetcher.fetch({
      method: 'POST',
      url: webhookUrl,
      cacheTtlSecs: 0,
      body: JSON.stringify(payload),
    })

    return response.body
  },
})
