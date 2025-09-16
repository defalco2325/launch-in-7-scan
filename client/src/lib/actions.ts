import { buildCalendarUrl, buildSocialShareUrl, BADGE_SHARE_TEMPLATES } from "@/config/links";
import { apiRequest } from "@/lib/queryClient";
import type { ScoreSet, TierType, BadgeTier } from "@/config/outcomes";

// Analytics tracking function (supports multiple providers)
export function trackEvent(eventName: string, properties: Record<string, any> = {}) {
  try {
    // Plausible Analytics
    if (typeof window !== 'undefined' && (window as any).plausible) {
      (window as any).plausible(eventName, { props: properties });
    }
    
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, properties);
    }
    
    // Console logging for development
    if (import.meta.env.MODE === 'development') {
      console.log(`Analytics Event: ${eventName}`, properties);
    }
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
}

// Open calendar booking in new tab
export async function openCalendar(tier: TierType, domain?: string, scores?: ScoreSet): Promise<void> {
  try {
    const calendarUrl = buildCalendarUrl(tier, domain, scores ? {
      performance: scores.performance,
      accessibility: scores.accessibility,
      bestPractices: scores.bestPractices,
      seo: scores.seo
    } : undefined);
    
    // Track the calendar open event
    trackEvent('calendar_opened', {
      tier,
      domain: domain || 'unknown',
      overall_score: scores ? Math.round(
        (scores.performance * 0.3) + (scores.seo * 0.3) + (scores.accessibility * 0.25) + (scores.bestPractices * 0.15)
      ) : 0
    });
    
    // Open in new tab
    window.open(calendarUrl, '_blank', 'noopener,noreferrer');
  } catch (error) {
    console.error('Failed to open calendar:', error);
    throw new Error('Unable to open booking calendar. Please try again.');
  }
}

// Trigger email report flow
export async function sendReport(scores: ScoreSet, domain?: string, tier?: TierType): Promise<void> {
  try {
    // Scroll to lead form if it exists
    const leadFormSection = document.getElementById('lead-form-section');
    if (leadFormSection) {
      leadFormSection.scrollIntoView({ behavior: 'smooth' });
      
      // Highlight the form briefly
      leadFormSection.classList.add('highlight-pulse');
      setTimeout(() => {
        leadFormSection.classList.remove('highlight-pulse');
      }, 2000);
    } else {
      // If no lead form is visible, show a modal or create one
      await showEmailCaptureModal(scores, domain, tier);
    }
    
    trackEvent('report_requested', {
      tier: tier || 'unknown',
      domain: domain || 'unknown',
      method: leadFormSection ? 'scroll_to_form' : 'modal',
      overall_score: Math.round(
        (scores.performance * 0.3) + (scores.seo * 0.3) + (scores.accessibility * 0.25) + (scores.bestPractices * 0.15)
      )
    });
  } catch (error) {
    console.error('Failed to send report:', error);
    throw new Error('Unable to process report request. Please try again.');
  }
}

// Show quick wins modal/checklist
export async function applyQuickWins(scores: ScoreSet, domain?: string): Promise<void> {
  try {
    // Generate quick wins based on scores
    const quickWins = generateQuickWins(scores);
    
    // Create and show modal
    const modal = createQuickWinsModal(quickWins, domain);
    document.body.appendChild(modal);
    
    // Add event listeners for modal actions
    setupQuickWinsModalEvents(modal, quickWins, domain);
    
    trackEvent('quick_wins_opened', {
      domain: domain || 'unknown',
      wins_count: quickWins.length,
      lowest_score_category: getLowestScoreCategory(scores),
      overall_score: Math.round(
        (scores.performance * 0.3) + (scores.seo * 0.3) + (scores.accessibility * 0.25) + (scores.bestPractices * 0.15)
      )
    });
  } catch (error) {
    console.error('Failed to show quick wins:', error);
    throw new Error('Unable to load quick wins. Please try again.');
  }
}

