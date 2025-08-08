import OpenAI from 'openai'
import { config } from '../config.js'

let client = null
function ensure(){
  if(!client){
    if(!config.openai.apiKey) throw new Error('OPENAI_API_KEY no configurado')
    client = new OpenAI({ apiKey: config.openai.apiKey })
  }
  return client
}

export async function generateEmail({ nombre, expediente, estado, ultimaActualizacion }){
  const prompt = `Redacta una respuesta profesional y formal en español para un cliente que presentó una denuncia judicial.
Datos:
- Nombre: ${nombre}
- Expediente: ${expediente}
- Estado: ${estado}
- Última actualización: ${ultimaActualizacion}

Instrucciones:
- Tono formal y claro
- No revelar datos sensibles adicionales
- Cierra con saludo institucional`

  const openai = ensure()
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Eres un asistente especializado en atención formal a clientes.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3
  })
  return completion.choices[0].message.content
}