export default function extractDateAndTime(utc: string, timeZone = "Asia/Karachi") {
    const date = new Date(utc);
  
    const dateStr = date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone
    });
  
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone
    });
  
    return { date: dateStr, time: timeStr };
  }
  