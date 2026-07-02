export function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function checkAvailability(workingHours: any[]) {
  const now = new Date();
  const currentDay = now.getDay();

  const currentHoursStr = now.toTimeString().split(" ")[0].substring(0, 5);

  const todaySchedule = workingHours.find((wh) => wh.dayOfWeek === currentDay);

  if (!todaySchedule || todaySchedule.isClosed) {
    return {
      isOpenNow: false,
      todayOpeningHours: { open: "Closed", close: "Closed" },
    };
  }

  const isOpenNow =
    currentHoursStr >= todaySchedule.openTime &&
    currentHoursStr <= todaySchedule.closeTime;

  return {
    isOpenNow,
    todayOpeningHours: {
      open: todaySchedule.openTime,
      close: todaySchedule.closeTime,
    },
  };
}
