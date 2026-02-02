const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID;
const GA4_API_SECRET = process.env.GA4_API_SECRET;

// Helper to SHA256 hash a string
async function hashString(str: string) {
  const msgBuffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

interface PurchaseEvent {
  user_id?: string;
  email?: string; // Will be hashed
  items?: {
    item_id: string;
    item_name: string;
  }[];
}

export async function sendPurchaseEvent(event: PurchaseEvent) {
  if (!GA4_MEASUREMENT_ID || !GA4_API_SECRET) {
    console.warn("GA4 credentials not set, skipping event");
    return;
  }

  const userData: any = {};
  if (event.email) {
    // Enhanced conversions need hashed email
    // Normalize and hash: lowercase, trim
    const normalizedEmail = event.email.trim().toLowerCase();
    const hashedEmail = await hashString(normalizedEmail);
    // sha256_email_address is the standard field for user_data
    userData.sha256_email_address = [hashedEmail];
  }

  // Construct the payload for GA4 Measurement Protocol
  const payload = {
    client_id: event.user_id || "unknown_client", // Required, can use user_id if persistent
    user_id: event.user_id, // Optional user-id feature
    events: [
      {
        name: "purchase", // Standard purchase event
        params: {
          // value: event.value,
          // currency: event.currency,
          items: event.items,
        },
      },
    ],
    // User data for Enhanced Conversions
    user_data: Object.keys(userData).length > 0 ? userData : undefined,
  };

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(
        `Failed to send GA4 event: ${response.status} ${response.statusText}`,
      );
      const text = await response.text();
      console.error(text);
    } else {
      console.log("GA4 purchase event sent successfully");
    }
  } catch (error) {
    console.error("Error sending GA4 event:", error);
  }
}
