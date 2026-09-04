# Cómo construir un agente de chat IA para un sitio web (basado en "Camila" de FYR24)

Este documento explica, paso a paso, cómo está construido el agente de chat IA "Camila" que se implementó para fyr24.com, para que puedas replicar el mismo patrón en un proyecto nuevo con un producto totalmente distinto. Pégale este archivo completo a Claude en el repo del proyecto nuevo y pídele que lo adapte al negocio específico.

**Importante para entender bien esto:** no hay ningún "entrenamiento" de modelo de por medio. No se entrena ni se afina (fine-tuning) ningún modelo de IA. Todo el comportamiento del agente se logra con **ingeniería de prompt**: un system prompt bien escrito + un LLM ya entrenado de fábrica (en este caso, servido por Groq) + un poco de lógica de backend para manejar memoria de conversación y capturar datos del cliente. Eso es todo el "secreto".

---

## 1. Arquitectura general

```
Navegador del visitante
   │
   │ 1. Carga <script src="/chat-widget-v2.js" defer></script>
   ▼
chat-widget-v2.js (JS puro, sin frameworks, se inyecta solo)
   │
   │ 2. Al cargar, pide su configuración (nombre, color, mensaje bienvenida)
   ▼
GET /api/v1/agente-ia/config  →  AgenteIaController → tabla en BD
   │
   │ 3. El visitante escribe un mensaje → POST
   ▼
POST /api/v1/chat  →  ChatController
   │
   │ 4. Arma: system prompt + historial de la sesión (cache) + mensaje nuevo
   ▼
Groq API (chat completions, modelo tipo Llama/GPT-OSS)
   │
   │ 5. El LLM responde texto normal, y a veces agrega un marcador
   │    especial al final con datos estructurados (lead o cita)
   ▼
ChatController detecta el marcador → dispara emails (Resend) → guarda
historial en cache → responde al widget solo con el texto visible
```

Todo el negocio corre en **dos piezas**:
- **Frontend**: un único archivo JS vanilla (sin build, sin npm, sin React) que se pega como `<script>` en cualquier sitio.
- **Backend**: un endpoint HTTP que recibe el mensaje, arma el prompt, llama al LLM, y devuelve la respuesta. En este proyecto es Laravel, pero el patrón es igual de válido en Node/Express, Python/FastAPI, etc.

No hay n8n, no hay Zapier, no hay plataforma de terceros orquestando nada (en una versión anterior de este mismo proyecto sí se usó n8n como intermediario — quedan restos del nombre "Sofia" y archivos `n8n-*.json` en el repo — pero se migró a este backend directo porque es más simple, más rápido, y no depende de un servicio externo que puede caerse o dejar de responder).

---

## 2. El frontend: `chat-widget-v2.js`

Un solo archivo JavaScript, sin dependencias, que:
1. Al cargar la página, hace `fetch()` a un endpoint de configuración para saber: nombre del agente, mensaje de bienvenida, color de marca, y a qué URL debe mandar los mensajes (`webhook_url`).
2. Si esa llamada falla, usa un `FALLBACK_CONFIG` embebido en el propio archivo (para que el widget nunca se rompa aunque el backend esté caído).
3. Inyecta su propio CSS (`<style>` generado en JS) y su propio HTML (botón flotante + ventana de chat) directamente al `document.body` — no requiere ningún CSS ni HTML previo en la página.
4. Genera un `sessionId` único por visitante y lo guarda en `sessionStorage` (para que la conversación tenga memoria mientras dure la pestaña, pero se resetee en una visita nueva).
5. Al enviar un mensaje, hace `POST` a la `webhook_url` con `{ chatInput, sessionId, metadata }` y muestra la respuesta.

**Por qué este patrón funciona bien:**
- Se instala pegando **una sola línea** de `<script>` en cualquier sitio (WordPress, Laravel, HTML estático, lo que sea).
- No necesita build ni compilación — se edita y se sube tal cual.
- El color, nombre y mensaje de bienvenida se pueden cambiar **sin tocar código**, porque vienen de una configuración en base de datos (ver sección 4).

