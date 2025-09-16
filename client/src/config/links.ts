/**
 * Centralized link management for the LaunchIn7 application
 * This file manages all external and internal links used throughout the app
 */

export interface LinkConfig {
  url: string;
  openInNewTab?: boolean;
  trackingParams?: Record<string, string>;
  title?: string;
  description?: string;
}

export interface SocialLink extends LinkConfig {
  platform: string;
  icon: string;
}

// Main application links
export const LINKS = {
  // Primary CTAs
  calendar: {
    url: "https://calendly.com/launchin7/website-consultation",
    openInNewTab: true,
    title: "Book Your Free Website Consultation",
    description: "Schedule a 30-minute call to discuss your website optimization",
    trackingParams: {
      utm_source: "app",
      utm_medium: "cta",
      utm_campaign: "consultation"
    }
  },
  
  // LaunchIn7 website links
  homepage: {
    url: "https://launchin7.com",
    openInNewTab: true,
    title: "LaunchIn7 - Website Rebuilt in 7 Days",
    trackingParams: {
      utm_source: "app",
      utm_medium: "link"
    }
  },
  
  contact: {
    url: "https://launchin7.com/contact",
    openInNewTab: true,
    title: "Contact LaunchIn7",
    trackingParams: {
      utm_source: "app",
      utm_medium: "contact"
    }
  },
  
  pricing: {
    url: "https://launchin7.com/pricing",
    openInNewTab: true,
    title: "LaunchIn7 Pricing Plans",
    trackingParams: {
      utm_source: "app",
      utm_medium: "pricing"
    }
  },
  
  portfolio: {
    url: "https://launchin7.com/portfolio",
    openInNewTab: true,
    title: "Our Work - LaunchIn7 Portfolio",
    trackingParams: {
      utm_source: "app",
      utm_medium: "portfolio"
    }
  },
  
  // Resource links
  blog: {
    url: "https://launchin7.com/blog",
    openInNewTab: true,
    title: "Web Performance Blog",
    trackingParams: {
      utm_source: "app",
      utm_medium: "content"
    }
  },
  
  faq: {
    url: "https://launchin7.com/faq",
    openInNewTab: true,
    title: "Frequently Asked Questions"
  },
  
  // Tool and resource links
  pageSpeedInsights: {
    url: "https://pagespeed.web.dev/",
    openInNewTab: true,
    title: "Google PageSpeed Insights"
  },
  
  gtmetrix: {
    url: "https://gtmetrix.com/",
    openInNewTab: true,
    title: "GTmetrix Performance Analysis"
  },
  
  lighthouse: {
    url: "https://developers.google.com/web/tools/lighthouse",
    openInNewTab: true,
    title: "Google Lighthouse"
  },
  
  // Quick wins resources
  quickWins: {
    imageOptimization: {
      url: "https://launchin7.com/guides/image-optimization",
      title: "Image Optimization Guide"
    },
    caching: {
      url: "https://launchin7.com/guides/browser-caching",
      title: "Browser Caching Setup"
    },
    coreWebVitals: {
      url: "https://launchin7.com/guides/core-web-vitals",
      title: "Core Web Vitals Optimization"
    },
    accessibility: {
      url: "https://launchin7.com/guides/web-accessibility",
      title: "Web Accessibility Checklist"
    }
  }
} as const;

// Social media links for sharing
export const SOCIAL_LINKS: Record<string, SocialLink> = {
  instagram: {
    platform: "Instagram",
    icon: "instagram",
    url: "https://www.instagram.com/",
    openInNewTab: true,
    title: "Share on Instagram"
  },
  
  linkedin: {
    platform: "LinkedIn",
    icon: "linkedin",
    url: "https://www.linkedin.com/sharing/share-offsite/",
    openInNewTab: true,
    title: "Share on LinkedIn"
  },
  
  facebook: {
    platform: "Facebook",
    icon: "facebook",
    url: "https://www.facebook.com/sharer/sharer.php",
    openInNewTab: true,
    title: "Share on Facebook"
  }
};

// Email templates and mailto links
export const EMAIL_LINKS = {
  support: {
    url: "mailto:support@launchin7.com",
    title: "Contact Support",
    description: "Get help with your website analysis"
  },
  
  sales: {
    url: "mailto:hello@launchin7.com",
    title: "Sales Inquiry",
    description: "Discuss your website rebuild project"
  },
  
  partnerships: {
    url: "mailto:partners@launchin7.com",
    title: "Partnership Opportunities",
    description: "Explore collaboration possibilities"
  }
};

