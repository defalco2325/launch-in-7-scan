import type { Scan, Lead, LeaderboardEntry, BrandElements } from "@shared/schema";
import type { ScanResult } from "./pagespeed-client";

// Client-side storage service using localStorage
export class ClientStorage {
  private readonly SCANS_KEY = 'launchin7_scans';
  private readonly LEADS_KEY = 'launchin7_leads';
  private readonly LEADERBOARD_KEY = 'launchin7_leaderboard';

  // Scan operations
  createScan(url: string): string {
    const scanId = this.generateId();
    const scan: Partial<Scan> = {
      id: scanId,
      url,
      performanceScore: null,
      accessibilityScore: null,
      bestPracticesScore: null,
      seoScore: null,
      coreWebVitals: null,
      topIssues: null,
      mobilePerformanceScore: null,
      mobileAccessibilityScore: null,
      mobileBestPracticesScore: null,
      mobileSeoScore: null,
      mobileCoreWebVitals: null,
      mobileTopIssues: null,
      screenshot: null,
      brandElements: null,
      createdAt: new Date(),
    };

    this.saveToLocalStorage(this.SCANS_KEY, scanId, scan);
    return scanId;
  }

  getScan(id: string): (Scan & { status: string; progress: number }) | null {
    const scan = this.getFromLocalStorage(this.SCANS_KEY, id) as Scan | null;
    if (!scan) return null;

    const isComplete = scan.performanceScore !== null;
    return {
      ...scan,
      status: isComplete ? 'complete' : 'running',
      progress: isComplete ? 100 : 75
    };
  }

  updateScan(id: string, data: Partial<ScanResult & { brandElements?: BrandElements; screenshot?: string }>): void {
    const existingScan = this.getFromLocalStorage(this.SCANS_KEY, id);
    if (!existingScan) return;

    const updatedScan = {
      ...existingScan,
      ...data,
    };

    this.saveToLocalStorage(this.SCANS_KEY, id, updatedScan);
  }

  // Lead operations
  createLead(lead: Omit<Lead, 'id' | 'createdAt' | 'pdfReportPath' | 'emailSent'>): Lead {
    const leadId = this.generateId();
    const newLead: Lead = {
      ...lead,
      id: leadId,
      pdfReportPath: null,
      emailSent: null,
      createdAt: new Date(),
    };

    this.saveToLocalStorage(this.LEADS_KEY, leadId, newLead);
    return newLead;
  }

  getLead(id: string): Lead | null {
    return this.getFromLocalStorage(this.LEADS_KEY, id) as Lead | null;
  }

  updateLead(id: string, data: Partial<Lead>): void {
    const existingLead = this.getFromLocalStorage(this.LEADS_KEY, id);
    if (!existingLead) return;

    const updatedLead = {
      ...existingLead,
      ...data,
    };

    this.saveToLocalStorage(this.LEADS_KEY, id, updatedLead);
  }

  // Leaderboard operations
  createLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'submittedAt'>): LeaderboardEntry {
    const entryId = this.generateId();
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: entryId,
      submittedAt: new Date(),
    };

    this.saveToLocalStorage(this.LEADERBOARD_KEY, entryId, newEntry);
    return newEntry;
  }

  getAllLeaderboardEntries(): LeaderboardEntry[] {
    const allEntries = this.getAllFromLocalStorage(this.LEADERBOARD_KEY);
    return Object.values(allEntries) as LeaderboardEntry[];
  }

  // Utility methods
  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private saveToLocalStorage(key: string, id: string, data: any): void {
    try {
      const existing = this.getAllFromLocalStorage(key);
      existing[id] = data;
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private getFromLocalStorage(key: string, id: string): any | null {
    try {
      const all = this.getAllFromLocalStorage(key);
      return all[id] || null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  private getAllFromLocalStorage(key: string): Record<string, any> {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return {};
    }
  }

  // Clear all data (useful for development/testing)
  clearAll(): void {
    localStorage.removeItem(this.SCANS_KEY);
    localStorage.removeItem(this.LEADS_KEY);
    localStorage.removeItem(this.LEADERBOARD_KEY);
  }
}

// Create a singleton instance
export const clientStorage = new ClientStorage();