**Para el proyecto nuevo:** copia este archivo como punto de partida y cambia únicamente:
- El prefijo de los IDs (`fyr-chat-btn` → `[nombre-nuevo]-chat-btn`, etc.) para evitar colisiones de CSS si el sitio ya usa esos nombres.
- El nombre en `sessionStorage` (`fyr_chat_session` → algo único al proyecto).
- Los textos por defecto del `FALLBACK_CONFIG`.

---

## 3. El backend: el controlador de chat (el "cerebro")

Este es el archivo que realmente importa: `app/Http/Controllers/Api/ChatController.php`. Su método `chat()` hace, en orden:

1. **Valida** que llegó un mensaje no vacío.
2. **Valida** que exista la API key del proveedor de IA (`env('GROQ_API_KEY')`). Si no existe, responde con un mensaje de respaldo amigable en vez de romperse.
3. **Recupera el historial** de la conversación desde `Cache` (Laravel), usando el `sessionId` como llave (`chat_{sessionId}`), con un límite de mensajes guardados (últimos 12) y un TTL (1 hora) para que no crezca indefinidamente.
4. **Arma el array de mensajes** para el LLM: `[system prompt, ...historial, mensaje nuevo]`.
5. **Llama a la API del proveedor** (Groq en este caso) vía HTTP POST, con timeout corto (20s) para no dejar al usuario esperando eternamente.
6. **Si la llamada falla o hay una excepción**, responde con un mensaje de respaldo genérico (nunca deja el chat "roto" o sin respuesta).
7. **Si la llamada tiene éxito**, revisa si la respuesta del LLM contiene un marcador especial (`##LEAD##{json}` o `##CITA##{json}`) — si lo tiene, extrae ese JSON, dispara los emails correspondientes, y **le quita ese marcador al texto** antes de mostrárselo al usuario (el marcador es solo para que el backend lo procese, el visitante nunca lo ve).
8. **Guarda la respuesta** en el historial de cache y responde al frontend.

### El "prompt del sistema" (esto es el verdadero corazón del agente)

No hay entrenamiento — hay un bloque de texto (`SYSTEM_PROMPT`) que se le manda al LLM en **cada** petición, con esta estructura:

```
[PERSONA] Quién es el agente, tono, y una regla dura: nunca revelar que es IA.

[DATOS DEL NEGOCIO] Hechos concretos y verificables sobre la empresa:
años de experiencia, cantidad de proyectos, ciudad, política de precios
(en este caso: nunca dar precios fijos, todo es "cotización personalizada"),
canal de contacto directo (WhatsApp).

[SERVICIOS/PRODUCTOS] Lista de lo que se ofrece, con links a páginas
específicas del sitio para compartir cuando el cliente pregunte por algo
puntual.

[FLUJO DE CONVERSACIÓN] Pasos numerados de cómo debe comportarse:
  1. Saludo
  2. Resolver dudas (1 oración, compartir link si aplica)
  3. Si preguntan precio → nunca dar cifra, redirigir a "cotización personalizada"
  4. Si hay interés real → pedir datos UNO POR UNO (nombre, teléfono, email, tema)
  5. Con los 4 datos completos → responder un mensaje de cierre EXACTO
     y en la siguiente línea emitir el marcador ##LEAD##{json con los datos}

[REGLAS DURAS] Restricciones de formato: máximo 2 oraciones, sin listas,
una pregunta a la vez, nunca precios, solo español.
```

**Por qué pedir los datos "uno por uno" en vez de todos de una vez:** conversión. Pedir 4 datos en un solo mensaje espanta al usuario; pedirlos de a uno, dentro del flujo natural de la charla, se siente como una conversación real y no como un formulario.

