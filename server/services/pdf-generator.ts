import { Scan, Lead, BrandElements, CoreWebVitals, Issue } from '@shared/schema';
import { promises as fs } from 'fs';
import path from 'path';

export async function generatePDFReport(scan: Scan, lead: Lead): Promise<string | null> {
  try {
    // In a real implementation, you would use Playwright or Puppeteer to generate PDF
    // For now, we'll create a simple HTML report and simulate PDF generation
    
    const reportHtml = createReportHTML(scan, lead);
    const reportPath = path.join(process.cwd(), 'reports', `report-${lead.id}.html`);
    
    // Ensure reports directory exists
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, reportHtml);
    
    // In production, convert HTML to PDF using Playwright:
    // const browser = await chromium.launch();
    // const page = await browser.newPage();
    // await page.setContent(reportHtml);
    // const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    // await browser.close();
    // const pdfPath = reportPath.replace('.html', '.pdf');
    // await fs.writeFile(pdfPath, pdfBuffer);
    // return pdfPath;
    
    return reportPath;
  } catch (error) {
    console.error('PDF generation error:', error);
    return null;
  }
}

function createReportHTML(scan: Scan, lead: Lead): string {
  const brandElements = scan.brandElements as BrandElements;
  const coreWebVitals = scan.coreWebVitals as CoreWebVitals;
  const topIssues = scan.topIssues as Issue[];

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Website Health Report - ${brandElements?.businessName || 'Your Business'}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Arial', sans-serif; 
          line-height: 1.6; 
          color: #333;
          background: white;
        }
        .header {
          background: linear-gradient(135deg, #3B82F6 0%, #10B981 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
        }
        .logo { font-size: 36px; font-weight: bold; margin-bottom: 10px; }
        .accent { color: #FCD34D; }
        .container { max-width: 800px; margin: 0 auto; padding: 0 20px; }
        .section { margin: 40px 0; }
        .scores { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
        .score-card {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          border-left: 4px solid #3B82F6;
        }
        .score { font-size: 36px; font-weight: bold; margin-bottom: 5px; }
        .score.poor { color: #EF4444; }
        .score.fair { color: #F59E0B; }
        .score.good { color: #10B981; }
        .vitals { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .vital { background: #f8f9fa; padding: 15px; border-radius: 6px; }
        .issues { background: #fef2f2; padding: 20px; border-radius: 8px; border: 1px solid #fecaca; }
        .issue { margin: 15px 0; padding: 15px; background: white; border-radius: 6px; }
        .issue-title { font-weight: bold; margin-bottom: 5px; }
        .severity { 
          display: inline-block; 
          padding: 2px 8px; 
          border-radius: 12px; 
          font-size: 12px; 
          font-weight: bold;
          text-transform: uppercase;
        }
        .severity.critical { background: #FEE2E2; color: #DC2626; }
        .severity.important { background: #FEF3C7; color: #D97706; }
        .preview { margin: 40px 0; text-align: center; }
        .cta { 
          background: #FCD34D; 
          color: #1F2937; 
          padding: 40px; 
          text-align: center; 
          border-radius: 12px; 
          margin: 40px 0;
        }
        .cta h2 { margin-bottom: 15px; }
        .footer { text-align: center; padding: 40px; color: #6B7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="container">
          <div class="logo">Launch<span class="accent">In7</span></div>
          <h1>Website Health Report</h1>
          <p>For ${brandElements?.businessName || lead.company || 'Your Business'}</p>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div class="container">
        <div class="section">
          <h2>Performance Overview</h2>
          <p>We analyzed <strong>${scan.url}</strong> and found several opportunities for improvement.</p>
          
          <div class="scores">
            <div class="score-card">
              <div class="score ${getScoreClass(scan.performanceScore)}">${scan.performanceScore || 0}</div>
              <div>Performance</div>
            </div>
            <div class="score-card">
              <div class="score ${getScoreClass(scan.accessibilityScore)}">${scan.accessibilityScore || 0}</div>
              <div>Accessibility</div>
            </div>
            <div class="score-card">
              <div class="score ${getScoreClass(scan.bestPracticesScore)}">${scan.bestPracticesScore || 0}</div>
              <div>Best Practices</div>
            </div>
            <div class="score-card">
              <div class="score ${getScoreClass(scan.seoScore)}">${scan.seoScore || 0}</div>
              <div>SEO</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Core Web Vitals</h2>
          <div class="vitals">
            <div class="vital">
              <strong>Largest Contentful Paint:</strong><br>
              ${coreWebVitals?.lcp || 'N/A'}
            </div>
            <div class="vital">
              <strong>First Input Delay:</strong><br>
              ${coreWebVitals?.fid || 'N/A'}
            </div>
            <div class="vital">
              <strong>Cumulative Layout Shift:</strong><br>
              ${coreWebVitals?.cls || 'N/A'}
            </div>
            <div class="vital">
              <strong>Total Blocking Time:</strong><br>
              ${coreWebVitals?.tbt || 'N/A'}
            </div>
          </div>
        </div>

        ${topIssues && topIssues.length > 0 ? `
        <div class="section">
          <h2>Priority Issues to Fix</h2>
          <div class="issues">
            ${topIssues.map((issue, index) => `
              <div class="issue">
                <div class="issue-title">${index + 1}. ${issue.title}</div>
                <div class="issue-desc">${issue.description}</div>
                <span class="severity ${issue.severity}">${issue.severity}</span>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <div class="cta">
          <h2>Ready to Fix These Issues?</h2>
          <p>Our team can rebuild your website in just 7 days with all these improvements included.</p>
          <p style="margin-top: 20px;">
            <strong>Contact us:</strong> hello@launchin7.com | (555) 123-4567<br>
            <strong>Visit:</strong> https://launchin7.com/contact
          </p>
        </div>
      </div>

      <div class="footer">
        <p>This report was generated by LaunchIn7 for ${lead.firstName} ${lead.lastName}</p>
        <p>© ${new Date().getFullYear()} LaunchIn7. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

function getScoreClass(score: number | null): string {
  if (!score) return 'poor';
  if (score >= 80) return 'good';
  if (score >= 60) return 'fair';
  return 'poor';
}
