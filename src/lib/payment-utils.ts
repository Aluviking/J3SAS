export const banks = [
  "Bancolombia",
  "Banco de Bogotá",
  "Davivienda",
  "BBVA Colombia",
  "Banco de Occidente",
  "Banco Popular",
  "Banco Caja Social",
  "Scotiabank Colpatria",
  "Banco AV Villas",
  "Banco Itaú",
];

export function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function detectCardBrand(cardNumber: string) {
  const digits = cardNumber.replace(/\D/g, "");
  if (/^4/.test(digits)) return "Visa";
  if (/^5[1-5]/.test(digits)) return "Mastercard";
  return null;
}

export function generateOrderNumber() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `J3-${Date.now().toString().slice(-6)}${rand}`;
}
