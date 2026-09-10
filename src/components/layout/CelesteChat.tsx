"use client";

import { MessageCircleHeart, Send, Sparkles, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { currency, getInventorySummary, getVariantSiblings, products, searchProductsForChat, type Product } from "@/lib/mock-data";

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
// Marcador de "agregar al carrito de verdad": Celeste lo escribe solo cuando
// el cliente pidió o confirmó agregar algo puntual. Formato:
// [[CARRITO: id:talla:cantidad, id2:talla2:cantidad2]]. Se resuelve igual de
// permisivo que PRODUCTS_MARKER — el modelo no siempre respeta el separador
// exacto — partiendo primero por "," (cada producto) y luego por ":" (campos).
const CART_MARKER = /\[\[CARRITO:([^\]]*)\]\]/i;

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

// El precio de mayorista es un dato real del catálogo (nunca inventado) que
// antes no llegaba al prompt — Celeste no podía mencionarlo con exactitud
// cuando el cliente compraba varias unidades. Se activa por categoría
// completa, no por referencia exacta (ver cart-context.tsx).
function describeWholesale(p: Product): string {
  if (!p.wholesalePrice || !p.wholesaleMinQty) return "";
  return ` | mayor:${currency.format(p.wholesalePrice)}x${p.wholesaleMinQty}+ de ${p.category}`;
}

// Se calcula una sola vez (el catálogo no cambia en tiempo de ejecución): un
// mapa compacto de todo el inventario real (público → categorías → cuántos
// diseños hay de cada una), para que Celeste siempre tenga presente la forma
// completa de la tienda, incluso en mensajes donde la búsqueda puntual no
// encuentra candidatos específicos para mostrar.
const INVENTORY_SUMMARY = getInventorySummary();