**Por qué el marcador `##LEAD##{json}` al final del mensaje:** es la forma más simple y confiable de que un LLM de texto libre te devuelva **datos estructurados** sin necesitar "function calling" / "tool use" del proveedor (que no todos los proveedores soportan igual, y agrega complejidad). Le pides al modelo que, cuando complete cierta condición, escriba un delimitador único seguido de JSON válido, y tú lo parseas con una regex simple en el backend. Es un patrón barato y muy efectivo para casos simples como este.

**Para el proyecto nuevo:** este `SYSTEM_PROMPT` es lo que **más** vas a tener que reescribir. Debes reconstruirlo completo con:
- La personalidad y nombre del nuevo agente.
- Los hechos reales del negocio nuevo (no inventes nada — pide esta info al cliente).
- El catálogo de productos/servicios del negocio nuevo y sus links reales.
- El flujo de conversación adaptado (¿este negocio sí puede dar precios fijos? ¿necesita agendar citas? ¿vende productos con inventario/tallas/variantes?).
- Qué datos necesita capturar como lead (puede que no sean los mismos 4 campos).

---

## 4. Configuración editable sin tocar código

Hay una tabla en base de datos (modelo `AgenteIaConfig`, fila única tipo "singleton") con estos campos: `activo`, `nombre_agente`, `mensaje_bienvenida`, `webhook_url`, `color_primario`. Un endpoint (`AgenteIaController@config`) la expone como JSON público, y el widget la consume al cargar.

Esto permite que alguien sin conocimientos técnicos (desde un panel admin tipo Filament) pueda:
- Cambiar el nombre del agente.
- Cambiar el mensaje de bienvenida.
- Cambiar el color de marca.
- Apagar el chat completo (`activo = false`) sin tocar código ni hacer un deploy.

**Para el proyecto nuevo:** vale la pena replicar este patrón (config en BD + endpoint público) en vez de hardcodear estos valores en el JS, especialmente si el cliente va a querer ajustar textos/colores por su cuenta más adelante.

---

## 5. Conexión con el proveedor de IA (Groq)

```php
Http::timeout(20)
    ->withHeaders([
        'Authorization' => 'Bearer ' . $apiKey,
        'Content-Type'  => 'application/json',
    ])
    ->post('https://api.groq.com/openai/v1/chat/completions', [
        'model'       => 'openai/gpt-oss-120b', // ver nota abajo
        'messages'    => $messages,               // [system, ...historial, nuevo]
        'max_tokens'  => 280,
        'temperature' => 0.6,
    ]);
```

- **Groq** se eligió porque es extremadamente rápido (respuestas en ~100-300ms) y muy barato/gratis en su capa inicial, ideal para un chat de atención al cliente donde la latencia importa.
- La API es **compatible con el formato de OpenAI** (`/chat/completions`, mismo shape de `messages`), así que este mismo código sirve casi igual para conectarse a OpenAI, o a cualquier proveedor compatible, solo cambiando la URL base y el nombre del modelo.
- `temperature: 0.6` da respuestas consistentes pero no robóticas. Súbelo si quieres más "creatividad", bájalo si quieres respuestas más predecibles.
- `max_tokens: 280` limita el largo de la respuesta (y el costo). Si usas un modelo "razonador" (que piensa antes de responder, como los `gpt-oss`), deja margen suficiente — el razonamiento interno también consume tokens de ese límite.

### ⚠️ Lección aprendida (le pasó a este proyecto en producción)
**Los proveedores de LLM descontinúan modelos con el tiempo.** Este proyecto dejó de funcionar por semanas porque el modelo `llama-3.1-8b-instant` fue retirado de Groq y nadie se dio cuenta — el código seguía "andando" (no tiraba error visible), pero cada llamada fallaba silenciosamente y el chat caía a un mensaje genérico de respaldo.

