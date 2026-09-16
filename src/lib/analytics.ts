export interface AnalyticsInfo {
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  browser: 'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'Opera' | 'Other';
  referrer: string;
}

export function parseAnalytics(userAgent: string | null, rawReferrer: string | null): AnalyticsInfo {
  const ua = (userAgent || '').toLowerCase();
  
  // 1. Device Type
  let deviceType: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';
  if (/ipad|tablet|playbook|silk|(android(?!.*mobi))/i.test(ua)) {
    deviceType = 'Tablet';
  } else if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    deviceType = 'Mobile';
  }

  // 2. Browser Detection
  let browser: 'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'Opera' | 'Other' = 'Other';
  if (ua.includes('edg/')) {
    browser = 'Edge';
  } else if (ua.includes('opr/') || ua.includes('opera')) {
    browser = 'Opera';
  } else if (ua.includes('chrome') || ua.includes('crios')) {
    browser = 'Chrome';
  } else if (ua.includes('firefox') || ua.includes('fxios')) {
    browser = 'Firefox';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
  }

  // 3. Referrer Clean-up
  let referrer = 'Direct / None';
  if (rawReferrer && rawReferrer.trim() !== '') {
    try {
      const refUrl = new URL(rawReferrer);
      const host = refUrl.hostname.replace(/^www\./, '');
      if (host.includes('google')) referrer = 'Google';
      else if (host.includes('t.co') || host.includes('twitter') || host.includes('x.com')) referrer = 'X / Twitter';
      else if (host.includes('linkedin')) referrer = 'LinkedIn';
      else if (host.includes('facebook') || host.includes('fb.me')) referrer = 'Facebook';
      else if (host.includes('reddit')) referrer = 'Reddit';
      else if (host.includes('github')) referrer = 'GitHub';
      else if (host.includes('youtube')) referrer = 'YouTube';
      else referrer = host || 'Other Website';
    } catch {
      referrer = 'Direct / None';
    }
  }

  return {
    deviceType,
    browser,
    referrer,
  };
}