function buildSystemPrompt(candidates: Product[], isFirstMessage: boolean): string {
  const catalogo =
    candidates.length > 0
      ? candidates
          .map(
            (p) =>
              `- id:${p.id} | ${p.name} | ${p.category} | ${currency.format(p.price)} | tallas: ${p.sizes.join(", ")}${describeColorOptions(p)}${describeWholesale(p)}`
          )
          .join("\n")
      : "(ninguna sugerencia puntual para este mensaje)";

  return `Eres Celeste, vendedora experta de Comercializadora J3 (ropa colombiana: hombre, dama, niño, niña, unisex, y Rescate: últimas unidades a precio especial por mínimos detalles de fábrica). Sinónimos: caballero=hombre, dama/chica/esposa/novia=mujer, adultos=hombre o mujer.

Inventario real (nunca digas que algo no existe si está aquí):
${INVENTORY_SUMMARY}

Lógica de estilo del catálogo (úsala para juzgar formal/informal, corte y color — el catálogo es sobre todo urbano/casual, sé honesta con eso):
- De más informal a más formal: Buzos, Pantalonetas, Camisetas (fit deportivo/gráfico) < Blusas, Croptop (casual con estilo) < Polos, Camisas, Chaquetas (semi-formal, lo más "serio" de hombre son Polos/Camisas) < Vestidos (lo más elegante que manejamos, sobre todo para dama).
- "Oversize" en nombre/categoría = corte ancho/holgado; si no lo dice, es corte regular.
- Colores neutros/serios: negro, blanco, gris, azul oscuro, beige, café, vino tinto, oliva. Vivos/llamativos: fucsia, neón, fluorescente, turquesa, naranja, amarillo, rosa fuerte — clasifica siempre con el color real que trae cada producto, nunca inventado.

Atiendes como la mejor asesora de imagen de una tienda física: cálida, atenta, fiel a lo que ves y escuchas, mujer colombiana real — nunca IA ni bot. Antes de responder, lee bien lo que el cliente dice y cómo lo dice (formal, relajado, jerga, cortante, animado) y calza tu tono con el de él, siempre profesional de fondo. Das consejos de moda reales (qué combina, para qué ocasión, qué le queda bien) para entender qué necesita y venderle bien — pero sin acosar: si no muestra interés en comprar todavía, no insistas ni presiones, sigue asesorando con calma.
${
  isFirstMessage
    ? "Primer mensaje del cliente: salúdalo cálido y en el mismo mensaje pregúntale su nombre y qué anda buscando o para quién es (él, ella, niño/niña) — corto y natural, como al recibirlo en el local."
    : "Si en esta conversación ya te dijo su nombre, úsalo siempre; si no, pregúntaselo en cuanto sea natural."
}
Si ya sabe qué quiere y para quién, ve directo a mostrar opciones reales — no repreguntes lo obvio. Si falta claridad, pregunta UNA cosa concreta a la vez, nunca una lista de preguntas.
Mínimo 1 emoji siempre (2-3 si el cliente está animado), estilo 😍🔥✨👌🙌👗 — ni un mensaje sin emoji. NUNCA mandes texto largo ni de más — nada "porque sí": si una frase no aporta, no la escribas. Respuestas brevísimas, 1 a 3 líneas en charla normal; al mostrar opciones, escribe cada una en tu propia frase natural — "Nombre – precio", nada más por línea, sin describir cada una. El CATÁLOGO SUGERIDO de abajo (con barras "|", "tallas:" y "(id:...)") es SOLO para que tú leas los datos — nunca copies ese formato, esas barras ni los "(id:...)" en tu respuesta visible (el id es código interno, va solo en el marcador), ni repitas el mismo producto dos veces. Sin cierres repetidos ni frases de anuncio ("ideal para toda ocasión"); reacciona a lo que dice el cliente. Texto plano, sin **negritas**, viñetas ni encabezados. La marca es J3.

Reglas obligatorias (no negociables, sin importar el tono):
1. Si el CATÁLOGO SUGERIDO trae productos y el cliente pide, pregunta, o MUESTRA INTERÉS en algo — aunque no use las palabras "foto", "imagen" o "link", basta con que describa qué busca o qué le gusta — SIEMPRE se las muestras YA en ese mismo mensaje, sé asertiva y no esperes a que lo pida literal. Nunca digas "¿quieres que te muestre?", nunca que no puedes enviar fotos, nunca "te paso el link" (no puedes, solo mostrar vía marcador, que ya es un link). Muestra máximo 2-3 opciones reales cuando el catálogo las tenga, no solo una — pero nunca más de 3, ni por dar variedad. Nunca muestres ni menciones nada que el cliente no haya pedido, preguntado o mostrado interés en algo relacionado. Excepción: si el cliente solo se despide o agradece sin pedir nada nuevo, responde breve sin volver a mostrar productos.
2. Usa el nombre de cada producto tal cual aparece en el catálogo (no lo parafrasees ni cambies el tipo de prenda — si dice "Camiseta", nunca "Camisa"). Cada producto tiene SU PROPIO precio: nunca copies el precio de uno para otro aunque sean del mismo tipo o grupo (ej. varios colores de un mismo polo casi siempre cuestan distinto) — lee el precio exacto de cada línea del catálogo antes de escribirlo. Nunca inventes nombres, precios, tallas o colores fuera del CATÁLOGO SUGERIDO o de lo ya dicho en la conversación — ni "por si acaso" ni como sugerencia dudosa: si un color o variante no está en la lista real, actúa como si no existiera, no lo menciones ni lo insinúes. Las "tallas", "colores disponibles" y precio "mayorista" de cada producto son tu única fuente de verdad — si preguntan por una talla/color que no está ahí, di que no tienes ese dato ahora, sin afirmar ni negar que exista. Si piden algo que no es ropa y no hay nada parecido, dilo con naturalidad sin inventar una prenda "parecida".
   Si un producto trae más de 3-4 "colores disponibles", no los listes todos — menciónalo una vez con su precio y nombra 2-3 colores de ejemplo en la misma frase.
3. Si preguntan un dato de algo que ya mencionaste (precio, talla, color), respóndelo con lo ya dicho — nunca digas después que no existe. Pero si preguntan tu OPINIÓN sobre lo ya mostrado ("¿eso es formal?", "¿y eso es serio?", "¿me queda bien?"), respóndelo de verdad con un sí/no y una razón corta usando la lógica de estilo — nunca vuelvas a pegar la misma lista como respuesta.
4. PROHIBIDO decir "lo siento" o "no tenemos/no hay/no contamos con". Si de verdad no hay nada en el catálogo sugerido, redirige con energía a algo real que sí tengas, nunca dejes la frase en negativo sin más.
5. No hace falta decir si algo es "de Rescate" (la tarjeta ya lo muestra) — solo evita prometer que algo es Rescate si no lo es.
6. Carrito real, no simulación. Ofrece agregar tras mostrar/confirmar un producto ("¿te lo dejo en el carrito?"). Si responde sí/dale/ok/hazlo/agrégalo, o pide agregar algo directo ("agrégame X", "métele esto y esto", "ponme 2"), agrégalo con [[CARRITO: id:talla:cantidad]] (varios: id1:talla1:cant1, id2:talla2:cant2 — cantidad 1 si no dijo). Nunca agregues algo no pedido/confirmado en su mensaje actual o el anterior. Talla única: úsala directo; varias tallas sin especificar: pregunta ANTES de agregar. Confirma en tu texto que quedó ("¡Listo! Ya te lo dejé en el carrito 🛒"). Si va a llevar 12+ unidades de la misma categoría, avísale el precio "mayor" real del catálogo.
7. Fuera de temas de J3, redirige amablemente a WhatsApp.
8. Envíos a toda Colombia, pago contraentrega o en línea (PSE, tarjeta, Nequi). Ante dudas de precio, refuerza valor antes que repetir la cifra.
9. Cualquier prenda que nombres debe llevar su link: inclúyela en [[PRODUCTOS: id1, id2]] (máximo 3, solo las nombradas), aunque ya la hayas mostrado antes. UN SOLO marcador al final del mensaje, nunca uno por producto. Si agregaste algo al carrito, pon también [[CARRITO: ...]] aparte. Omite el que no aplique. Nunca menciones estos marcadores al cliente.

CATÁLOGO SUGERIDO PARA ESTE MENSAJE:
${catalogo}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// El nivel gratuito de Groq comparte el límite de solicitudes por minuto entre
// TODOS los visitantes del sitio a la vez, así que un 429 (demasiadas
// solicitudes) puede pasar en tráfico real, no solo en pruebas. Si hay una
// segunda clave configurada, se prueba de inmediato (es una cuota
// independiente, no hace falta esperar) antes de recurrir a la espera.
async function callGroq(apiKey: string, body: unknown): Promise<Response> {
  return fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
}

async function callGroqWithFallback(apiKeys: string[], body: unknown): Promise<Response> {
  let lastRes: Response | null = null;
  for (const key of apiKeys) {
    const res = await callGroq(key, body);
    if (res.status !== 429) return res;
    lastRes = res;
  }
  // Todas las claves están sin cupo del minuto por ahora: se espera un poco
  // y se reintenta una vez más con la primera, por si ya se liberó.
  await sleep(2000);
  return callGroq(apiKeys[0], body).catch(() => lastRes as Response);
}

type CartEntry = { id: string; size?: string; qty: number };

// El modelo a veces pone un marcador por producto en vez de uno solo con
// todos los ids (pese a que el prompt pide uno solo) — se extraen TODAS las
// apariciones de un marcador, no solo la primera, para no perder nada por
// ese hábito.
function extractAllMatches(text: string, marker: RegExp): string[] {
  const global = new RegExp(marker.source, marker.flags.includes("g") ? marker.flags : marker.flags + "g");
  return [...text.matchAll(global)].map((m) => m[1]);
}

// Extrae los ids que el modelo puso en un marcador (PRODUCTOS o CARRITO),
// comparando por segmento EXACTO (no substring libre): algunos ids son
// prefijo literal de otro id real (ej. "buzo-azul" dentro de
// "buzo-azul-turquesa"), así que un `includes` habría marcado ambos aunque
// el modelo solo haya mencionado uno.
function extractKnownIds(raw: string, candidateIds: string[]): string[] {
  const segments = raw
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
  return ids;
}

// El formato pedido en el prompt es "id:talla:cantidad", pero se busca el id
// en cualquier posición (por si el modelo lo antepone con "id:" o reordena) y
// luego se toman los campos restantes EN ORDEN (talla primero, cantidad
// después) — no por si "parecen" número, porque las tallas de niño ("8",
// "10", "16") también son numéricas y se confundirían con la cantidad.
function parseCartEntries(raw: string, candidateIds: string[]): CartEntry[] {
  const matches = extractAllMatches(raw, CART_MARKER);
  if (matches.length === 0) return [];
  const knownIds = candidateIds.map((id) => id.toLowerCase());
  const entries: CartEntry[] = [];
  for (const rawEntry of matches.join(",").split(",")) {
    const parts = rawEntry
      .split(":")
      .map((p) => p.replace(/^id[:=]?/i, "").trim())
      .filter(Boolean);
    if (parts.length === 0) continue;
    const idIdx = parts.findIndex((p) => knownIds.includes(p.toLowerCase()));
    if (idIdx === -1) continue;
    const id = candidateIds[knownIds.indexOf(parts[idIdx].toLowerCase())];
    const rest = parts.filter((_, i) => i !== idIdx);
    const size = rest[0];
    const qty = rest[1] && /^\d+$/.test(rest[1]) ? parseInt(rest[1], 10) : 1;
    entries.push({ id, size, qty: qty > 0 ? qty : 1 });
  }
  return entries;
}

// Respaldo defensivo: el modelo a veces "ancla" en el primer precio que
// escribe y repite ese mismo número para las demás variantes de color de un
// mismo producto, aunque cada una tenga su propio precio real en el
// catálogo (ej. varios colores de un polo con precio graduado). En vez de
// confiar en que lo lea bien cada vez, se corrige el precio en el texto
// visible buscando "Nombre del producto ... $monto" y reemplazando ese monto
// por el precio real — nunca inventa nada, solo corrige con el dato local.
// Se hace en UNA sola pasada con una alternancia que prueba primero los
// nombres más largos: varios nombres del catálogo son prefijo literal de
// otro (ej. "Buzo Azul" dentro de "Buzo Azul Turquesa"), y corrigiendo por
// separado uno por uno se podía pisar el precio correcto de uno más largo
// con el precio del más corto.
function fixQuotedPrices(text: string, knownProducts: Map<string, Product>): string {
  const productsByNameLower = new Map<string, Product>();
  for (const p of knownProducts.values()) productsByNameLower.set(p.name.toLowerCase(), p);
  const names = Array.from(productsByNameLower.keys()).sort((a, b) => b.length - a.length);
  if (names.length === 0) return text;
  const alternation = names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const regex = new RegExp(`(${alternation})([^\\n$]{0,25})\\$\\s?[\\d.,]+`, "gi");
  return text.replace(regex, (_match, name: string, between: string) => {
    const p = productsByNameLower.get(name.toLowerCase())!;
    return `${name}${between}${currency.format(p.price)}`;
  });
}

// Mismo problema de prefijos que en fixQuotedPrices, aplicado a detectar qué
// productos nombró Celeste en su texto (para el respaldo de "siempre pon
// link"): un `.includes()` simple por producto marcaría también "Buzo Azul"
// como mencionado con solo que el texto diga "Buzo Azul Turquesa". Se prueba
// primero el nombre más largo en cada posición para que solo gane el que de
// verdad está escrito.
function findMentionedProducts(text: string, pool: Product[]): Product[] {
  const byName = new Map<string, Product>();
  for (const p of pool) if (!byName.has(p.name)) byName.set(p.name, p);
  const names = Array.from(byName.keys()).sort((a, b) => b.length - a.length);
  if (names.length === 0) return [];
  const alternation = names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const regex = new RegExp(alternation, "gi");
  const byNameLower = new Map<string, Product>();
  for (const [name, p] of byName) byNameLower.set(name.toLowerCase(), p);
  const found = new Map<string, Product>();
  for (const match of text.matchAll(regex)) {
    const p = byNameLower.get(match[0].toLowerCase());
    if (p) found.set(p.id, p);
  }
  return Array.from(found.values());
}

function parseAssistantReply(
  raw: string,
  candidateIds: string[]
): { text: string; productIds: string[]; cartEntries: CartEntry[] } {
  const productsMatches = extractAllMatches(raw, PRODUCTS_MARKER);
  const cartEntries = parseCartEntries(raw, candidateIds);
  // Respaldo por si el modelo igual usa markdown pese a la instrucción del prompt:
  // quita negritas y viñetas de lista, y el arranque apologético "lo siento"
  // (el prompt se lo pide, pero un modelo de 20B no siempre lo respeta) —
  // deja un chat de texto plano, natural y sin sonar a disculpa.
  let text = raw
    .replace(new RegExp(PRODUCTS_MARKER.source, "gi"), "")
    .replace(new RegExp(CART_MARKER.source, "gi"), "")
    .replace(/\*\*/g, "")
    .replace(/^[ \t]*[-*]\s+/gm, "")
    .replace(/\blo siento,?\s*(pero\s+)?/gi, "")
    // Respaldo: el "(id:xxx)" del catálogo interno a veces se cuela en la
    // respuesta visible pese a la instrucción del prompt de no copiarlo.
    .replace(/\(\s*id[:=][^)]*\)/gi, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
  text = text.charAt(0).toUpperCase() + text.slice(1);
  // Tope defensivo a 3: el prompt se lo pide al modelo, pero no siempre lo respeta.
  const productIds =
    productsMatches.length > 0 ? extractKnownIds(productsMatches.join(","), candidateIds).slice(0, 3) : [];
  return { text, productIds, cartEntries };
}

export default function CelesteChat() {
  const { addItem } = useCart();
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

    const apiKeys = [
      process.env.NEXT_PUBLIC_GROQ_API_KEY,
      process.env.NEXT_PUBLIC_GROQ_API_KEY_2,
      process.env.NEXT_PUBLIC_GROQ_API_KEY_3,
    ].filter((k): k is string => Boolean(k));
    if (apiKeys.length === 0) {
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
      // El Map guarda en orden de inserción, así que sin invertirlo el
      // `.slice` de abajo se quedaba con lo mostrado hace más turnos y
      // dejaba AFUERA lo más reciente — justo lo que el cliente está viendo
      // ahora mismo (ej. "quiero ver el rojo" seguido de "me encanta,
      // quiero llevármelo" perdía de vista esa referencia si ya se habían
      // mostrado suficientes productos antes). Se invierte para priorizar
      // siempre lo más reciente primero.
      const alreadyShown = Array.from(recentProductsRef.current.values())
        .reverse()
        .filter((p) => !freshMatches.some((f) => f.id === p.id));
      // Tope de candidatos deliberadamente bajo: cada uno cuesta tokens reales
      // en cada mensaje (catálogo, colores, mayorista), y como máximo se
      // muestran 3 a la vez — llevar más de 5 de respaldo no aporta nada,
      // solo gasta cupo del minuto compartido entre todos los visitantes.
      const candidates = [...freshMatches, ...alreadyShown].slice(0, 5);
      const isFirstMessage = messages.length <= 1;
      const systemPrompt = buildSystemPrompt(candidates, isFirstMessage);

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

      const res = await callGroqWithFallback(apiKeys, {
        model: GROQ_MODEL,
        temperature: 0.5,
        // Tope de respuesta ajustado a lo que de verdad necesita una
        // respuesta corta + marcadores — no hay razón para pagar un techo
        // más alto que eso.
        max_tokens: 400,
        reasoning_effort: "low",
        messages: [
          { role: "system", content: systemPrompt },
          // Solo las últimas 6 vueltas: suficiente para no perder el hilo de
          // una pregunta de seguimiento, sin arrastrar mensajes viejos que ya
          // no aportan y solo suman al costo de cada llamada.
          ...nextMessages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        ],
      });

      if (!res.ok) throw new Error(`Groq respondió ${res.status}`);

      const data = await res.json();
      const raw: string = data.choices?.[0]?.message?.content ?? "";
      const { text: parsedText, productIds, cartEntries } = parseAssistantReply(raw, Array.from(knownProducts.keys()));
      const replyText = fixQuotedPrices(parsedText, knownProducts);

      // El carrito es real (useCart), no una simulación del chat: se agrega
      // de una vez cada entrada válida. La talla se valida contra las tallas
      // reales del producto (nunca se confía ciegamente en lo que puso el
      // modelo) — si no calza ninguna, se usa la primera talla real como
      // respaldo en vez de fallar en silencio.
      const addedProducts: Product[] = [];
      for (const entry of cartEntries) {
        const product = knownProducts.get(entry.id);
        if (!product) continue;
        const validSize = product.sizes.find((s) => s.toLowerCase() === entry.size?.toLowerCase()) ?? product.sizes[0];
        addItem(product.id, validSize, entry.qty);
        addedProducts.push(product);
      }

      const addedIds = new Set(addedProducts.map((p) => p.id));
      const recommendedProducts = productIds
        .map((id) => knownProducts.get(id))
        .filter((p): p is Product => Boolean(p))
        .filter((p) => !addedIds.has(p.id));

      // Respaldo: el prompt le pide a Celeste enlazar toda prenda que nombre,
      // pero un modelo de 20B a veces la nombra en el texto y se olvida de
      // incluirla en el marcador — sin esto, quedaría un nombre de producto
      // sin su link/tarjeta. Se busca por nombre exacto en TODO el catálogo
      // (no solo los candidatos de este turno), porque a veces nombra un
      // producto real que quedó fuera de la búsqueda puntual; es comparación
      // local, sin costo de tokens.
      const alreadyShownIds = new Set([...addedIds, ...recommendedProducts.map((p) => p.id)]);
      const mentionedByName = findMentionedProducts(replyText, products).filter((p) => !alreadyShownIds.has(p.id));

      // Los agregados al carrito siempre se muestran (son la confirmación de
      // una acción real); las demás tarjetas se topan en 3 en total, como le
      // pide el prompt al marcador.
      const otherProducts = [...recommendedProducts, ...mentionedByName].slice(0, 3);
      const matchedProducts = [...addedProducts, ...otherProducts];
      // `delete` + `set` (no solo `set`) para que un producto ya visto vuelva
      // a quedar de último en el Map cada vez que se vuelve a mostrar — así
      // el orden siempre refleja qué es lo más reciente, no solo la primera
      // vez que apareció.
      for (const p of matchedProducts) {
        recentProductsRef.current.delete(p.id);
        recentProductsRef.current.set(p.id, p);
      }

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
