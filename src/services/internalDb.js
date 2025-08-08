// Placeholder de consulta a bases internas. Aquí cablearemos drivers reales (mssql/pg/oracle).
// Por ahora devolvemos un mock estable.
export async function lookupByDniOrExpediente({ dni, expediente }){
  await new Promise(r=>setTimeout(r, 150))
  return {
    estado: 'En trámite',
    ultimaActualizacion: new Date(Date.now() - 5*24*60*60*1000).toISOString().slice(0,10),
    area: 'Mesa Legal'
  }
}