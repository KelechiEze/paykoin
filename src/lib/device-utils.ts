// src/lib/device-utils.ts

/**
 * Detect the type of device based on the user agent string.
 * @returns "Mobile" | "Tablet" | "Desktop"
 */
export const getDeviceType = (): string => {
  const userAgent = navigator.userAgent;
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile/.test(userAgent)) {
    return 'Mobile';
  }
  if (/Tablet|iPad|Nexus 7|Kindle|Surface/.test(userAgent)) {
    return 'Tablet';
  }
  return 'Desktop';
};

/**
 * Mock function to get a location based on IP.
 * In production, replace with a real IP geolocation API call.
 * @returns A promise that resolves to a location string.
 */
export const getLocationFromIP = async (): Promise<string> => {
  try {
    // This is a mock — replace with an actual API call like ipinfo.io or ipapi.com
    const mockLocations = [
      'New York, USA',
      'London, UK',
      'Tokyo, Japan',
      'Sydney, Australia',
      'Berlin, Germany',
    ];
    return mockLocations[Math.floor(Math.random() * mockLocations.length)];
  } catch (error) {
    console.error('Failed to get location:', error);
    return 'Unknown location';
  }
};
