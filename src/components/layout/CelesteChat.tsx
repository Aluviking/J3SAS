"use client";

import { MessageCircleHeart, Send, Sparkles, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { currency, getInventorySummary, getVariantSiblings, searchProductsForChat, type Product } from "@/lib/mock-data";

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

// El nombre del producto ya incluye el color al final (ej. "Buzo Morado
// Oscuro"), así que las variantes de color se listan tal cual junto a su id
// — es la única fuente real de colores que tiene Celeste, para que nunca
// tenga que inventar si algo viene o no en cierto color.
function describeColorOptions(p: Product): string {
  const siblings = getVariantSiblings(p);
  if (siblings.length <= 1) return "";
  // Sin tope: un color real que se quede afuera de la lista es peor que el
  // costo en tokens de listarlos todos — el grupo más grande del catálogo
  // tiene 16 colores, así que esto nunca crece de forma descontrolada.
  const list = siblings.map((s) => `${s.name} (id:${s.id})`).join(", ");
  return ` | colores disponibles: ${list}`;
}

// Se calcula una sola vez (el catálogo no cambia en tiempo de ejecución): un
// mapa compacto de todo el inventario real (público → categorías → cuántos
// diseños hay de cada una), para que Celeste siempre tenga presente la forma
// completa de la tienda, incluso en mensajes donde la búsqueda puntual no
// encuentra candidatos específicos para mostrar.
const INVENTORY_SUMMARY = getInventorySummary();

function buildSystemPrompt(candidates: Product[]): string {
  const catalogo =
    candidates.length > 0
      ? candidates
          .map(
            (p) =>
              `- id:${p.id} | ${p.name} | ${p.category} | ${currency.format(p.price)} | tallas: ${p.sizes.join(", ")}${describeColorOptions(p)}`
          )
          .join("\n")
      : "(ninguna sugerencia puntual para este mensaje)";

  return `Eres Celeste, vendedora de lujo experta de Comercializadora J3 (ropa colombiana: hombre, dama, niño, niña, unisex, y Rescate: últimas unidades a precio especial por mínimos detalles de fábrica). Sinónimos que reconoces: caballero=hombre, dama/chica/esposa/novia=mujer, adultos=hombre o mujer.

Inventario real (nunca digas que algo no existe si está aquí):
${INVENTORY_SUMMARY}

Eres una mujer colombiana real atendiendo por chat, profesional pero cercana — no una IA, nunca actúes como bot ni sueltes frases robóticas. Eres inteligente y perceptiva: lees CÓMO te escribe cada cliente (formal, relajado, con jerga, cortante, emocionado) y ajustas tu propio tono para calzar con el de él, siempre manteniendo un trato profesional de fondo. Das buenos consejos de moda de verdad (qué combina, para qué ocasión sirve, qué le puede gustar) como lo haría una asesora que sabe de esto, no solo lees una lista de precios. Si todavía no sabes el nombre del cliente en esta conversación, pregúntaselo temprano y de forma natural (no como formulario); en cuanto lo sepas, úsalo con naturalidad en tus respuestas para que se sienta atendido personalmente. SIEMPRE usas al menos 1 emoji por mensaje (2-3 si el cliente está animado o casual), del estilo 😍🔥✨👌🙌👗 — nunca mandes un mensaje sin ninguno, así sea formal el cliente (ahí uno solo y discreto). RESPUESTAS MUY CORTAS Y PUNTUALES — 1 a 3 líneas, nunca más, sin relleno; entre más corto y directo, más natural se siente. Sin fórmulas repetidas de cierre, sin frases de anuncio ("corte clásico e ideal para toda ocasión"), reacciona a lo que dice el cliente (chistes, quejas de precio) en vez de ignorarlo. Texto plano: nada de **negritas**, guiones de lista ni encabezados. Si preguntan de qué marca es la ropa, la marca es J3 (Comercializadora J3) — es la marca propia de esta tienda.

Reglas obligatorias (no negociables, sin importar el tono):
1. Si el CATÁLOGO SUGERIDO trae productos Y el cliente está pidiendo o preguntando por algo, muéstralos YA en ese mismo mensaje — nunca preguntes antes "¿quieres que te muestre?" ni ofrezcas "te paso el link" (no puedes enviarlo, solo mostrar productos vía marcador). Excepción: si el cliente solo se está despidiendo, agradeciendo o cerrando la conversación sin pedir nada nuevo, responde cálido y breve sin volver a mostrar productos, aunque el catálogo sugerido traiga algo (es solo contexto viejo, no un pedido nuevo).
2. Nunca inventes nombres, precios, tallas o colores que no estén en el CATÁLOGO SUGERIDO o ya mencionados antes en esta conversación. Cada producto trae sus "tallas" reales y, si aplica, sus "colores disponibles" con id — son tu única fuente de verdad sobre eso. Si preguntan por una talla o color que no está en esa lista, di que no tienes ese dato ahora, sin afirmar ni negar que exista. Si algo que piden de plano no es ropa (zapatos, accesorios, etc.) y no hay nada parecido en el catálogo sugerido, dilo con naturalidad sin inventar una prenda "parecida" que no exista.
   Si un producto trae muchos "colores disponibles" (más de 3-4), NUNCA los listes todos uno por uno con su propio renglón — eso hace el mensaje larguísimo. Menciona el producto UNA vez con su precio, nombra 2 o 3 colores como ejemplo de pasada dentro de la misma frase, y ya (ej: "el Buzo Morado Oscuro, $74.900, también lo tienes en azul o beige"). Respeta siempre el máximo de 1 a 3 líneas.
3. Si preguntan por algo que ya mencionaste antes, respóndelo con lo ya dicho — nunca digas después que no existe.
4. PROHIBIDO decir "lo siento" o "no tenemos/no hay/no contamos con" — ni para lo que pidieron ni para nada. Si de verdad no hay nada puntual en el catálogo sugerido, en vez de disculparte redirige con energía a algo real que sí tengas: "eso ahora mismo no te lo puedo mostrar, pero mira esto que te va a encantar" + producto real y concreto del catálogo si aplica. Nunca dejes la frase en negativo sin más.
5. No hace falta que digas si algo es "de Rescate": la tarjeta ya lo muestra. Solo evita prometer que algo es Rescate si no lo es.
6. Fuera de temas de J3 (productos, tallas, envíos, pagos), redirige amablemente a WhatsApp.
7. Envíos a toda Colombia, pago contraentrega o en línea (PSE, tarjeta, Nequi). Ante dudas de precio, refuerza valor (calidad, exclusividad, envío, pago contraentrega) antes que solo repetir la cifra.
8. Al recomendar, termina en su propia línea con: [[PRODUCTOS: id1, id2]] (máximo 4 ids, solo de los que mencionaste). Si no recomiendas nada nuevo, omite esa línea. Nunca la menciones ni expliques al cliente, es un código interno.

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
  if (res.status === 429 && attempt < 3) {
    await sleep(2000 * (attempt + 1));
    return callGroqWithRetry(apiKey, body, attempt + 1);
  }
  return res;
}

function parseAssistantReply(raw: string, candidateIds: string[]): { text: string; productIds: string[] } {
  const match = raw.match(PRODUCTS_MARKER);
  // Respaldo por si el modelo igual usa markdown pese a la instrucción del prompt:
  // quita negritas y viñetas de lista, y el arranque apologético "lo siento"
  // (el prompt se lo pide, pero un modelo de 20B no siempre lo respeta) —
  // deja un chat de texto plano, natural y sin sonar a disculpa.
  let text = raw
    .replace(PRODUCTS_MARKER, "")
    .replace(/\*\*/g, "")
    .replace(/^[ \t]*[-*]\s+/gm, "")
    .replace(/\blo siento,?\s*(pero\s+)?/gi, "")
    .trim();
  text = text.charAt(0).toUpperCase() + text.slice(1);
  if (!match) return { text, productIds: [] };
  // Comparación EXACTA por segmento (no substring libre): algunos ids son
  // prefijo literal de otro id real (ej. "buzo-azul" dentro de
  // "buzo-azul-turquesa"), así que un `includes` habría marcado ambos aunque
  // el modelo solo haya mencionado uno.
  const segments = match[1]
    .toLowerCase()
    .split(/[,\s]+/)
    .map((s) => s.replace(/^id[:=]?/, "").trim())
    .filter(Boolean);
  const knownIds = new Set(candidateIds.map((id) => id.toLowerCase()));
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const seg of segments) {
    const original = candidateIds.find((id) => id.toLowerCase() === seg);
    if (original && knownIds.has(seg) && !seen.has(original)) {
      seen.add(original);
      ids.push(original);
    }
  }
  // Tope defensivo a 4: el prompt se lo pide al modelo, pero no siempre lo respeta.
  return { text, productIds: ids.slice(0, 4) };
}

export default function CelesteChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGreeting, setShowGreeting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Productos ya mostrados en esta sesión de chat: se mantienen disponibles
  // como contexto en turnos siguientes, para que preguntas de seguimiento
  // ("¿cuánto cuesta esa?", "¿en otro color?") no los pierdan de vista aunque
  // el mensaje nuevo no contenga las palabras que los encontrarían de nuevo.
  const recentProductsRef = useRef<Map<string, Product>>(new Map());

  // Globo de saludo proactivo: aparece solo una vez por visita, poco después
  // de cargar la página, invitando a chatear (sin esperar a que hagan clic).
  useEffect(() => {
    const timer = setTimeout(() => setShowGreeting(true), 2500);
    return () => clearTimeout(timer);
  }, []);

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
      const candidates = [...freshMatches, ...alreadyShown].slice(0, 8);
      const systemPrompt = buildSystemPrompt(candidates);

      // El texto del prompt le da a Celeste los ids de cada color/variante de
      // cada candidato (ver describeColorOptions), así que el marcador puede
      // traer un id de una variante que no está en `candidates` (porque
      // dedupeVariants solo deja una tarjeta por diseño en la búsqueda). Se
      // arma un mapa con esos ids también para poder resolver la tarjeta real.
      const knownProducts = new Map<string, Product>();
      for (const p of candidates) {
        knownProducts.set(p.id, p);
        for (const sibling of getVariantSiblings(p)) knownProducts.set(sibling.id, sibling);
      }

      const res = await callGroqWithRetry(apiKey, {
        model: GROQ_MODEL,
        temperature: 0.5,
        max_tokens: 400,
        reasoning_effort: "low",
        messages: [
          { role: "system", content: systemPrompt },
          ...nextMessages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
        ],
      });

      if (!res.ok) throw new Error(`Groq respondió ${res.status}`);

      const data = await res.json();
      const raw: string = data.choices?.[0]?.message?.content ?? "";
      const { text: replyText, productIds } = parseAssistantReply(raw, Array.from(knownProducts.keys()));
      const matchedProducts = productIds
        .map((id) => knownProducts.get(id))
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
      {!open && showGreeting && (
        <div className="fixed bottom-52 lg:bottom-36 right-4 z-50 max-w-[15rem] bg-surface border border-border rounded-tl-lg shadow-lg p-3">
          <button
            onClick={() => setShowGreeting(false)}
            aria-label="Cerrar saludo"
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-ink text-white flex items-center justify-center hover:bg-ink/90"
          >
            <X size={11} />
          </button>
          <p className="text-xs text-ink leading-relaxed">
            ¡Hola! 👋 ¿Cómo vas? Estoy aquí para asesorarte y que quedes con el estilo que quieres 😊
          </p>
        </div>
      )}

      {!open && (
        <button
          onClick={() => {
            setOpen(true);
            setShowGreeting(false);
          }}
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
                            {p.category === "Rescate" && (
                              <span className="absolute top-1 left-1 bg-accent text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-tl-sm">
                                Rescate
                              </span>
                            )}
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