// Share badge functionality
export async function shareBadge(badge: BadgeTier | null, domain?: string, overallScore?: number): Promise<void> {
  try {
    if (!badge) {
      throw new Error('No badge available to share');
    }
    
    // Generate share data
    const shareData = {
      title: `${badge.charAt(0).toUpperCase() + badge.slice(1)} Website Performance Badge`,
      text: BADGE_SHARE_TEMPLATES[badge].instagram,
      url: window.location.origin + (domain ? `?domain=${encodeURIComponent(domain)}` : '')
    };
    
    // Try native Web Share API first (mobile)
    if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      await navigator.share(shareData);
      trackEvent('badge_shared', { badge, method: 'native', domain: domain || 'unknown', overall_score: overallScore || 0 });
      return;
    }
    
    // Fallback to social sharing modal
    const sharingModal = createSharingModal(badge, shareData, domain);
    document.body.appendChild(sharingModal);
    
    trackEvent('badge_shared', { badge, method: 'modal', domain: domain || 'unknown', overall_score: overallScore || 0 });
  } catch (error) {
    console.error('Failed to share badge:', error);
    throw new Error('Unable to share badge. Please try again.');
  }
}

// Helper function to generate quick wins based on scores
function generateQuickWins(scores: ScoreSet): Array<{
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
}> {
  const wins: Array<{
    category: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedTime: string;
  }> = [];
  
  if (scores.performance < 80) {
    wins.push({
      category: 'Performance',
      title: 'Optimize Images',
      description: 'Compress and convert images to WebP format for faster loading',
      impact: 'high' as const,
      difficulty: 'easy' as const,
      estimatedTime: '15 minutes'
    });
    
    wins.push({
      category: 'Performance',
      title: 'Enable Browser Caching',
      description: 'Set cache headers to reduce repeat load times',
      impact: 'high' as const,
      difficulty: 'medium' as const,
      estimatedTime: '10 minutes'
    });
  }
  
  if (scores.accessibility < 80) {
    wins.push({
      category: 'Accessibility',
      title: 'Add Alt Text to Images',
      description: 'Provide descriptive alt text for all images',
      impact: 'high' as const,
      difficulty: 'easy' as const,
      estimatedTime: '20 minutes'
    });
    
    wins.push({
      category: 'Accessibility',
      title: 'Improve Color Contrast',
      description: 'Ensure text meets WCAG color contrast requirements',
      impact: 'medium' as const,
      difficulty: 'easy' as const,
      estimatedTime: '15 minutes'
    });
  }
  
  if (scores.seo < 80) {
    wins.push({
      category: 'SEO',
      title: 'Add Meta Descriptions',
      description: 'Write compelling meta descriptions for all pages',
      impact: 'medium' as const,
      difficulty: 'easy' as const,
      estimatedTime: '30 minutes'
    });
    
    wins.push({
      category: 'SEO',
      title: 'Optimize Page Titles',
      description: 'Create unique, descriptive titles for each page',
      impact: 'high' as const,
      difficulty: 'easy' as const,
      estimatedTime: '20 minutes'
    });
  }
  
  if (scores.bestPractices < 80) {
    wins.push({
      category: 'Best Practices',
      title: 'Update to HTTPS',
      description: 'Ensure all pages are served over secure HTTPS',
      impact: 'high' as const,
      difficulty: 'medium' as const,
      estimatedTime: '30 minutes'
    });
    
    wins.push({
      category: 'Best Practices',
      title: 'Fix Console Errors',
      description: 'Resolve JavaScript errors shown in browser console',
      impact: 'medium' as const,
      difficulty: 'medium' as const,
      estimatedTime: '45 minutes'
    });
  }
  
  return wins.slice(0, 6); // Limit to top 6 wins
}

