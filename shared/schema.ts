import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const scans = pgTable("scans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  // Desktop scores
  performanceScore: integer("performance_score"),
  accessibilityScore: integer("accessibility_score"),
  bestPracticesScore: integer("best_practices_score"),
  seoScore: integer("seo_score"),
  coreWebVitals: jsonb("core_web_vitals").$type<CoreWebVitals>(),
  topIssues: jsonb("top_issues").$type<Issue[]>(),
  // Mobile scores
  mobilePerformanceScore: integer("mobile_performance_score"),
  mobileAccessibilityScore: integer("mobile_accessibility_score"),
  mobileBestPracticesScore: integer("mobile_best_practices_score"),
  mobileSeoScore: integer("mobile_seo_score"),
  mobileCoreWebVitals: jsonb("mobile_core_web_vitals").$type<CoreWebVitals>(),
  mobileTopIssues: jsonb("mobile_top_issues").$type<Issue[]>(),
  screenshot: text("screenshot"),
  brandElements: jsonb("brand_elements"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  scanId: varchar("scan_id").references(() => scans.id),
  pdfReportPath: text("pdf_report_path"),
  emailSent: timestamp("email_sent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertScanSchema = createInsertSchema(scans).omit({
  id: true,
  createdAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  pdfReportPath: true,
  emailSent: true,
  createdAt: true,
});

export type InsertScan = z.infer<typeof insertScanSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Scan = typeof scans.$inferSelect;
export type Lead = typeof leads.$inferSelect;

// Brand elements types
export interface BrandElements {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  businessName?: string;
  tagline?: string;
}

// Core Web Vitals types
export interface CoreWebVitals {
  lcp: string;
  fid: string;
  cls: string;
  tbt: string;
}

// Top issues types
export interface Issue {
  title: string;
  description: string;
  severity: 'critical' | 'important' | 'minor';
}
