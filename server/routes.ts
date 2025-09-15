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

  // Preview generation endpoint
  app.post("/api/preview-generate", async (req, res) => {
    try {
      const { scanId } = req.body;
      
      if (!scanId) {
        return res.status(400).json({ message: "Scan ID is required" });
      }

      const scan = await storage.getScan(scanId);
      if (!scan) {
        return res.status(404).json({ message: "Scan not found" });
      }

      // Return brand elements for preview generation
      res.json({
        brandElements: scan.brandElements,
        previewUrl: `/preview/${scanId}`
      });
    } catch (error) {
      console.error('Preview generation error:', error);
      res.status(500).json({ message: "Failed to generate preview" });
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
