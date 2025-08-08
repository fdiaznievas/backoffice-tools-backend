// Parser simple por regex; en producción conviene NLP o reglas más robustas.
export function parseEmail(raw=''){
  const nameMatch = raw.match(/soy\s+([A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÑ\s']+)/i)
  const dniMatch = raw.match(/DNI\s*[:\-]?\s*(\d{7,9})/i)
  const expedienteMatch = raw.match(/(expediente|causa)\s*[:\-]?\s*([A-Z0-9\-\/\.]+)/i)
  const emailMatch = raw.match(/From:\s*(\S+@\S+)/i) || raw.match(/[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/)

  return {
    nombre: nameMatch ? nameMatch[1].trim() : '',
    dni: dniMatch ? dniMatch[1] : '',
    expediente: expedienteMatch ? expedienteMatch[2] : '',
    email: emailMatch ? emailMatch[1] : ''
  }
}