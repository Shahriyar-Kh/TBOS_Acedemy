import crypto from "node:crypto";

/**
 * Google Calendar & Google Meet API Integration Service
 * Uses Google Service Account with OAuth2 JWT Bearer assertion (RFC 7523)
 * Provides automatic Meet conference creation and graceful fallback.
 */

export interface GoogleCalendarEventParams {
  title: string;
  description?: string | null;
  sessionDate: string; // YYYY-MM-DD
  startTime: string;   // HH:mm
  endTime: string;     // HH:mm
  timezone?: string;   // Default: Asia/Karachi
  attendees?: string[]; // Array of email addresses
  location?: string | null;
  createMeetConference?: boolean;
}

export interface GoogleCalendarEventResult {
  success: boolean;
  configured: boolean;
  eventId?: string;
  meetLink?: string;
  htmlLink?: string;
  error?: string;
}

interface CachedToken {
  accessToken: string;
  expiresAt: number; // unix ms
}

let cachedAuthToken: CachedToken | null = null;

/**
 * Returns configuration status of Google Service Account credentials.
 */
export function getGoogleCalendarConfig() {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() || null;
  const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY?.trim() || null;
  const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim() || "primary";

  const isConfigured = Boolean(
    serviceAccountEmail &&
    rawPrivateKey &&
    serviceAccountEmail.includes("@") &&
    rawPrivateKey.includes("PRIVATE KEY")
  );

  return {
    isConfigured,
    serviceAccountEmail,
    privateKey: rawPrivateKey ? rawPrivateKey.replace(/\\n/g, "\n") : null,
    calendarId,
  };
}

/**
 * Obtains an OAuth2 access token using RSA-SHA256 signed JWT assertion.
 */
async function getAccessToken(): Promise<string> {
  const config = getGoogleCalendarConfig();
  if (!config.isConfigured || !config.serviceAccountEmail || !config.privateKey) {
    throw new Error("GOOGLE_CREDENTIALS_NOT_CONFIGURED");
  }

  const now = Date.now();
  if (cachedAuthToken && cachedAuthToken.expiresAt > now + 60000) {
    return cachedAuthToken.accessToken;
  }

  const iat = Math.floor(now / 1000);
  const exp = iat + 3600; // 1 hour

  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const claims = Buffer.from(
    JSON.stringify({
      iss: config.serviceAccountEmail,
      scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
      aud: "https://oauth2.googleapis.com/token",
      exp,
      iat,
    })
  ).toString("base64url");

  const sign = crypto.createSign("RSA-SHA256");
  sign.update(`${header}.${claims}`);
  const signature = sign.sign(config.privateKey, "base64url");
  const jwt = `${header}.${claims}.${signature}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const errBody = await tokenRes.text();
    throw new Error(`Google OAuth2 token exchange failed: ${tokenRes.status} ${errBody}`);
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;
  const expiresIn = tokenData.expires_in || 3600;

  cachedAuthToken = {
    accessToken,
    expiresAt: now + expiresIn * 1000,
  };

  return accessToken;
}

/**
 * Converts YYYY-MM-DD + HH:mm in a given timezone to ISO 8601 string.
 */
function toIsoDateTime(dateStr: string, timeStr: string, timezone = "Asia/Karachi"): string {
  // Asia/Karachi standard offset is UTC+5
  const offset = timezone === "Asia/Karachi" ? "+05:00" : "+05:00";
  return `${dateStr}T${timeStr}:00${offset}`;
}

/**
 * Creates an event in Google Calendar with optional Google Meet conference generation.
 */
export async function createGoogleCalendarEvent(
  params: GoogleCalendarEventParams
): Promise<GoogleCalendarEventResult> {
  const config = getGoogleCalendarConfig();
  if (!config.isConfigured) {
    return {
      success: false,
      configured: false,
      error: "Google Calendar service credentials are not configured. Manual meeting link entry supported.",
    };
  }

  try {
    const accessToken = await getAccessToken();
    const tz = params.timezone || "Asia/Karachi";
    const startDateTime = toIsoDateTime(params.sessionDate, params.startTime, tz);
    const endDateTime = toIsoDateTime(params.sessionDate, params.endTime, tz);

    const attendeesList = (params.attendees || [])
      .filter((email) => email && email.includes("@"))
      .map((email) => ({ email }));

    const eventPayload: any = {
      summary: params.title,
      description: params.description || `TBOS Academy Live Session\nHosted by TechBuilt Open School`,
      location: params.location || "Online (Google Meet)",
      start: {
        dateTime: startDateTime,
        timeZone: tz,
      },
      end: {
        dateTime: endDateTime,
        timeZone: tz,
      },
      attendees: attendeesList,
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 10 },
        ],
      },
    };

    if (params.createMeetConference !== false) {
      eventPayload.conferenceData = {
        createRequest: {
          requestId: `tbos-meet-${crypto.randomUUID()}`,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      };
    }

    const calendarUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      config.calendarId
    )}/events?conferenceDataVersion=1&sendUpdates=all`;

    const response = await fetch(calendarUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        configured: true,
        error: `Google Calendar API error (${response.status}): ${errorText}`,
      };
    }

    const eventData = await response.json();
    const meetEntryPoint = eventData.conferenceData?.entryPoints?.find(
      (ep: any) => ep.entryPointType === "video"
    );
    const meetLink = meetEntryPoint?.uri || eventData.hangoutLink || null;

    return {
      success: true,
      configured: true,
      eventId: eventData.id,
      meetLink: meetLink || undefined,
      htmlLink: eventData.htmlLink,
    };
  } catch (err: any) {
    return {
      success: false,
      configured: true,
      error: err.message || "Failed to create Google Calendar event",
    };
  }
}

