import { MailService } from '@sendgrid/mail';
import { readFileSync } from 'fs';

const mailService = new MailService();
const apiKey = process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY_ENV_VAR || "";

if (apiKey) {
  mailService.setApiKey(apiKey);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  // Since using Netlify forms instead of SendGrid, just log the email attempt
  console.log('Email would be sent to:', params.to);
  console.log('Subject:', params.subject);
  return true;
}

export async function sendReportEmail(email: string, firstName: string, pdfPath: string): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #3B82F6 0%, #10B981 100%); padding: 40px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 32px; font-weight: bold;">
          Launch<span style="color: #FCD34D;">In7</span>
        </h1>
        <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Your Website Health Report is Ready</p>
      </div>
      
      <div style="padding: 40px; background: white;">
        <h2 style="color: #1F2937; margin-bottom: 20px;">Hi ${firstName},</h2>
        
        <p style="color: #4B5563; line-height: 1.6; margin-bottom: 20px;">
          Thank you for using LaunchIn7 to analyze your website! We've completed a comprehensive scan 
          and identified key opportunities to improve your site's performance, accessibility, and SEO.
        </p>
        
        <p style="color: #4B5563; line-height: 1.6; margin-bottom: 30px;">
          Your detailed report is attached to this email and includes:
        </p>
        
        <ul style="color: #4B5563; line-height: 1.8; margin-bottom: 30px;">
          <li>Performance metrics and Core Web Vitals</li>
          <li>Accessibility compliance assessment</li>
          <li>SEO optimization opportunities</li>
          <li>Custom LaunchIn7 website preview</li>
          <li>Prioritized action items</li>
        </ul>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="https://launchin7.com/contact" 
             style="background: #FCD34D; color: #1F2937; padding: 15px 30px; 
                    text-decoration: none; border-radius: 8px; font-weight: bold; 
                    display: inline-block;">
            Rebuild My Site in 7 Days
          </a>
        </div>
        
        <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">
          Questions? Reply to this email or visit our website to learn more about our 
          7-day website rebuilding service.
        </p>
      </div>
      
      <div style="background: #F9FAFB; padding: 20px; text-align: center; color: #6B7280; font-size: 12px;">
        © 2024 LaunchIn7. All rights reserved.
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    from: 'reports@launchin7.com',
    subject: 'Your Website Health Report from LaunchIn7',
    html,
    text: `Hi ${firstName},\n\nYour website health report from LaunchIn7 is ready! Please find it attached to this email.\n\nReady to rebuild your site in 7 days? Visit https://launchin7.com/contact\n\nBest regards,\nThe LaunchIn7 Team`,
    attachments: pdfPath ? [{
      content: Buffer.from(readFileSync(pdfPath)).toString('base64'),
      filename: 'website-health-report.pdf',
      type: 'application/pdf',
      disposition: 'attachment'
    }] : undefined
  });
}