// Helper function to get lowest score category
function getLowestScoreCategory(scores: ScoreSet): string {
  const categories = [
    { name: 'performance', score: scores.performance },
    { name: 'accessibility', score: scores.accessibility },
    { name: 'bestPractices', score: scores.bestPractices },
    { name: 'seo', score: scores.seo }
  ];
  
  return categories.reduce((lowest, current) => 
    current.score < lowest.score ? current : lowest
  ).name;
}

// Create and show email capture modal
async function showEmailCaptureModal(scores: ScoreSet, domain?: string, tier?: TierType): Promise<void> {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="bg-slate-800 rounded-lg p-6 max-w-md w-full border border-slate-600">
      <h3 class="text-xl font-bold text-white mb-4">Get Your Full Report</h3>
      <p class="text-slate-300 mb-6">Enter your email to receive a detailed performance report with actionable recommendations.</p>
      
      <form id="email-capture-form" class="space-y-4">
        <input 
          type="email" 
          placeholder="your@email.com" 
          required
          class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
        />
        <div class="flex gap-3">
          <button 
            type="submit"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Send Report
          </button>
          <button 
            type="button"
            onclick="this.closest('.fixed').remove()"
            class="px-4 py-2 border border-slate-600 text-slate-300 rounded hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  `;
  
  // Handle form submission
  const form = modal.querySelector('#email-capture-form') as HTMLFormElement;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = (form.querySelector('input[type="email"]') as HTMLInputElement).value;
    
    try {
      // For static site: Store email in localStorage and show confirmation
      const leads = JSON.parse(localStorage.getItem('launchin7_leads') || '{}');
      const leadId = Date.now().toString();
      leads[leadId] = {
        id: leadId,
        email,
        firstName: 'Report',
        lastName: 'Request',
        company: domain || '',
        createdAt: new Date().toISOString(),
        scanId: null
      };
      localStorage.setItem('launchin7_leads', JSON.stringify(leads));
      
      modal.remove();
      
      // Show success message
      const successToast = document.createElement('div');
      successToast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg z-50';
      successToast.textContent = 'Report will be sent to your email shortly!';
      document.body.appendChild(successToast);
      setTimeout(() => successToast.remove(), 3000);
      
    } catch (error) {
      console.error('Email capture failed:', error);
      alert('Failed to submit. Please try again.');
    }
  });
  
  document.body.appendChild(modal);
}

// Create quick wins modal
function createQuickWinsModal(quickWins: any[], domain?: string): HTMLElement {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  
  const winsHTML = quickWins.map((win, index) => `
    <div class="bg-slate-700 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-colors">
      <div class="flex items-start justify-between mb-2">
        <h4 class="font-semibold text-white">${win.title}</h4>
        <div class="flex gap-2">
          <span class="text-xs px-2 py-1 rounded ${
            win.impact === 'high' ? 'bg-red-600 text-white' :
            win.impact === 'medium' ? 'bg-yellow-600 text-white' : 'bg-green-600 text-white'
          }">${win.impact.toUpperCase()}</span>
          <span class="text-xs px-2 py-1 rounded bg-slate-600 text-slate-300">${win.estimatedTime}</span>
        </div>
      </div>
      <p class="text-slate-300 text-sm mb-3">${win.description}</p>
      <div class="flex items-center justify-between">
        <span class="text-xs text-slate-400">${win.category}</span>
        <button 
          class="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          onclick="window.open('https://launchin7.com/guides/${win.category.toLowerCase()}', '_blank')"
        >
          Learn How →
        </button>
      </div>
    </div>
  `).join('');
  
  modal.innerHTML = `
    <div class="bg-slate-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-slate-600">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-2xl font-bold text-white">Quick Wins Checklist</h3>
        <button 
          onclick="this.closest('.fixed').remove()"
          class="text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
      
      <p class="text-slate-300 mb-6">Here are the highest-impact improvements you can make right now:</p>
      
      <div class="grid gap-4 md:grid-cols-2">
        ${winsHTML}
      </div>
      
      <div class="mt-6 p-4 bg-blue-950 rounded-lg border border-blue-800">
        <p class="text-blue-300 text-sm">
          💡 <strong>Pro Tip:</strong> Focus on high-impact, easy wins first. These changes typically take 1-2 hours total and can improve your score by 10-20 points.
        </p>
      </div>
    </div>
  `;
  
  return modal;
}

