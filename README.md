# BF Backend (Node + Express)

Backend local para **Backoffice Fraudes** con auth JWT vía **cookie httpOnly**, logs en **SQLite**, integración **OpenAI** y esqueleto de **Microsoft Graph**.

## Requisitos
- Node 18+
- (Opcional) Credenciales de Azure App Registration si vas a enviar por Graph

## Setup rápido
```bash
cp .env.example .env
npm install
npm run dev
```
El servidor levanta en `http://localhost:3000`

## Endpoints
- `POST /api/auth/login { username, password }` → setea cookie JWT y devuelve `{ user }`
- `GET /api/auth/me`
- `POST /api/auth/logout`

- `GET /api/logs?q=&page=&limit=` → `{ items, total }`
- `POST /api/logs/demo` → inserta un log de prueba (autenticado)

- `POST /api/automations/email-reply/parse { raw }`
- `GET  /api/automations/email-reply/lookup?dni=&expediente=`
- `POST /api/automations/email-reply/generate { mode, clientData, lookup }`
- `POST /api/automations/email-reply/send { to, subject, body }`

## Seguridad (recomendado)
- Usar **HTTPS** y `secure: true` en cookie
- Agregar **rate-limit** por IP
- Validar entradas con **zod**
- Habilitar CORS solo para el frontend local (`ORIGIN`)

## Microsoft Graph
Para producción, configurar permisos **Application** o **Delegated** según el buzón. Variables:
- `AZURE_TENANT_ID`
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`
- `MS_SENDER_UPN` (UPN del buzón remitente)
Si no están configuradas, el envío funciona en **modo mock** (log en consola y respuesta `{ id: "mock-..." }`).

## OpenAI
Definir `OPENAI_API_KEY`. El endpoint `/generate` usa `gpt-4o-mini` con temperatura 0.3 y tono formal en español.

## Logs
Los logs se guardan en `data/data.db` (SQLite). Métodos en `services/logStore.js`.
```
CREATE TABLE execution_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  automation TEXT, status TEXT,
  startedAt TEXT, finishedAt TEXT,
  durationMs INTEGER, runBy TEXT, detail TEXT
)
```

## To-do próximos sprints
- Lectura de correo entrante desde Graph (webhooks o polling)
- Conexión real a bases internas (mssql/pg/oracle) en `services/internalDb.js`
- Paginación/orden avanzado en `/api/logs`
- Tests con **vitest**/**supertest**
```