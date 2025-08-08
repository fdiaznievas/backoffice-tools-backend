import { Client } from '@microsoft/microsoft-graph-client'
import { ClientSecretCredential } from '@azure/identity'
import { config } from '../config.js'

let client = null

function ensure(){
  if(client) return client
  const { tenantId, clientId, clientSecret } = config.graph
  if(!tenantId || !clientId || !clientSecret){
    console.warn('[graph] Credenciales no configuradas, modo mock')
    return null
  }
  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret)
  client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => {
        const token = await credential.getToken('https://graph.microsoft.com/.default')
        return token.token
      }
    }
  })
  return client
}

export async function sendMail({ to, subject, body, fromUpn=config.graph.senderUpn }){
  const c = ensure()
  const message = {
    message: {
      subject,
      body: { contentType: 'Text', content: body },
      toRecipients: [{ emailAddress: { address: to } }],
    },
    saveToSentItems: true
  }

  if(!c){
    console.log('[graph-mock] sendMail', { fromUpn, to, subject, body: body.slice(0, 120) + '...' })
    return { id: 'mock-' + Date.now() }
  }

  if(!fromUpn) throw new Error('MS_SENDER_UPN no configurado')
  await c.api(`/users/${fromUpn}/sendMail`).post(message)
  return { id: 'sent' }
}