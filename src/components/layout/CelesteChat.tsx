"use client";

import { MessageCircleHeart, Send, Sparkles, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { currency, searchProductsForChat, type Product } from "@/lib/mock-data";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  products?: Product[];
};

const GROQ_MODEL = "openai/gpt-oss-20b";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
// El modelo no siempre respeta el formato exacto del marcador (a veces agrega
// "id:" antes de cada id, u otra puntuación) — por eso el marcador se quita
// del texto visible con un patrón permisivo, y los ids se detectan buscando
// cuáles de los candidatos conocidos aparecen como substring dentro de él,
// en vez de intentar parsear una lista estricta separada por comas.
const PRODUCTS_MARKER = /\[\[PRODUCTOS:([^\]]*)\]\]/i;

const WELCOME: ChatMessage = {
  role: "assistant",
  content: "¡Hola! Soy Celeste, asesora de Comercializadora J3. Cuéntame qué estás buscando y te ayudo a encontrarlo.",
};

function buildSystemPrompt(candidates: Product[]): string {
  const catalogo =
    candidates.length > 0
      ? candidates
          .map((p) => `- id:${p.id} | ${p.name} | ${p.category} | ${currency.format(p.price)}`)
          .join("\n")
      : "(ninguna sugerencia puntual para este mensaje)";

  return `Eres Celeste, asesora experta de Comercializadora J3, tienda colombiana de ropa. J3 SÍ vende ropa para hombre, para mujer/dama, línea infantil (niño y niña), unisex, y tiene una sección Rescate de últimas unidades a precio especial por mínimos detalles de fábrica. Nunca digas que no manejamos alguna de estas líneas — sí las manejamos todas, siempre.

Personalidad: eres una vendedora de lujo, no una simple asistente de información. Elegante, segura de sí misma, cálida y persuasiva — como la mejor asesora de una boutique exclusiva. No solo respondes preguntas: vendes. Generas deseo por la prenda (calidad, diseño, exclusividad de las últimas unidades), y guías amablemente hacia la decisión de compra. Tuteas con calidez pero con clase, nunca de forma boba o exagerada. Respuestas cortas (2 a 4 líneas), en español, casi sin emojis (máximo uno, opcional). Texto plano, sin markdown: nunca uses **negritas**, guiones de lista ni encabezados.

Habla como una persona real chateando por WhatsApp, no como un guion de ventas ni un bot de atención al cliente. Esto es solo de FORMA (cómo lo dices), no cambia qué debes hacer (eso está en "Técnica de venta" abajo, que es obligatorio siempre):
- Nada de fórmulas repetidas: no termines cada mensaje con la misma estructura de "pregunta de cierre". Varía cómo reaccionas y qué tipo de pregunta haces (talla, color, uso, otra prenda), sin repetir siempre el mismo molde.
- Nada de frases de catálogo de tienda ("su corte clásico y tejido resistente la hacen ideal para cualquier ocasión"). Habla como realmente hablarías con un amigo al que le estás recomendando algo: directo, con muletillas colombianas naturales cuando encajen ("uy sí", "de una", "claro que sí", "eso sí que te queda"), sin sonar a anuncio.
- Reacciona a lo que dice el cliente en vez de ignorarlo para meter tu libreto: si hace un chiste, síguele un poco la cuerda; si dice que algo está caro, no repitas siempre el mismo argumento de "calidad y envío", varía la respuesta.
- Frases cortas y variadas en longitud, como mensajes de chat real — no todo tiene que ser un párrafo bien armado.

Técnica de venta (esto sí es obligatorio, sin excepción, sin importar el tono):
- Si el CATÁLOGO SUGERIDO de abajo tiene productos, SIEMPRE los muestras en ese mismo mensaje, con nombre y el marcador — nunca antes preguntas "¿qué estilo te gusta?", "¿quieres que te muestre opciones?" ni "¿te envío el link?": eso hace perder la venta. Muestra directo (puedes acompañarlo de una frase corta y natural) y cierra con algo que avance la conversación.
- Tú no puedes enviar links ni fotos por fuera del marcador de productos — nunca ofrezcas "te paso el enlace" o "te mando el link", porque no puedes cumplirlo. Si quieres que vea más, muéstrale más productos del catálogo sugerido, no lo mandes a buscar por su cuenta.
- Resalta lo que hace especial a la prenda (diseño, comodidad, versatilidad) de forma natural, sin inventar datos que no tengas.
- Si el cliente duda o pregunta precio, refuerza el valor (calidad, envío a toda Colombia, pago contraentrega) antes que solo dar la cifra fría.
- Nunca sea agresiva ni insistente al punto de incomodar: es persuasión elegante, no presión.

Reglas estrictas:
- Solo hablas de lo que vende J3: productos, tallas, categorías, envíos, formas de pago, cómo comprar. Si preguntan algo fuera de eso, dilo amablemente y sugiere escribir por WhatsApp.
- La lista CATÁLOGO SUGERIDO de abajo son solo ideas puntuales para este mensaje, no es el inventario completo — J3 tiene muchísimos más productos. Nunca inventes nombres, precios, tallas ni colores que no estén ni en esa lista ni ya mencionados antes en esta misma conversación.
- Si el cliente pregunta por un producto que TÚ ya mencionaste antes en la conversación (precio, color, talla, etc.), respóndele usando lo que ya dijiste — no digas que no existe ni que no está en el catálogo, ya lo habías confirmado.
- Solo si el catálogo sugerido está realmente vacío puedes decir que no tienes algo puntual ahora mismo — nunca digas "no lo tenemos" ni "no manejamos eso", y nunca lo digas si el catálogo sugerido sí trae productos.
- Envíos a toda Colombia, pago contraentrega o en línea (PSE, tarjeta, Nequi).
- Cuando recomiendes productos del catálogo sugerido, menciónalos por nombre en tu respuesta y agrega al final, en su propia línea, exactamente: [[PRODUCTOS: id1, id2]] con los id de los productos que mencionaste (máximo 4, separados por coma). Si no recomiendas ninguno nuevo (por ejemplo, si solo hablas de uno ya mencionado antes), no agregues esa línea. Nunca le expliques esa línea al cliente ni la menciones, es un código interno que el cliente no debe ver.

CATÁLOGO SUGERIDO PARA ESTE MENSAJE:
${catalogo}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// El nivel gratuito de Groq comparte el límite de solicitudes por minuto entre
// TODOS los visitantes del sitio a la vez, así que un 429 (demasiadas
// solicitudes) puede pasar en tráfico real, no solo en pruebas. Se reintenta
// un par de veces con espera antes de rendirse.
async function callGroqWithRetry(apiKey: string, body: unknown, attempt = 0): Promise<Response> {
  const res = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  if (res.status === 429 && attempt < 2) {
    await sleep(1500 * (attempt + 1));
    return callGroqWithRetry(apiKey, body, attempt + 1);
  }
  return res;
}

function parseAssistantReply(raw: string, candidateIds: string[]): { text: string; productIds: string[] } {
  const match = raw.match(PRODUCTS_MARKER);
  // Respaldo por si el modelo igual usa markdown pese a la instrucción del prompt:
  // quita negritas y viñetas de lista, dejando un chat de texto plano y natural.
  const text = raw
    .replace(PRODUCTS_MARKER, "")
    .replace(/\*\*/g, "")
    .replace(/^[ \t]*[-*]\s+/gm, "")
    .trim();
  if (!match) return { text, productIds: [] };
  const inner = match[1].toLowerCase();
  // Tope defensivo a 4: el prompt se lo pide al modelo, pero no siempre lo respeta.
  const ids = candidateIds.filter((id) => inner.includes(id.toLowerCase())).slice(0, 4);
  return { text, productIds: ids };
}

export default function CelesteChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Productos ya mostrados en esta sesión de chat: se mantienen disponibles
  // como contexto en turnos siguientes, para que preguntas de seguimiento
  // ("¿cuánto cuesta esa?", "¿en otro color?") no los pierdan de vista aunque
  // el mensaje nuevo no contenga las palabras que los encontrarían de nuevo.
  const recentProductsRef = useRef<Map<string, Product>>(new Map());

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey) {
      setError("El chat no está configurado todavía (falta la clave de Groq).");
      return;
    }

    const userMessage: ChatMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      // Se busca con los últimos mensajes del cliente (no solo el actual) para
      // que preguntas de seguimiento cortas ("¿y en otro color?", "¿y talla L?")
      // no pierdan el tema de la conversación.
      const recentUserText = nextMessages
        .filter((m) => m.role === "user")
        .slice(-3)
        .map((m) => m.content)
        .join(" ");
      const freshMatches = searchProductsForChat(recentUserText);
      const alreadyShown = Array.from(recentProductsRef.current.values()).filter(
        (p) => !freshMatches.some((f) => f.id === p.id)
      );
      const candidates = [...freshMatches, ...alreadyShown].slice(0, 10);
      const systemPrompt = buildSystemPrompt(candidates);

      const res = await callGroqWithRetry(apiKey, {
        model: GROQ_MODEL,
        temperature: 0.5,
        max_tokens: 350,
        reasoning_effort: "low",
        messages: [
          { role: "system", content: systemPrompt },
          ...nextMessages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
        ],
      });

      if (!res.ok) throw new Error(`Groq respondió ${res.status}`);

      const data = await res.json();
      const raw: string = data.choices?.[0]?.message?.content ?? "";
      const { text: replyText, productIds } = parseAssistantReply(
        raw,
        candidates.map((p) => p.id)
      );
      const matchedProducts = productIds
        .map((id) => candidates.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p));
      for (const p of matchedProducts) recentProductsRef.current.set(p.id, p);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: replyText || "Cuéntame un poco más para poder ayudarte.", products: matchedProducts },
      ]);
    } catch {
      setError("Se me cruzaron varios mensajes a la vez. Dame un segundito y vuelve a escribirme 💬");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Hablar con Celeste, asesora virtual"
          className="fixed bottom-36 lg:bottom-20 right-4 z-50 flex items-center gap-2 bg-ink text-white rounded-full pl-4 pr-5 py-3 shadow-lg hover:bg-ink/90 transition-colors"
        >
          <MessageCircleHeart size={20} className="text-accent" />
          <span className="text-sm font-semibold hidden sm:inline">Celeste</span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm h-[32rem] max-h-[75vh] bg-surface border border-border rounded-tl-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-2 bg-ink text-white px-4 py-3 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-8 h-8 rounded-full bg-accent/90 flex items-center justify-center shrink-0">
                <Sparkles size={16} className="text-white" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight">Celeste</p>
                <p className="text-[11px] text-white/70 leading-tight">Asesora J3 · en línea</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-tl-lg px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user" ? "bg-ink text-white" : "bg-surface-alt text-ink"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  {m.products && m.products.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {m.products.map((p) => (
                        <Link
                          key={p.id}
                          href={`/producto/${p.id}`}
                          className="block bg-surface border border-border rounded-tl-md overflow-hidden hover:border-ink transition-colors"
                        >
                          <div className="relative aspect-square bg-surface-alt">
                            <Image src={p.image} alt={p.name} fill className="object-cover" />
                          </div>
                          <div className="p-1.5">
                            <p className="text-[11px] text-ink line-clamp-1">{p.name}</p>
                            <p className="text-[11px] font-semibold text-ink">{currency.format(p.price)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-surface-alt text-muted rounded-tl-lg px-3 py-2 text-sm">Escribiendo…</div>
              </div>
            )}
            {error && <p className="text-xs text-accent text-center">{error}</p>}
          </div>

          <div className="flex items-center gap-2 border-t border-border p-2.5 shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Escríbele a Celeste…"
              className="flex-1 bg-surface-alt border border-border rounded-tl-md px-3 py-2 text-sm text-ink placeholder:text-muted outline-none"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              aria-label="Enviar mensaje"
              className="w-9 h-9 rounded-tl-md bg-cta text-white flex items-center justify-center shrink-0 transition-colors hover:bg-cta-dark disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