**Antes de lanzar el proyecto nuevo, y periódicamente después:**
1. Verifica el modelo elegido contra la lista de modelos activos del proveedor (`GET /v1/models` con tu API key, o la consola web del proveedor).
2. Prueba el modelo con una llamada `curl` directa a la API del proveedor **antes** de asumir que un bug está en tu código — así descartas en 10 segundos si el problema es tu backend o el proveedor.
3. Considera loguear (`Log::error()`) el cuerpo real del error cuando la llamada al LLM falla, en vez de solo mostrar un mensaje genérico al usuario — así no tienes que estar adivinando la causa.

---

## 6. Captura de leads (notificaciones por email)

Cuando el LLM emite el marcador `##LEAD##{...}`, el backend:
1. Parsea el JSON.
2. Envía un email a la empresa (con todos los datos + link directo de WhatsApp del cliente).
3. Envía un email de confirmación al cliente.

El envío de emails se hace vía **Resend** (API HTTP simple, `POST https://api.resend.com/emails` con `Authorization: Bearer <RESEND_KEY>`). El fallo al enviar el email se captura silenciosamente (`catch` vacío) para que, si el email falla, **el chat no se rompa** — el usuario siempre recibe su respuesta aunque la notificación interna falle.

**Para el proyecto nuevo:** puedes reemplazar el email por lo que tenga sentido para ese negocio — un webhook a un CRM, un mensaje a Slack, un registro en una tabla de leads, etc. La idea central (el LLM emite un marcador con JSON, el backend lo captura y dispara una acción) se mantiene igual sin importar qué acción sea.

---

## 7. Variables de entorno necesarias

```
GROQ_API_KEY=            # clave del proveedor de LLM
RESEND_KEY=               # clave para envío de emails (si usas ese patrón)
RESEND_EMAIL_FROM="Nombre Agente <correo@dominio.com>"
```

**Nota sobre despliegue:** el archivo `.env` de producción **no viaja por git** (está en `.gitignore`, como debe ser por seguridad). Vive únicamente en el servidor y se edita ahí directamente (panel de hosting, SSH, o un paso de despliegue que lo escriba de forma segura). No asumas que un cambio de `.env` se aplicó solo porque el código sí se desplegó — son cosas independientes.

---

## 8. Checklist para construir esto en el proyecto nuevo

1. **Recopila la info real del negocio nuevo** antes de escribir una sola línea: nombre del agente, tono deseado, datos duros del negocio, catálogo de productos/servicios con links, política de precios, qué datos de lead se necesitan capturar, y a dónde deben llegar las notificaciones.
2. **Backend**: crea un endpoint `POST /api/chat` (o similar) que reciba `{ mensaje, sessionId }`.
3. Implementa manejo de historial de conversación por sesión (cache/memoria con TTL — no necesitas base de datos para esto).
4. Escribe el `SYSTEM_PROMPT` siguiendo la estructura de la sección 3 (persona → hechos → catálogo → flujo paso a paso → reglas duras).
5. Define el/los marcador(es) de captura de datos estructurados (`##LEAD##`, o el nombre que tenga sentido) y su parseo por regex en el backend.
6. Conecta con el proveedor de LLM elegido (Groq recomendado por velocidad/costo) — **verifica el modelo contra la lista de modelos activos antes de hardcodearlo**.
7. Define la acción a disparar cuando se captura un lead (email, CRM, Slack, etc.), con manejo de errores que **nunca** rompa la respuesta al usuario.
8. **Frontend**: adapta `chat-widget-v2.js` — cambia branding, prefijos de IDs, y el `FALLBACK_CONFIG`.
9. (Opcional pero recomendado) Crea una config editable en BD para nombre/color/mensaje de bienvenida/activo, expuesta por un endpoint público, para que el cliente pueda ajustar cosas sin pedirte un deploy.
10. **Prueba end-to-end** con `curl` directo al endpoint de chat antes de probarlo desde el navegador — aísla más rápido si el problema es de backend, de LLM, o de frontend.
11. Documenta claramente qué variables de entorno se necesitan en producción y dónde se configuran (no solo en `.env.example`).