/**
 * Updates an existing Google Calendar event.
 */
export async function updateGoogleCalendarEvent(
  eventId: string,
  params: Partial<GoogleCalendarEventParams>
): Promise<GoogleCalendarEventResult> {
  const config = getGoogleCalendarConfig();
  if (!config.isConfigured) {
    return {
      success: false,
      configured: false,
      error: "Google Calendar service credentials are not configured.",
    };
  }

  try {
    const accessToken = await getAccessToken();
    const tz = params.timezone || "Asia/Karachi";

    const patchPayload: any = {};
    if (params.title) patchPayload.summary = params.title;
    if (params.description !== undefined) patchPayload.description = params.description;
    if (params.sessionDate && params.startTime) {
      patchPayload.start = {
        dateTime: toIsoDateTime(params.sessionDate, params.startTime, tz),
        timeZone: tz,
      };
    }
    if (params.sessionDate && params.endTime) {
      patchPayload.end = {
        dateTime: toIsoDateTime(params.sessionDate, params.endTime, tz),
        timeZone: tz,
      };
    }
    if (params.attendees) {
      patchPayload.attendees = params.attendees
        .filter((email) => email && email.includes("@"))
        .map((email) => ({ email }));
    }

    const calendarUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      config.calendarId
    )}/events/${encodeURIComponent(eventId)}?sendUpdates=all`;

    const response = await fetch(calendarUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patchPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        configured: true,
        error: `Google Calendar API error (${response.status}): ${errorText}`,
      };
    }

    const eventData = await response.json();
    const meetEntryPoint = eventData.conferenceData?.entryPoints?.find(
      (ep: any) => ep.entryPointType === "video"
    );
    const meetLink = meetEntryPoint?.uri || eventData.hangoutLink || undefined;

    return {
      success: true,
      configured: true,
      eventId: eventData.id,
      meetLink,
      htmlLink: eventData.htmlLink,
    };
  } catch (err: any) {
    return {
      success: false,
      configured: true,
      error: err.message || "Failed to update Google Calendar event",
    };
  }
}

/**
 * Deletes an event from Google Calendar.
 */
export async function deleteGoogleCalendarEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
  const config = getGoogleCalendarConfig();
  if (!config.isConfigured) {
    return { success: true }; // Nothing to delete from external calendar if not configured
  }

  try {
    const accessToken = await getAccessToken();
    const calendarUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      config.calendarId
    )}/events/${encodeURIComponent(eventId)}?sendUpdates=all`;

    const response = await fetch(calendarUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok && response.status !== 404 && response.status !== 410) {
      const errText = await response.text();
      return { success: false, error: `Calendar delete error (${response.status}): ${errText}` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete Google Calendar event" };
  }
}
