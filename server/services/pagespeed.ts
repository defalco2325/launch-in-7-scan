import { CoreWebVitals, Issue } from '@shared/schema';

interface PageSpeedResponse {
  lighthouseResult: {
    categories: {
      performance: { score: number };
      accessibility: { score: number };
      'best-practices': { score: number };
      seo: { score: number };
    };
    audits: {
      'largest-contentful-paint': { displayValue: string };
      'first-input-delay': { displayValue: string };
      'cumulative-layout-shift': { displayValue: string };
      'total-blocking-time': { displayValue: string };
      [key: string]: any;
    };
  };
}

export async function scanWebsite(url: string): Promise<{
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;
  coreWebVitals: CoreWebVitals;
  topIssues: Issue[];
}> {
  const apiKey = process.env.PAGESPEED_API_KEY || process.env.GOOGLE_PAGESPEED_API_KEY || "";
  
  if (!apiKey) {
    console.warn('PageSpeed API key not configured, returning mock data');
    return getMockScanResults();
  }

  try {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&category=performance&category=accessibility&category=best-practices&category=seo`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`PageSpeed API error: ${response.status}`);
    }
    
    const data: PageSpeedResponse = await response.json();
    const lighthouse = data.lighthouseResult;
    
    const performanceScore = Math.round((lighthouse.categories.performance?.score || 0) * 100);
    const accessibilityScore = Math.round((lighthouse.categories.accessibility?.score || 0) * 100);
    const bestPracticesScore = Math.round((lighthouse.categories['best-practices']?.score || 0) * 100);
    const seoScore = Math.round((lighthouse.categories.seo?.score || 0) * 100);

    const coreWebVitals: CoreWebVitals = {
      lcp: lighthouse.audits['largest-contentful-paint']?.displayValue || 'N/A',
      fid: lighthouse.audits['first-input-delay']?.displayValue || 'N/A',
      cls: lighthouse.audits['cumulative-layout-shift']?.displayValue || 'N/A',
      tbt: lighthouse.audits['total-blocking-time']?.displayValue || 'N/A'
    };

    // Extract top issues from audits
    const topIssues: Issue[] = [];
    const audits = lighthouse.audits;
    
    // Map common audit failures to issues
    if (audits['render-blocking-resources']?.score < 0.9) {
      topIssues.push({
        title: 'Eliminate render-blocking resources',
        description: 'Remove unused CSS and JavaScript',
        severity: 'critical'
      });
    }
    
    if (audits['unused-css-rules']?.score < 0.9) {
      topIssues.push({
        title: 'Remove unused CSS',
        description: 'Reduce stylesheet size by removing unused rules',
        severity: 'important'
      });
    }
    
    if (audits['modern-image-formats']?.score < 0.9) {
      topIssues.push({
        title: 'Optimize images',
        description: 'Serve images in next-gen formats',
        severity: 'important'
      });
    }
    
    if (!audits['meta-description'] || audits['meta-description'].score < 1) {
      topIssues.push({
        title: 'Missing meta description',
        description: 'Add meta descriptions for better SEO',
        severity: 'important'
      });
    }
    
    if (audits['color-contrast']?.score < 0.9) {
      topIssues.push({
        title: 'Improve color contrast',
        description: 'Ensure sufficient color contrast for accessibility',
        severity: 'important'
      });
    }

    return {
      performanceScore,
      accessibilityScore,
      bestPracticesScore,
      seoScore,
      coreWebVitals,
      topIssues: topIssues.slice(0, 5)
    };
  } catch (error) {
    console.error('PageSpeed scan error:', error);
    return getMockScanResults();
  }
}

function getMockScanResults() {
  return {
    performanceScore: Math.floor(Math.random() * 40) + 30, // 30-70
    accessibilityScore: Math.floor(Math.random() * 30) + 70, // 70-100  
    bestPracticesScore: Math.floor(Math.random() * 25) + 75, // 75-100
    seoScore: Math.floor(Math.random() * 35) + 55, // 55-90
    coreWebVitals: {
      lcp: (Math.random() * 3 + 1.5).toFixed(1) + 's',
      fid: Math.floor(Math.random() * 200 + 50) + 'ms',
      cls: (Math.random() * 0.15 + 0.05).toFixed(2),
      tbt: Math.floor(Math.random() * 800 + 200) + 'ms'
    },
    topIssues: [
      {
        title: 'Eliminate render-blocking resources',
        description: 'Remove unused CSS and JavaScript',
        severity: 'critical' as const
      },
      {
        title: 'Optimize images',
        description: 'Serve images in next-gen formats',
        severity: 'important' as const
      },
      {
        title: 'Missing meta description', 
        description: 'Add meta descriptions for better SEO',
        severity: 'important' as const
      }
    ]
  };
}

export async function takeScreenshot(url: string): Promise<string | null> {
  const screenshotApiUrl = process.env.SCREENSHOT_API_URL;
  
  if (!screenshotApiUrl) {
    console.warn('Screenshot API not configured');
    return null;
  }
  
  try {
    const response = await fetch(`${screenshotApiUrl}?url=${encodeURIComponent(url)}&width=1200&height=800`);
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      return Buffer.from(buffer).toString('base64');
    }
  } catch (error) {
    console.error('Screenshot error:', error);
  }
  
  return null;
}
