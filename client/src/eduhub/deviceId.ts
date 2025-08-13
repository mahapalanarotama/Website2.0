// Utility to get deviceId using FingerprintJS
import FingerprintJS from '@fingerprintjs/fingerprintjs';

let cachedDeviceId: string | null = null;

export async function getDeviceId(): Promise<string> {
  if (cachedDeviceId) return cachedDeviceId;
  // Try localStorage first
  const local = localStorage.getItem('eduhub_deviceid');
  if (local) {
    cachedDeviceId = local;
    return local;
  }
  // Generate fingerprint
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  const id = result.visitorId;
  localStorage.setItem('eduhub_deviceid', id);
  cachedDeviceId = id;
  return id;
}
