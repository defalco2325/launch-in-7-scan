import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Wrench, Rocket } from "lucide-react";

export type TierType = 'critical' | 'needs_boost' | 'pass';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface ScoreRange {
  min: number;
  max: number;
}

export interface OutcomeTier {
  type: TierType;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  bullets: string[];
  primaryCTA: {
    text: string;
    action: string;
    variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  };
  secondaryCTA: {
    text: string;
    action: string;
    variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  };
  incentive: string;
  badge: BadgeTier | null;
  confetti: boolean;
  gradient: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
}

export const BADGE_RANGES: Record<BadgeTier, ScoreRange> = {
  bronze: { min: 60, max: 74 },
  silver: { min: 75, max: 89 },
  gold: { min: 90, max: 97 },
  platinum: { min: 98, max: 100 }
};

export const OUTCOMES: Record<TierType, OutcomeTier> = {
  critical: {
    type: 'critical',
    icon: AlertTriangle,
    title: "🚨 Grounded: Your site isn't flight-ready.",
    subtitle: "Pages are loading slowly and key best practices are missing.",
    bullets: [
      "Heavy or unoptimized images slowing page loads",
      "Render-blocking JavaScript and CSS",
      "Missing caching strategies and CDN optimization"
    ],
    primaryCTA: {
      text: "Fix my site now",
      action: "openCalendar",
      variant: "destructive"
    },
    secondaryCTA: {
      text: "Email me the rescue plan (PDF)",
      action: "sendReport",
      variant: "outline"
    },
    incentive: "Free quick-fix checklist included",
    badge: null,
    confetti: false,
    gradient: "from-red-500 to-orange-600",
    theme: {
      primary: "text-red-400",
      secondary: "text-red-300",
      accent: "text-orange-400",
      background: "bg-red-950/20 border-red-800/30"
    }
  },
  needs_boost: {
    type: 'needs_boost',
    icon: Wrench,
    title: "⚙️ Almost There: A few tweaks = big wins.",
    subtitle: "We found optimization opportunities that could lift conversions.",
    bullets: [
      "Preload key fonts for faster text rendering",
      "Defer non-critical JavaScript execution",
      "Compress and optimize hero images"
    ],
    primaryCTA: {
      text: "Apply quick wins",
      action: "applyQuickWins",
      variant: "default"
    },
    secondaryCTA: {
      text: "Send me the full report",
      action: "sendReport",
      variant: "outline"
    },
    incentive: "Mini win-plan delivered via email",
    badge: null, // Will be determined by actual score
    confetti: false,
    gradient: "from-yellow-500 to-amber-600",
    theme: {
      primary: "text-yellow-400",
      secondary: "text-yellow-300",
      accent: "text-amber-400",
      background: "bg-yellow-950/20 border-yellow-800/30"
    }
  },
  pass: {
    type: 'pass',
    icon: Rocket,
    title: "🚀 Ready for Lift-Off!",
    subtitle: "You're in the top tier. Want to squeeze out that last 1–2s?",
    bullets: [
      "Maintain performance with weekly automated checks",
      "Fine-tune LCP and CLS for perfect scores",
      "A/B test hero sections for maximum impact"
    ],
    primaryCTA: {
      text: "Book a growth tune-up",
      action: "openCalendar",
      variant: "default"
    },
    secondaryCTA: {
      text: "Share my badge",
      action: "shareBadge",
      variant: "outline"
    },
    incentive: "Leaderboard placement (opt-in available)",
    badge: null, // Will be determined by actual score
    confetti: true,
    gradient: "from-green-500 to-emerald-600",
    theme: {
      primary: "text-green-400",
      secondary: "text-green-300",
      accent: "text-emerald-400",
      background: "bg-green-950/20 border-green-800/30"
    }
  }
};

export interface ScoreSet {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
}

export function calculateOverallScore(scores: ScoreSet): number {
  const { performance, accessibility, bestPractices, seo } = scores;
  // Simple average of all four metrics
  return Math.round(
    (performance + accessibility + bestPractices + seo) / 4
  );
}

export function determineTier(scores: ScoreSet): TierType {
  const overall = calculateOverallScore(scores);
  const { performance, accessibility, bestPractices, seo } = scores;
  
  // Critical: overall < 60 OR any category < 50
  if (overall < 60 || [performance, accessibility, bestPractices, seo].some(score => score < 50)) {
    return 'critical';
  }
  
  // Pass: overall >= 90
  if (overall >= 90) {
    return 'pass';
  }
  
  // Needs boost: 60 <= overall < 90 (and no category < 50)
  return 'needs_boost';
}

export function determineBadge(scores: ScoreSet, tier: TierType): BadgeTier | null {
  if (tier === 'critical') {
    return null;
  }
  
  const overall = calculateOverallScore(scores);
  
  if (overall >= 98) return 'platinum';
  if (overall >= 90) return 'gold';
  if (overall >= 75) return 'silver';
  if (overall >= 60) return 'bronze';
  
  return null;
}

export function getIndustryPersonalization(domain?: string): {
  industryHint?: string;
  customBullets?: string[];
} {
  if (!domain) return {};
  
  const domainLower = domain.toLowerCase();
  
  // E-commerce patterns
  if (domainLower.includes('shop') || domainLower.includes('store') || 
      domainLower.includes('cart') || domainLower.includes('buy')) {
    return {
      industryHint: 'e-commerce',
      customBullets: [
        'Optimize product image loading for faster browsing',
        'Implement efficient cart and checkout flows',
        'Add structured data for rich product snippets'
      ]
    };
  }
  
  // SaaS patterns
  if (domainLower.includes('app') || domainLower.includes('platform') || 
      domainLower.includes('software') || domainLower.includes('saas')) {
    return {
      industryHint: 'saas',
      customBullets: [
        'Optimize dashboard loading and interactivity',
        'Implement progressive loading for data tables',
        'Add proper focus management for accessibility'
      ]
    };
  }
  
  // Blog/Content patterns
  if (domainLower.includes('blog') || domainLower.includes('news') || 
      domainLower.includes('media') || domainLower.includes('content')) {
    return {
      industryHint: 'content',
      customBullets: [
        'Optimize article loading and reading experience',
        'Implement lazy loading for images and videos',
        'Add proper heading structure for better SEO'
      ]
    };
  }
  
  return {};
}

// Export getBadgeTier function to determine badge based on overall score
export function getBadgeTier(overallScore: number): BadgeTier | null {
  if (overallScore >= BADGE_RANGES.platinum.min) return 'platinum';
  if (overallScore >= BADGE_RANGES.gold.min) return 'gold';
  if (overallScore >= BADGE_RANGES.silver.min) return 'silver';
  if (overallScore >= BADGE_RANGES.bronze.min) return 'bronze';
  return null;
}