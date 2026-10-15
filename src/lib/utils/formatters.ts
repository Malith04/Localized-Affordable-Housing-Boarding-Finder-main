/**
 * Formats a number into Sri Lankan Rupee currency format (e.g. Rs. 18,500)
 */
export function formatLKR(amount: number): string {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(amount).replace('LKR', 'Rs.');
}

/**
 * Calculates human-readable distance and estimated walking time
 * (Average student walking speed: 4.8 km/h or ~80 meters per minute)
 */
export function formatDistanceAndWalkTime(meters?: number): { distanceText: string; walkTimeText: string } {
  if (meters === undefined || meters === null) {
    return { distanceText: 'Near campus', walkTimeText: 'Walking distance' };
  }

  const distanceText = meters < 1000 
    ? `${Math.round(meters)}m` 
    : `${(meters / 1000).toFixed(1)}km`;

  const walkMinutes = Math.max(1, Math.round(meters / 80));
  const walkTimeText = walkMinutes <= 60 
    ? `~${walkMinutes} min walk` 
    : `~${(walkMinutes / 60).toFixed(1)} hr commute`;

  return { distanceText, walkTimeText };
}

/**
 * Normalizes Sri Lankan phone numbers to international E.164 format for WhatsApp.
 * Handles: 0771234567, 771234567, +94771234567, 0094771234567
 */
export function sanitizeSriLankanPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('94')) {
    return digits;
  }
  if (digits.startsWith('0')) {
    return `94${digits.slice(1)}`;
  }
  if (digits.length === 9) {
    return `94${digits}`;
  }
  return digits;
}

/**
 * Generates direct pre-filled WhatsApp deep link
 */
export function generateWhatsAppLink(params: {
  phone: string;
  hostName?: string;
  listingTitle: string;
  listingId: string;
}): string {
  const cleanPhone = sanitizeSriLankanPhone(params.phone);
  const greeting = params.hostName ? `Hello ${params.hostName}` : 'Hello';
  const shortId = params.listingId.slice(0, 8);
  const message = `${greeting}, I found your listing on Bodima.lk:\n"${params.listingTitle}" (Ref: #${shortId}).\nIs this boarding room still vacant for viewing?`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates a formatted Sinhala/English WhatsApp message summarizing
 * shortlisted boarding rooms to share directly with parents or family.
 */
export function generateParentShareWhatsAppLink(
  listings: any[],
  universityName: string,
  gateName?: string
): string {
  let message = `ආයුබෝවන් අම්මා / තාත්තා,\nමම ${universityName}${gateName ? ` (${gateName})` : ''} අසලින් සොයාගත් බෝඩිම් කාමර විස්තර මෙන්න:\n\n`;

  listings.slice(0, 4).forEach((listing, index) => {
    const depositTotal = listing.monthly_rent * listing.key_money_months;
    const walkTime = listing.distance_meters ? `~${Math.round(listing.distance_meters / 80)} min walk` : 'Walking distance';
    const dist = listing.distance_meters ? `${Math.round(listing.distance_meters)}m` : '';

    message += `🏠 ${index + 1}. ${listing.title}\n`;
    message += `• මාසික කුලිය (Rent): ${formatLKR(listing.monthly_rent)} / mo\n`;
    message += `• ඇප මුදල (Key Money): ${listing.key_money_months} mo (${formatLKR(depositTotal)})\n`;
    message += `• මුළු මූලික වියදම: ${formatLKR(listing.monthly_rent + depositTotal)}\n`;
    message += `• දුර: ${dist} (${walkTime})\n`;
    if (listing.transit_info?.bus_routes?.length) {
      message += `• බස් මාර්ග (Bus Routes): ${listing.transit_info.bus_routes.join(', ')}\n`;
    }
    message += `• විදුලි බිල: ${listing.electricity_type === 'separate_meter' ? 'Separate Sub-Meter' : listing.electricity_type === 'included' ? 'Free (Included)' : 'Split Bill'}\n`;
    message += `• ගේට්ටු නීති: ${listing.has_gate_key ? 'ස්වාධීන ගේට්ටු යතුරක් ඇත' : 'ඇතුළුවීමේ වේලාව සීමිතයි'}\n`;
    message += `• ඉඩම් හිමියාගේ දුරකථන අංකය: ${listing.host_phone || 'N/A'}\n\n`;
  });

  message += `(Bodima.lk - ශ්‍රී ලංකා විශ්වවිද්‍යාල ශිෂ්‍ය බෝඩිම් සෙවුම හරහා ලබාගන්නා ලදී)`;

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

