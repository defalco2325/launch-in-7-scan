import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Scan, Lead } from '@shared/schema';
import { calculateOverallScore, determineBadge, determineTier, type ScoreSet } from '@/config/outcomes';

export class ClientPDFGenerator {
  async generateReport(scan: Scan, lead: Lead): Promise<Blob> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;

    // Colors matching the terminal theme
    const colors = {
      primary: '#0f172a',
      secondary: '#1e293b', 
      accent: '#f97316',
      text: '#ffffff',
      muted: '#64748b'
    };

    // Header
    pdf.setFillColor(15, 23, 42); // primary color
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('LaunchIn7 Website Health Report', margin, 25);

    // Client info
    const clientY = 50;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated for: ${lead.firstName} ${lead.lastName}`, margin, clientY);
    pdf.text(`Email: ${lead.email}`, margin, clientY + 5);
    if (lead.company) {
      pdf.text(`Company: ${lead.company}`, margin, clientY + 10);
    }
    pdf.text(`Website: ${scan.url}`, margin, clientY + (lead.company ? 15 : 10));
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, clientY + (lead.company ? 20 : 15));

    // Scores section
    const scoresY = clientY + 40;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Performance Scores', margin, scoresY);

    const scores = [
      { label: 'Performance', desktop: scan.performanceScore || 0, mobile: scan.mobilePerformanceScore || 0 },
      { label: 'Accessibility', desktop: scan.accessibilityScore || 0, mobile: scan.mobileAccessibilityScore || 0 },
      { label: 'Best Practices', desktop: scan.bestPracticesScore || 0, mobile: scan.mobileBestPracticesScore || 0 },
      { label: 'SEO', desktop: scan.seoScore || 0, mobile: scan.mobileSeoScore || 0 }
    ];

    let currentY = scoresY + 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    // Table headers
    pdf.text('Category', margin, currentY);
    pdf.text('Desktop', margin + 60, currentY);
    pdf.text('Mobile', margin + 100, currentY);
    currentY += 5;

    // Draw line
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;

    scores.forEach(score => {
      pdf.text(score.label, margin, currentY);
      pdf.text(`${score.desktop}/100`, margin + 60, currentY);
      pdf.text(`${score.mobile}/100`, margin + 100, currentY);
      currentY += 7;
    });

    // Overall score and badge
    currentY += 10;
    const scoreSet: ScoreSet = {
      performance: scores[0].mobile,
      accessibility: scores[1].mobile,
      bestPractices: scores[2].mobile,
      seo: scores[3].mobile
    };
    const overallScore = calculateOverallScore(scoreSet);
    const tier = determineTier(scoreSet);
    const badge = determineBadge(scoreSet, tier);

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Overall Score: ${overallScore}/100`, margin, currentY);
    pdf.text(`Badge Level: ${badge?.charAt(0).toUpperCase() + badge?.slice(1)}`, margin, currentY + 8);

    // Core Web Vitals section
    currentY += 25;
    pdf.setFontSize(16);
    pdf.text('Core Web Vitals', margin, currentY);
    currentY += 10;

    if (scan.mobileCoreWebVitals) {
      const vitals = [
        { label: 'Largest Contentful Paint (LCP)', value: scan.mobileCoreWebVitals.lcp },
        { label: 'First Input Delay (FID)', value: scan.mobileCoreWebVitals.fid },
        { label: 'Cumulative Layout Shift (CLS)', value: scan.mobileCoreWebVitals.cls },
        { label: 'Total Blocking Time (TBT)', value: scan.mobileCoreWebVitals.tbt }
      ];

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      vitals.forEach(vital => {
        pdf.text(`${vital.label}: ${vital.value}`, margin, currentY);
        currentY += 7;
      });
    }

    // Top Issues section
    currentY += 15;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Top Issues to Fix', margin, currentY);
    currentY += 10;

    if (scan.mobileTopIssues && scan.mobileTopIssues.length > 0) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      scan.mobileTopIssues.slice(0, 5).forEach((issue, index) => {
        if (currentY > pageHeight - 30) {
          pdf.addPage();
          currentY = margin;
        }
        
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}. ${issue.title}`, margin, currentY);
        currentY += 6;
        
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(issue.description, pageWidth - 2 * margin);
        lines.forEach((line: string) => {
          if (currentY > pageHeight - 20) {
            pdf.addPage();
            currentY = margin;
          }
          pdf.text(line, margin + 5, currentY);
          currentY += 5;
        });
        currentY += 5;
      });
    }

    // Footer
    const footerY = pageHeight - 20;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Generated by LaunchIn7 - Launch your website in 7 days', margin, footerY);
    pdf.text('Contact: hello@launchin7.com', pageWidth - margin - 40, footerY);

    return pdf.output('blob');
  }

  async downloadReport(scan: Scan, lead: Lead): Promise<void> {
    try {
      const pdfBlob = await this.generateReport(scan, lead);
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `website-health-report-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF report');
    }
  }
}

export const clientPDFGenerator = new ClientPDFGenerator();