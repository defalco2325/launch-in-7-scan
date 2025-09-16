import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  OUTCOMES, 
  calculateOverallScore, 
  determineTier, 
  determineBadge,
  getIndustryPersonalization,
  type ScoreSet, 
  type TierType, 
  type BadgeTier 
} from "@/config/outcomes";

import { getFeatureFlags, BADGE_ANIMATIONS, CTA_VARIANTS, getVariant } from "@/config/flags";
import { 
  openCalendar, 
  sendReport, 
  applyQuickWins, 
  shareBadge, 
  trackEvent 
} from "@/lib/actions";

// Import badge assets
import bronzeBadge from "@/assets/badges/bronze.svg";
import silverBadge from "@/assets/badges/silver.svg";
import goldBadge from "@/assets/badges/gold.svg";
import platinumBadge from "@/assets/badges/platinum.svg";

// Define CheckedState type for checkbox
type CheckedState = boolean | "indeterminate";

export interface OutcomePanelProps {
  scores: ScoreSet;
  domain?: string;
  industry?: string;
}

const BADGE_ASSETS = {
  bronze: bronzeBadge,
  silver: silverBadge,
  gold: goldBadge,
  platinum: platinumBadge
};

export default function OutcomePanel({ scores, domain, industry }: OutcomePanelProps) {
  const [isLoading, setIsLoading] = useState({ primary: false, secondary: false });
  const [leaderboardOptIn, setLeaderboardOptIn] = useState(false);
  const [leaderboardSubmitted, setLeaderboardSubmitted] = useState(false);
  
  const flags = getFeatureFlags();
  const tier: TierType = determineTier(scores);
  const badge: BadgeTier | null = determineBadge(scores, tier);
  const outcome = OUTCOMES[tier];
  const overallScore = calculateOverallScore(scores);
  
  // Get personalization data
  const personalization = getIndustryPersonalization(domain);
  
  // Get A/B testing variants
  const ctaVariant = getVariant('ctaTextVariant');
  const badgeAnimation = getVariant('badgeAnimation');
  const ctaTexts = CTA_VARIANTS[ctaVariant][tier];
  
  // Track outcome viewed on mount
  useEffect(() => {
    trackEvent('outcome_viewed', {
      tier,
      overall_score: overallScore,
      badge,
      domain: domain || 'unknown',
      industry: industry || personalization.industryHint || 'unknown'
    });
  }, [tier, overallScore, badge, domain, industry, personalization.industryHint]);
  
  // Trigger confetti for pass tier
  useEffect(() => {
    if (tier === 'pass' && flags.showConfetti && outcome.confetti) {
      const timer = setTimeout(() => {
        createLightweightConfetti();
        trackEvent('confetti_triggered', { tier, badge, overall_score: overallScore });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [tier, flags.showConfetti, outcome.confetti, badge, overallScore]);
  
  // Lightweight confetti that auto-removes
  const createLightweightConfetti = () => {
    const container = document.createElement('div');
    container.setAttribute('aria-hidden', 'true');
    container.className = 'fixed inset-0 pointer-events-none z-50';
    container.style.overflow = 'hidden';
    
    // Create lightweight confetti particles
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute w-1 h-1 bg-yellow-400 rounded-full';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = '0%';
      
      // Add mobile Safari compatibility for animations
      const animationValue = `confetti-fall ${1.5 + Math.random()}s ease-out forwards`;
      const delayValue = `${Math.random() * 0.5}s`;
      
      // Set webkit animation for mobile Safari
      particle.style.webkitAnimation = animationValue;
      particle.style.webkitAnimationDelay = delayValue;
      
      // Set standard animation for modern browsers
      particle.style.animation = animationValue;
      particle.style.animationDelay = delayValue;
      
      container.appendChild(particle);
    }
    
    document.body.appendChild(container);
    
    // Auto-remove after animation completes
    setTimeout(() => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }, 2500);
  };
  
  // Handle primary CTA action
  const handlePrimaryAction = async () => {
    setIsLoading({ ...isLoading, primary: true });
    
    try {
      trackEvent('cta_clicked', {
        action: outcome.primaryCTA.action,
        tier,
        button_type: 'primary',
        overall_score: overallScore
      });
      
      switch (outcome.primaryCTA.action) {
        case 'openCalendar':
          await openCalendar(tier, domain, scores);
          break;
        case 'applyQuickWins':
          await applyQuickWins(scores, domain);
          break;
        default:
          console.warn(`Unknown primary action: ${outcome.primaryCTA.action}`);
      }
    } catch (error) {
      console.error('Primary action failed:', error);
    } finally {
      setIsLoading({ ...isLoading, primary: false });
    }
  };
  
  // Handle secondary CTA action
  const handleSecondaryAction = async () => {
    setIsLoading({ ...isLoading, secondary: true });
    
    try {
      trackEvent('cta_clicked', {
        action: outcome.secondaryCTA.action,
        tier,
        button_type: 'secondary',
        overall_score: overallScore
      });
      
      switch (outcome.secondaryCTA.action) {
        case 'sendReport':
          await sendReport(scores, domain, tier);
          break;
        case 'shareBadge':
          if (badge) {
            await shareBadge(badge, domain, overallScore);
          }
          break;
        default:
          console.warn(`Unknown secondary action: ${outcome.secondaryCTA.action}`);
      }
    } catch (error) {
      console.error('Secondary action failed:', error);
    } finally {
      setIsLoading({ ...isLoading, secondary: false });
    }
  };
  
  // Get bullets with potential personalization
  const getBullets = () => {
    if (personalization.customBullets && flags.enableIndustryPersonalization) {
      return personalization.customBullets;
    }
    return outcome.bullets;
  };
  
  // Get CTA text with variant
  const getPrimaryCTA = () => {
    return flags.ctaTextVariant !== 'default' ? ctaTexts.primary : outcome.primaryCTA.text;
  };
  
  const getSecondaryCTA = () => {
    return flags.ctaTextVariant !== 'default' ? ctaTexts.secondary : outcome.secondaryCTA.text;
  };
  
  // Handle checkbox change for leaderboard opt-in
  const handleCheckboxChange = (checked: CheckedState) => {
    setLeaderboardOptIn(checked === true);
  };

  // Handle leaderboard opt-in submission
  const handleLeaderboardOptIn = async () => {
    if (!leaderboardOptIn || leaderboardSubmitted || !domain || !badge) return;
    
    try {
      const response = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain,
          score: overallScore,
          badge,
          industry: industry || personalization.industryHint || 'other'
        })
      });
      
      if (response.ok) {
        setLeaderboardSubmitted(true);
        trackEvent('leaderboard_opted_in', { 
          tier, 
          badge, 
          overall_score: overallScore,
          domain 
        });
      }
    } catch (error) {
      console.error('Leaderboard opt-in failed:', error);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 mb-12">
      
      {/* Main Outcome Card */}
      <Card className={`p-6 sm:p-8 ${outcome.theme.background} border-2 overflow-hidden relative`}>
        {/* Gradient Background */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${outcome.gradient} opacity-5`}
          aria-hidden="true"
        />
        
        <div className="relative z-10">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
            <div className="flex-1">
              {/* Overall Score Badge */}
              <div className="flex items-center gap-3 mb-4">
                <Badge 
                  variant="outline" 
                  className={`${outcome.theme.primary} border-current text-lg px-3 py-1`}
                  data-testid="overall-score-badge"
                >
                  Overall Score: {overallScore}
                </Badge>
                {personalization.industryHint && flags.enableIndustryPersonalization && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs opacity-75"
                    data-testid="industry-hint"
                  >
                    {personalization.industryHint}
                  </Badge>
                )}
              </div>
              
              {/* Title and Subtitle */}
              <h2 
                className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 ${outcome.theme.primary}`}
                data-testid="outcome-title"
              >
                {outcome.title}
              </h2>
              <p 
                className={`text-lg sm:text-xl ${outcome.theme.secondary} leading-relaxed`}
                data-testid="outcome-subtitle"
              >
                {outcome.subtitle}
              </p>
            </div>
            
            {/* Badge Display */}
            {badge && flags.enableBadgeSharing && (
              <div className="flex-shrink-0">
                <div 
                  className={`${BADGE_ANIMATIONS[badgeAnimation]} transition-all duration-300 hover:scale-105`}
                  data-testid={`badge-${badge}`}
                >
                  <img 
                    src={BADGE_ASSETS[badge as BadgeTier]} 
                    alt={`${badge} badge`}
                    className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Key Points */}
          <div className="mb-8">
            <h3 className={`text-lg font-semibold mb-4 ${outcome.theme.primary}`}>
              Key Areas for Improvement:
            </h3>
            <ul className="space-y-3" data-testid="improvement-list">
              {getBullets().map((bullet, index) => (
                <li 
                  key={index}
                  className={`flex items-start gap-3 ${outcome.theme.secondary}`}
                >
                  <outcome.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${outcome.theme.accent}`} />
                  <span className="leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Button
              onClick={handlePrimaryAction}
              disabled={isLoading.primary}
              variant={outcome.primaryCTA.variant}
              size="lg"
              className="flex-1 sm:flex-none text-base font-semibold px-8 py-3"
              data-testid="button-primary-cta"
            >
              {isLoading.primary ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Loading...
                </div>
              ) : (
                getPrimaryCTA()
              )}
            </Button>
            
            <Button
              onClick={handleSecondaryAction}
              disabled={isLoading.secondary}
              variant={outcome.secondaryCTA.variant}
              size="lg"
              className="flex-1 sm:flex-none text-base px-8 py-3"
              data-testid="button-secondary-cta"
            >
              {isLoading.secondary ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Loading...
                </div>
              ) : (
                getSecondaryCTA()
              )}
            </Button>
          </div>
          
          {/* Incentive */}
          {flags.incentiveDisplay !== 'never' && (
            <p 
              className={`text-sm ${outcome.theme.accent} italic`}
              data-testid="incentive-text"
            >
              💡 {outcome.incentive}
            </p>
          )}
        </div>
      </Card>
      
      {/* Leaderboard Opt-in (for pass tier) */}
      {tier === 'pass' && overallScore >= 90 && flags.showLeaderboard && (
        <Card className="mt-6 p-4 bg-green-950/10 border-green-800/30" data-testid="leaderboard-optin">
          <div className="space-y-4">
            <div>
              <p className="text-green-400 font-semibold">🏆 Elite Performance Club</p>
              <p className="text-green-300 text-sm">Join 127 other sites with 90+ scores on our public leaderboard</p>
            </div>
            
            {!leaderboardSubmitted ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="leaderboard-optin"
                    checked={leaderboardOptIn}
                    onCheckedChange={handleCheckboxChange}
                    data-testid="checkbox-leaderboard-optin"
                  />
                  <label
                    htmlFor="leaderboard-optin"
                    className="text-sm text-green-300 cursor-pointer"
                  >
                    Yes, add my site to the public leaderboard (domain only, no personal info)
                  </label>
                </div>
                
                {leaderboardOptIn && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLeaderboardOptIn}
                    className="text-green-400 border-green-400 hover:bg-green-400 hover:text-green-950"
                    data-testid="button-submit-leaderboard"
                  >
                    Submit to Leaderboard
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <p className="text-green-400 text-sm font-medium">
                  ✅ Submitted! Your site will be added to the leaderboard within 24 hours.
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}