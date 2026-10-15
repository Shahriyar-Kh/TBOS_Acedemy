/**
 * iCalendar (RFC 5545) generator for TBOS Academy class sessions
 * Compatible with Google Calendar, Apple Calendar, Microsoft Outlook
 */

export interface CalendarSessionEvent {
  id: string;
  title: string;
  description?: string | null;
  sessionDate: string; // YYYY-MM-DD
  startTime: string;   // HH:mm
  endTime: string;     // HH:mm
  timezone?: string;   // e.g. "Asia/Karachi"
  meetingLink?: string | null;
  instructorName?: string | null;
  batchOrStudentName?: string | null;
}

/**
 * Converts a date string (YYYY-MM-DD) and time string (HH:mm) in a given timezone to an iCal UTC string (YYYYMMDDTHHMMSSZ)
 */
function formatUtcDateTime(dateStr: string, timeStr: string, timezone: string = "Asia/Karachi"): string {
  try {
    // If timezone is Asia/Karachi (UTC+5), subtract 5 hours to get UTC
    const [year, month, day] = dateStr.split("-").map(Number);
    const [hours, minutes] = timeStr.split(":").map(Number);
    
    // Create Date assuming local PKT (UTC+5) offset
    const date = new Date(Date.UTC(year, month - 1, day, hours - 5, minutes, 0));
    
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}00Z`;
  } catch {
    const cleanDate = dateStr.replace(/-/g, "");
    const cleanTime = timeStr.replace(/:/g, "") + "00";
    return `${cleanDate}T${cleanTime}Z`;
  }
}

/**
 * Generates an RFC 5545 compliant .ics calendar string for one or more sessions
 */
export function generateIcsCalendar(events: CalendarSessionEvent | CalendarSessionEvent[]): string {
  const eventList = Array.isArray(events) ? events : [events];
  const nowUtc = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const vEvents = eventList.map((evt) => {
    const dtStart = formatUtcDateTime(evt.sessionDate, evt.startTime, evt.timezone || "Asia/Karachi");
    const dtEnd = formatUtcDateTime(evt.sessionDate, evt.endTime, evt.timezone || "Asia/Karachi");
    const summary = evt.title ? evt.title.replace(/\n/g, " ") : "TBOS Academy Live Class";
    const location = evt.meetingLink?.trim() || "Online Class · TechBuilt Open School";

    const descParts: string[] = [];
    if (evt.description) descParts.push(evt.description);
    if (evt.instructorName) descParts.push(`Instructor: ${evt.instructorName}`);
    if (evt.batchOrStudentName) descParts.push(`Cohort/Student: ${evt.batchOrStudentName}`);
    if (evt.meetingLink) descParts.push(`Join Link: ${evt.meetingLink}`);
    descParts.push("Hosted by TechBuilt Open School (TBOS Academy)");

    const description = descParts.join("\\n").replace(/\r/g, "");

    return [
      "BEGIN:VEVENT",
      `UID:tbos-session-${evt.id}@techbuiltos.online`,
      `DTSTAMP:${nowUtc}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      "STATUS:CONFIRMED",
      "TRANSP:OPAQUE",
      "END:VEVENT",
    ].join("\r\n");
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TechBuilt Open School//TBOS Academy Timetable//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:TBOS Academy Schedule",
    "X-WR-TIMEZONE:Asia/Karachi",
    ...vEvents,
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Triggers a browser download of an .ics calendar file
 */
export function downloadIcsFile(filename: string, icsContent: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename.endsWith(".ics") ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

