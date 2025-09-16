/**
 * Feature flags and A/B testing configuration
 * These flags control various aspects of the outcomes system
 */

export interface FeatureFlags {
  // Core feature toggles
  showConfetti: boolean;
  enableBadgeSharing: boolean;
  showLeaderboard: boolean;
  enableQuickWins: boolean;
  
  // A/B testing variants
  ctaTextVariant: 'default' | 'urgent' | 'benefit';
  incentiveDisplay: 'always' | 'hover' | 'never';
  badgeAnimation: 'bounce' | 'glow' | 'pulse' | 'none';
  
  // Personalization
  enableIndustryPersonalization: boolean;
  showCompetitorComparison: boolean;
  dynamicPricing: boolean;
  
  // UI/UX experiments
  outcomeLayout: 'card' | 'banner' | 'sidebar';
  scoreDisplayStyle: 'minimal' | 'detailed' | 'gauge';
  colorTheme: 'terminal' | 'modern' | 'brand';
  
  // Advanced features
  enableAnalytics: boolean;
  enableEmailCapture: boolean;
  showSocialProof: boolean;
  enableRetargeting: boolean;
}

// Default flag configuration
export const DEFAULT_FLAGS: FeatureFlags = {
  // Core features - enabled by default
  showConfetti: false,
  enableBadgeSharing: true,
  showLeaderboard: true,
  enableQuickWins: true,
  
  // A/B tests - default variants
  ctaTextVariant: 'default',
  incentiveDisplay: 'always',
  badgeAnimation: 'glow',
  
  // Personalization - enabled for better UX
  enableIndustryPersonalization: true,
  showCompetitorComparison: false, // Disabled until we have data
  dynamicPricing: false, // Disabled for now
  
  // UI/UX - terminal theme matches existing design
  outcomeLayout: 'card',
  scoreDisplayStyle: 'detailed',
  colorTheme: 'terminal',
  
  // Advanced features
  enableAnalytics: true,
  enableEmailCapture: true,
  showSocialProof: true,
  enableRetargeting: false // Privacy-first approach
};

// CTA text variants for A/B testing
export const CTA_VARIANTS = {
  default: {
    critical: {
      primary: "Fix my site now",
      secondary: "Email me the rescue plan (PDF)"
    },
    needs_boost: {
      primary: "Apply quick wins",
      secondary: "Send me the full report"
    },
    pass: {
      primary: "Book a growth tune-up",
      secondary: "Share my badge"
    }
  },
  urgent: {
    critical: {
      primary: "Emergency site repair",
      secondary: "Rush me the fix plan"
    },
    needs_boost: {
      primary: "Boost now (5 min fixes)",
      secondary: "Get instant improvements"
    },
    pass: {
      primary: "Maximize your edge",
      secondary: "Show off your badge"
    }
  },
  benefit: {
    critical: {
      primary: "Recover lost visitors",
      secondary: "Get my recovery roadmap"
    },
    needs_boost: {
      primary: "Unlock hidden gains",
      secondary: "See my potential wins"
    },
    pass: {
      primary: "Optimize for more growth",
      secondary: "Join the elite club"
    }
  }
};

// Badge animation configurations
export const BADGE_ANIMATIONS = {
  bounce: "animate-bounce",
  glow: "animate-pulse shadow-lg",
  pulse: "animate-ping",
  none: ""
};

// Environment-based flag overrides
export function getEnvironmentFlags(): Partial<FeatureFlags> {
  const env = import.meta.env.MODE;
  
  switch (env) {
    case 'development':
      return {
        enableAnalytics: false,
        enableRetargeting: false,
        showLeaderboard: true // Always show in dev for testing
      };
    
    case 'staging':
      return {
        enableAnalytics: true,
        enableRetargeting: false,
        showCompetitorComparison: true // Test with real data
      };
    
    case 'production':
      return {
        enableAnalytics: true,
        enableRetargeting: true,
        showCompetitorComparison: false // Conservative in prod
      };
    
    default:
      return {};
  }
}

// Feature flag resolver with environment overrides
export function getFeatureFlags(): FeatureFlags {
  const envOverrides = getEnvironmentFlags();
  return { ...DEFAULT_FLAGS, ...envOverrides };
}

// Utility functions for flag checking
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[flag] as boolean;
}

export function getVariant<T extends keyof FeatureFlags>(flag: T): FeatureFlags[T] {
  const flags = getFeatureFlags();
  return flags[flag];
}

// A/B testing user assignment (simple hash-based)
export function assignUserToVariant(userId: string, variants: string[]): string {
  if (variants.length === 0) return '';
  
  // Simple hash function for consistent assignment
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const index = Math.abs(hash) % variants.length;
  return variants[index];
}

// Analytics event names for tracking
export const ANALYTICS_EVENTS = {
  OUTCOME_VIEWED: 'outcome_viewed',
  CTA_CLICKED: 'cta_clicked',
  BADGE_SHARED: 'badge_shared',
  QUICK_WINS_OPENED: 'quick_wins_opened',
  REPORT_REQUESTED: 'report_requested',
  CALENDAR_OPENED: 'calendar_opened',
  CONFETTI_TRIGGERED: 'confetti_triggered'
} as const;

export type AnalyticsEvent = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];