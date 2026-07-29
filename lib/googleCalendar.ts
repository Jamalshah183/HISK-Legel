/**
 * Google Calendar Event Generator for HISK Tax Litigation System
 */

interface GoogleCalendarOptions {
  title: string;
  details?: string;
  location?: string;
  startDate: string; // ISO or YYYY-MM-DD
  startTime?: string; // HH:mm format (24h)
  durationHours?: number;
}

export function buildGoogleCalendarUrl(options: GoogleCalendarOptions): string {
  const { title, details, location, startDate, startTime = '10:00', durationHours = 1 } = options;

  try {
    // Parse start date and time
    const [year, month, day] = startDate.split('-').map(Number);
    const [hours, minutes] = startTime.split(':').map(Number);

    const start = new Date(year, month - 1, day, hours || 10, minutes || 0);
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

    const formatGCalDate = (d: Date) => {
      return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
    };

    const datesParam = `${formatGCalDate(start)}/${formatGCalDate(end)}`;

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: datesParam,
      details: details || '',
      location: location || 'Islamabad High Court / FBR RTO Tribunal',
      sprop: 'website:hisk-legal.pk',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  } catch (e) {
    console.error('Error generating Google Calendar URL:', e);
    return 'https://calendar.google.com';
  }
}