// Utility functions for link management
export function buildUrl(baseConfig: LinkConfig, additionalParams?: Record<string, string>): string {
  const url = new URL(baseConfig.url);
  
  // Add tracking parameters
  if (baseConfig.trackingParams) {
    Object.entries(baseConfig.trackingParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  // Add additional parameters
  if (additionalParams) {
    Object.entries(additionalParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  return url.toString();
}

export function buildSocialShareUrl(
  platform: keyof typeof SOCIAL_LINKS,
  shareData: {
    text?: string;
    url?: string;
    title?: string;
    hashtags?: string[];
  }
): string {
  const socialLink = SOCIAL_LINKS[platform];
  const baseUrl = new URL(socialLink.url);
  
  switch (platform) {
    case 'instagram':
      // Instagram doesn't support direct URL sharing, so we'll handle this differently
      // This will be used for copy-to-clipboard functionality
      return baseUrl.toString();
      break;
      
    case 'linkedin':
      if (shareData.url) baseUrl.searchParams.set('url', shareData.url);
      if (shareData.title) baseUrl.searchParams.set('title', shareData.title);
      if (shareData.text) baseUrl.searchParams.set('summary', shareData.text);
      break;
      
    case 'facebook':
      if (shareData.url) baseUrl.searchParams.set('u', shareData.url);
      if (shareData.title) baseUrl.searchParams.set('quote', shareData.title);
      break;
  }
  
  return baseUrl.toString();
}

export function buildCalendarUrl(
  tier: 'critical' | 'needs_boost' | 'pass',
  domain?: string,
  scores?: Record<string, number>
): string {
  const baseConfig = LINKS.calendar;
  const additionalParams: Record<string, string> = {
    utm_content: tier
  };
  
  if (domain) {
    additionalParams.utm_term = domain;
  }
  
  if (scores) {
    additionalParams.scores = Object.values(scores).join(',');
  }
  
  return buildUrl(baseConfig, additionalParams);
}

export function buildReportEmailSubject(domain?: string, tier?: string): string {
  const baseSuject = "Website Performance Report";
  
  if (domain && tier) {
    return `${baseSuject} for ${domain} (${tier.toUpperCase()} tier)`;
  }
  
  if (domain) {
    return `${baseSuject} for ${domain}`;
  }
  
  return baseSuject;
}

// Badge sharing text templates
export const BADGE_SHARE_TEMPLATES = {
  bronze: {
    instagram: "Just analyzed my website performance and earned a Bronze badge! 🥉 Working on those optimizations with @LaunchIn7 #WebPerformance #BronzeBadge #WebsiteOptimization",
    linkedin: "Proud to share that our website just earned a Bronze performance badge! Always room for improvement and optimization. 🥉",
    facebook: "Our website just got graded and we earned a Bronze badge! Time to optimize and improve our performance! 🥉"
  },
  
  silver: {
    instagram: "Website performance check: Silver badge achieved! 🥈 Getting closer to that perfect score with @LaunchIn7 #WebPerformance #SilverBadge #DigitalExcellence",
    linkedin: "Excited to share our website just earned a Silver performance badge! Great progress on our optimization journey. 🥈",
    facebook: "Just got our website graded - Silver badge earned! 🥈 Making great progress on performance optimization!"
  },
  
  gold: {
    instagram: "🏆 Gold badge for website performance! So close to perfect scores. Thanks @LaunchIn7 for the analysis! #WebPerformance #GoldStandard #WebsiteGoals #DigitalWins",
    linkedin: "Thrilled to announce our website just earned a Gold performance badge! 🏆 High-performing websites drive better user experiences.",
    facebook: "Incredible news! Our website just earned a Gold performance badge! 🏆 All that optimization work is paying off!"
  },
  
  platinum: {
    instagram: "🚀 PLATINUM BADGE! Our website just scored in the top tier for performance! Peak optimization achieved with @LaunchIn7 #WebPerformance #Platinum #TopTier #WebsiteWins #DigitalExcellence",
    linkedin: "Proud to share our website just achieved PLATINUM status for performance! 🚀 When you prioritize user experience, it shows.",
    facebook: "AMAZING! Our website just earned a PLATINUM performance badge! 🚀 Top tier performance unlocked!"
  }
};

// Quick wins checklist URLs based on detected issues
export function getQuickWinUrl(issueType: string): string {
  const quickWinMap: Record<string, string> = {
    'images': buildUrl(LINKS.quickWins.imageOptimization),
    'caching': buildUrl(LINKS.quickWins.caching),
    'performance': buildUrl(LINKS.quickWins.coreWebVitals),
    'accessibility': buildUrl(LINKS.quickWins.accessibility),
    'default': buildUrl(LINKS.blog)
  };
  
  return quickWinMap[issueType] || quickWinMap.default;
}