import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertScanSchema, insertLeadSchema } from "@shared/schema";
import { extractBrandElements } from "./services/brand-extractor";
import { scanWebsite, takeScreenshot } from "./services/pagespeed";
import { generatePDFReport } from "./services/pdf-generator";
import { sendReportEmail } from "./services/email";

export async function registerRoutes(app: Express): Promise<Server> {
  // Website scanning endpoint
  app.post("/api/scan", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ message: "Invalid URL format" });
      }

      // Create initial scan record
      const scan = await storage.createScan({
        url,
        performanceScore: null,
        accessibilityScore: null,
        bestPracticesScore: null,
        seoScore: null,
        coreWebVitals: null,
        topIssues: null,
        screenshot: null,
        brandElements: null
      });

      res.json({ scanId: scan.id, status: 'started' });

      // Run scan in background
      try {
        const [scanResults, brandElements, screenshot] = await Promise.all([
          scanWebsite(url),
          extractBrandElements(url),
          takeScreenshot(url)
        ]);

        await storage.updateScan(scan.id, {
          ...scanResults,
          brandElements,
          screenshot
        });
      } catch (error) {
        console.error('Background scan error:', error);
      }

    } catch (error) {
      console.error('Scan endpoint error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get scan status
  app.get("/api/scan/:id", async (req, res) => {
    try {
      const scan = await storage.getScan(req.params.id);
      
      if (!scan) {
        return res.status(404).json({ message: "Scan not found" });
      }

      const isComplete = scan.performanceScore !== null;
      
      res.json({
        ...scan,
        status: isComplete ? 'complete' : 'running',
        progress: isComplete ? 100 : 75
      });
    } catch (error) {
      console.error('Get scan error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Brand extraction endpoint
  app.post("/api/brand-extract", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      const brandElements = await extractBrandElements(url);
      res.json(brandElements);
    } catch (error) {
      console.error('Brand extraction error:', error);
      res.status(500).json({ message: "Failed to extract brand elements" });
    }
  });


  // Lead capture endpoint
  app.post("/api/lead", async (req, res) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      
      const lead = await storage.createLead(leadData);
      
      // Generate PDF report in background if scan exists
      if (lead.scanId) {
        const scan = await storage.getScan(lead.scanId);
        if (scan) {
          try {
            const pdfPath = await generatePDFReport(scan, lead);
            if (pdfPath) {
              await storage.updateLead(lead.id, { pdfReportPath: pdfPath });
              
              // Send email with PDF
              const emailSent = await sendReportEmail(lead.email, lead.firstName, pdfPath);
              if (emailSent) {
                await storage.updateLead(lead.id, { emailSent: new Date() });
              }
            }
          } catch (error) {
            console.error('PDF generation/email error:', error);
          }
        }
      }

      res.json({ 
        success: true, 
        leadId: lead.id,
        message: "Thank you! Your report will be sent to your email shortly." 
      });
    } catch (error) {
      console.error('Lead capture error:', error);
      res.status(500).json({ message: "Failed to capture lead" });
    }
  });

  // PDF generation endpoint
  app.get("/api/pdf/:leadId", async (req, res) => {
    try {
      const lead = await storage.getLead(req.params.leadId);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      if (!lead.scanId) {
        return res.status(404).json({ message: "No scan associated with lead" });
      }

      const scan = await storage.getScan(lead.scanId);
      if (!scan) {
        return res.status(404).json({ message: "Scan not found" });
      }

      const pdfPath = await generatePDFReport(scan, lead);
      if (pdfPath) {
        res.json({ pdfUrl: `/reports/report-${lead.id}.html` });
      } else {
        res.status(500).json({ message: "Failed to generate PDF" });
      }
    } catch (error) {
      console.error('PDF endpoint error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Leaderboard endpoints
  // GET /api/leaderboard (public display)
  app.get("/api/leaderboard", async (req, res) => {
    try {
      // In a real implementation, this would fetch from database
      // For now, return mock data
      const leaderboardData = {
        totalSites: 1247,
        topPerformers: [
          { domain: "example1.com", score: 98, badge: "platinum", industry: "saas" },
          { domain: "example2.com", score: 96, badge: "gold", industry: "ecommerce" },
          { domain: "example3.com", score: 94, badge: "gold", industry: "blog" },
          { domain: "example4.com", score: 92, badge: "gold", industry: "portfolio" },
          { domain: "example5.com", score: 91, badge: "gold", industry: "corporate" }
        ],
        averageScore: 73,
        distribution: {
          platinum: 12,
          gold: 127,
          silver: 348,
          bronze: 412,
          none: 348
        }
      };
      
      res.json(leaderboardData);
    } catch (error) {
      console.error('Leaderboard error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // POST /api/leaderboard (opt-in submissions)
  app.post("/api/leaderboard", async (req, res) => {
    try {
      const { domain, score, badge, industry, email } = req.body;
      
      // Validate required fields
      if (!domain || !score || !badge) {
        return res.status(400).json({ message: "Domain, score, and badge are required" });
      }

      // Validate score range
      if (score < 0 || score > 100) {
        return res.status(400).json({ message: "Score must be between 0 and 100" });
      }

      // Only allow high-performing sites (score >= 90)
      if (score < 90) {
        return res.status(400).json({ message: "Only sites with scores of 90 or higher can join the leaderboard" });
      }

      // In a real implementation, this would:
      // 1. Store the opt-in submission in database
      // 2. Verify the score by re-scanning the site
      // 3. Add to leaderboard if verified
      // For now, we'll just acknowledge the submission
      
      const leaderboardEntry = {
        id: Date.now().toString(),
        domain,
        score,
        badge,
        industry: industry || 'other',
        email,
        submittedAt: new Date().toISOString(),
        status: 'pending_verification'
      };

      // Mock storage operation
      console.log('Leaderboard submission:', leaderboardEntry);

      res.json({
        success: true,
        message: "Thank you for joining our leaderboard! Your site will be verified and added within 24 hours.",
        submissionId: leaderboardEntry.id
      });

    } catch (error) {
      console.error('Leaderboard submission error:', error);
      res.status(500).json({ message: "Failed to submit to leaderboard" });
    }
  });

  // Admin endpoints (basic auth required)
  const basicAuth = (req: any, res: any, next: any) => {
    const auth = req.headers.authorization;
    if (!auth) {
      res.status(401).setHeader('WWW-Authenticate', 'Basic').json({ message: 'Authentication required' });
      return;
    }

    const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
    const username = credentials[0];
    const password = credentials[1];
    
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'password';
    
    if (username === adminUser && password === adminPass) {
      next();
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  };

  app.get("/api/admin/leads", basicAuth, async (req, res) => {
    try {
      const leads = await storage.getAllLeads();
      res.json(leads);
    } catch (error) {
      console.error('Admin leads error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/leads/:id/resend", basicAuth, async (req, res) => {
    try {
      const lead = await storage.getLead(req.params.id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      if (lead.pdfReportPath) {
        const emailSent = await sendReportEmail(lead.email, lead.firstName, lead.pdfReportPath);
        if (emailSent) {
          await storage.updateLead(lead.id, { emailSent: new Date() });
          res.json({ success: true, message: "Report resent successfully" });
        } else {
          res.status(500).json({ message: "Failed to send email" });
        }
      } else {
        res.status(404).json({ message: "No report available for this lead" });
      }
    } catch (error) {
      console.error('Resend report error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/leads/:id", basicAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteLead(req.params.id);
      if (deleted) {
        res.json({ success: true, message: "Lead deleted successfully" });
      } else {
        res.status(404).json({ message: "Lead not found" });
      }
    } catch (error) {
      console.error('Delete lead error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