// Setup event listeners for quick wins modal
function setupQuickWinsModalEvents(modal: HTMLElement, quickWins: any[], domain?: string): void {
  // Track individual win interactions
  const winElements = modal.querySelectorAll('[onclick*="launchin7.com/guides"]');
  winElements.forEach((element, index) => {
    element.addEventListener('click', () => {
      trackEvent('quick_win_clicked', {
        win_title: quickWins[index]?.title || 'unknown',
        category: quickWins[index]?.category || 'unknown',
        impact: quickWins[index]?.impact || 'unknown',
        domain: domain || 'unknown'
      });
    });
  });
}

// Create social sharing modal
function createSharingModal(badge: BadgeTier, shareData: any, domain?: string): HTMLElement {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  
  const platforms = [
    { name: 'Instagram', key: 'instagram', color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600' },
    { name: 'LinkedIn', key: 'linkedin', color: 'bg-blue-700 hover:bg-blue-800' },
    { name: 'Facebook', key: 'facebook', color: 'bg-blue-600 hover:bg-blue-700' }
  ];
  
  const buttonsHTML = platforms.map(platform => `
    <button 
      onclick="shareOn${platform.name}()"
      class="flex-1 ${platform.color} text-white font-semibold py-3 px-4 rounded transition-colors"
    >
      Share on ${platform.name}
    </button>
  `).join('');
  
  modal.innerHTML = `
    <div class="bg-slate-800 rounded-lg p-6 max-w-md w-full border border-slate-600">
      <h3 class="text-xl font-bold text-white mb-4">Share Your ${badge} Badge!</h3>
      <p class="text-slate-300 mb-6">Show off your website's performance achievement:</p>
      
      <div class="flex gap-3 mb-6">
        ${buttonsHTML}
      </div>
      
      <div class="text-center">
        <button 
          onclick="this.closest('.fixed').remove()"
          class="text-slate-400 hover:text-white transition-colors text-sm"
        >
          Close
        </button>
      </div>
    </div>
  `;
  
  // Add sharing functions to window
  (window as any).shareOnInstagram = () => {
    // Instagram doesn't support direct URL sharing, so we'll copy text to clipboard
    const instagramText = BADGE_SHARE_TEMPLATES[badge].instagram;
    navigator.clipboard.writeText(`${instagramText}\n\n${shareData.url}`).then(() => {
      // Show success message and open Instagram
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
      successMessage.innerHTML = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        Instagram caption copied! Opening Instagram...
      `;
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 4000);
      
      // Open Instagram in a new tab
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    }).catch(() => {
      // Show fallback message
      const fallbackMessage = document.createElement('div');
      fallbackMessage.className = 'fixed top-4 right-4 bg-orange-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      fallbackMessage.innerHTML = `
        <div class="font-semibold mb-2">Copy this for Instagram:</div>
        <div class="text-sm bg-orange-700 p-2 rounded">${instagramText}<br><br>${shareData.url}</div>
      `;
      document.body.appendChild(fallbackMessage);
      setTimeout(() => fallbackMessage.remove(), 8000);
    });
    modal.remove();
  };
  
  (window as any).shareOnLinkedIn = () => {
    const url = buildSocialShareUrl('linkedin', {
      title: shareData.title,
      text: BADGE_SHARE_TEMPLATES[badge].linkedin,
      url: shareData.url
    });
    window.open(url, '_blank', 'noopener,noreferrer');
    modal.remove();
  };
  
  (window as any).shareOnFacebook = () => {
    const url = buildSocialShareUrl('facebook', {
      title: shareData.title,
      url: shareData.url
    });
    window.open(url, '_blank', 'noopener,noreferrer');
    modal.remove();
  };
  
  return modal;
}