/** Normalises an Indian mobile number to digits with country code, e.g. "919876543210". */
export function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

/** Click-to-chat link with a specific number. */
export function whatsAppChatUrl(phone: string, text = ""): string {
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${toWhatsAppNumber(phone)}${q}`;
}

/** Opens WhatsApp with a pre-written message; the user picks the contact. */
export function whatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
