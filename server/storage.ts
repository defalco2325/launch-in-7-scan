import { type Scan, type Lead, type InsertScan, type InsertLead, type CoreWebVitals, type Issue } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Scan operations
  createScan(scan: InsertScan): Promise<Scan>;
  getScan(id: string): Promise<Scan | undefined>;
  updateScan(id: string, updates: Partial<Omit<Scan, 'id' | 'createdAt'>>): Promise<Scan | undefined>;
  
  // Lead operations  
  createLead(lead: InsertLead): Promise<Lead>;
  getLead(id: string): Promise<Lead | undefined>;
  getAllLeads(): Promise<Lead[]>;
  updateLead(id: string, updates: Partial<Lead>): Promise<Lead | undefined>;
  deleteLead(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private scans: Map<string, Scan>;
  private leads: Map<string, Lead>;

  constructor() {
    this.scans = new Map();
    this.leads = new Map();
  }

  async createScan(insertScan: InsertScan): Promise<Scan> {
    const id = randomUUID();
    const scan: Scan = { 
      ...insertScan,
      performanceScore: insertScan.performanceScore ?? null,
      accessibilityScore: insertScan.accessibilityScore ?? null,
      bestPracticesScore: insertScan.bestPracticesScore ?? null,
      seoScore: insertScan.seoScore ?? null,
      coreWebVitals: (insertScan.coreWebVitals ?? null) as CoreWebVitals | null,
      topIssues: (insertScan.topIssues ?? null) as Issue[] | null,
      mobilePerformanceScore: insertScan.mobilePerformanceScore ?? null,
      mobileAccessibilityScore: insertScan.mobileAccessibilityScore ?? null,
      mobileBestPracticesScore: insertScan.mobileBestPracticesScore ?? null,
      mobileSeoScore: insertScan.mobileSeoScore ?? null,
      mobileCoreWebVitals: (insertScan.mobileCoreWebVitals ?? null) as CoreWebVitals | null,
      mobileTopIssues: (insertScan.mobileTopIssues ?? null) as Issue[] | null,
      screenshot: insertScan.screenshot ?? null,
      brandElements: insertScan.brandElements ?? null,
      id, 
      createdAt: new Date() 
    };
    this.scans.set(id, scan);
    return scan;
  }

  async getScan(id: string): Promise<Scan | undefined> {
    return this.scans.get(id);
  }

  async updateScan(id: string, updates: Partial<Omit<Scan, 'id' | 'createdAt'>>): Promise<Scan | undefined> {
    const scan = this.scans.get(id);
    if (!scan) return undefined;
    
    const updated: Scan = {
      ...scan,
      url: updates.url !== undefined ? updates.url : scan.url,
      performanceScore: updates.performanceScore !== undefined ? updates.performanceScore : scan.performanceScore,
      accessibilityScore: updates.accessibilityScore !== undefined ? updates.accessibilityScore : scan.accessibilityScore,
      bestPracticesScore: updates.bestPracticesScore !== undefined ? updates.bestPracticesScore : scan.bestPracticesScore,
      seoScore: updates.seoScore !== undefined ? updates.seoScore : scan.seoScore,
      coreWebVitals: updates.coreWebVitals !== undefined ? updates.coreWebVitals : scan.coreWebVitals,
      topIssues: updates.topIssues !== undefined ? updates.topIssues : scan.topIssues,
      mobilePerformanceScore: updates.mobilePerformanceScore !== undefined ? updates.mobilePerformanceScore : scan.mobilePerformanceScore,
      mobileAccessibilityScore: updates.mobileAccessibilityScore !== undefined ? updates.mobileAccessibilityScore : scan.mobileAccessibilityScore,
      mobileBestPracticesScore: updates.mobileBestPracticesScore !== undefined ? updates.mobileBestPracticesScore : scan.mobileBestPracticesScore,
      mobileSeoScore: updates.mobileSeoScore !== undefined ? updates.mobileSeoScore : scan.mobileSeoScore,
      mobileCoreWebVitals: updates.mobileCoreWebVitals !== undefined ? updates.mobileCoreWebVitals : scan.mobileCoreWebVitals,
      mobileTopIssues: updates.mobileTopIssues !== undefined ? updates.mobileTopIssues : scan.mobileTopIssues,
      screenshot: updates.screenshot !== undefined ? updates.screenshot : scan.screenshot,
      brandElements: updates.brandElements !== undefined ? updates.brandElements : scan.brandElements,
    };
    this.scans.set(id, updated);
    return updated;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = randomUUID();
    const lead: Lead = { 
      ...insertLead,
      scanId: insertLead.scanId ?? null,
      phone: insertLead.phone ?? null,
      company: insertLead.company ?? null,
      id, 
      pdfReportPath: null,
      emailSent: null,
      createdAt: new Date() 
    };
    this.leads.set(id, lead);
    return lead;
  }

  async getLead(id: string): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async getAllLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values());
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead | undefined> {
    const lead = this.leads.get(id);
    if (!lead) return undefined;
    
    const updatedLead = { ...lead, ...updates };
    this.leads.set(id, updatedLead);
    return updatedLead;
  }

  async deleteLead(id: string): Promise<boolean> {
    return this.leads.delete(id);
  }
}

export const storage = new MemStorage();
