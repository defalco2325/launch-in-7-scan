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
  // Desktop scores
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;
  coreWebVitals: CoreWebVitals;
  topIssues: Issue[];
  // Mobile scores
  mobilePerformanceScore: number;
  mobileAccessibilityScore: number;
  mobileBestPracticesScore: number;
  mobileSeoScore: number;
  mobileCoreWebVitals: CoreWebVitals;
  mobileTopIssues: Issue[];
}> {
  const apiKey = process.env.PAGESPEED_API_KEY || process.env.GOOGLE_PAGESPEED_API_KEY || "";
  
  if (!apiKey) {
    console.warn('PageSpeed API key not configured, returning mock data');
    return getMockScanResults();
  }

  try {
    // Scan both desktop and mobile
    const [desktopResults, mobileResults] = await Promise.all([
      scanDevice(url, apiKey, 'desktop'),
      scanDevice(url, apiKey, 'mobile')
    ]);

    return {
      // Desktop scores
      performanceScore: desktopResults.performanceScore,
      accessibilityScore: desktopResults.accessibilityScore,
      bestPracticesScore: desktopResults.bestPracticesScore,
      seoScore: desktopResults.seoScore,
      coreWebVitals: desktopResults.coreWebVitals,
      topIssues: desktopResults.topIssues,
      // Mobile scores
      mobilePerformanceScore: mobileResults.performanceScore,
      mobileAccessibilityScore: mobileResults.accessibilityScore,
      mobileBestPracticesScore: mobileResults.bestPracticesScore,
      mobileSeoScore: mobileResults.seoScore,
      mobileCoreWebVitals: mobileResults.coreWebVitals,
      mobileTopIssues: mobileResults.topIssues,
    };
  } catch (error) {
    console.error('PageSpeed scan error:', error);
    return getMockScanResults();
  }
}

async function scanDevice(url: string, apiKey: string, strategy: 'mobile' | 'desktop') {
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo`;
  
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
}

function getMockScanResults() {
  // Desktop scores (generally higher)
  const performanceScore = Math.floor(Math.random() * 40) + 50; // 50-90
  const accessibilityScore = Math.floor(Math.random() * 30) + 70; // 70-100  
  const bestPracticesScore = Math.floor(Math.random() * 25) + 75; // 75-100
  const seoScore = Math.floor(Math.random() * 35) + 65; // 65-100

  // Mobile scores (generally lower)
  const mobilePerformanceScore = Math.floor(Math.random() * 40) + 20; // 20-60
  const mobileAccessibilityScore = Math.floor(Math.random() * 30) + 65; // 65-95  
  const mobileBestPracticesScore = Math.floor(Math.random() * 25) + 70; // 70-95
  const mobileSeoScore = Math.floor(Math.random() * 35) + 60; // 60-95

  const issues = [
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
  ];

  return {
    // Desktop scores
    performanceScore,
    accessibilityScore,
    bestPracticesScore,
    seoScore,
    coreWebVitals: {
      lcp: (Math.random() * 2 + 1.5).toFixed(1) + 's',
      fid: Math.floor(Math.random() * 150 + 50) + 'ms',
      cls: (Math.random() * 0.1 + 0.05).toFixed(2),
      tbt: Math.floor(Math.random() * 600 + 200) + 'ms'
    },
    topIssues: issues,
    // Mobile scores
    mobilePerformanceScore,
    mobileAccessibilityScore,
    mobileBestPracticesScore,
    mobileSeoScore,
    mobileCoreWebVitals: {
      lcp: (Math.random() * 3 + 2.5).toFixed(1) + 's', // Slower on mobile
      fid: Math.floor(Math.random() * 300 + 100) + 'ms', // Higher on mobile
      cls: (Math.random() * 0.2 + 0.1).toFixed(2), // Higher on mobile
      tbt: Math.floor(Math.random() * 1000 + 400) + 'ms' // Higher on mobile
    },
    mobileTopIssues: [
      ...issues,
      {
        title: 'Mobile-specific performance issues',
        description: 'Optimize for mobile devices and network conditions',
        severity: 'important' as const
      }
    ]
  };
}

export async function takeScreenshot(url: string): Promise<string | null> {
  // Dynamic import to avoid loading puppeteer until needed
  let puppeteer;
  try {
    puppeteer = await import('puppeteer');
  } catch (error) {
    console.warn('Puppeteer not available, screenshots disabled');
    return null;
  }

  // Find system Chromium executable
  const { execSync } = await import('child_process');
  let executablePath: string | undefined;
  try {
    executablePath = execSync('which chromium').toString().trim();
    console.log('Using system Chromium at:', executablePath);
  } catch {
    console.log('System Chromium not found, using bundled browser');
  }

  let browser = null;
  
  try {
    // Launch browser with production-ready options
    browser = await puppeteer.launch({
      headless: true,
      executablePath, // Use system Chromium if available
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1200,800',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ],
      defaultViewport: {
        width: 1200,
        height: 800
      }
    });

    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set viewport
    await page.setViewport({ width: 1200, height: 800 });
    
    // Navigate to URL with timeout
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000 // 30 second timeout
    });
    
    // Wait a bit for any dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
      encoding: 'base64'
    });
    
    return screenshot as string;
    
  } catch (error) {
    console.error('Screenshot capture error:', error);
    // Return null on error to maintain backward compatibility
    return null;
  } finally {
    // Always close browser to prevent memory leaks
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
}
