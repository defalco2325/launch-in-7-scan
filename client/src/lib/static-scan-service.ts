import { pageSpeedClient } from './pagespeed-client';
import { clientStorage } from './storage-client';
import { extractBrandElements } from './brand-extractor-client';

export class StaticScanService {
  async startScan(url: string): Promise<{ scanId: string; status: string }> {
    // Create initial scan record
    const scanId = clientStorage.createScan(url);
    
    // Start background scanning
    this.performScan(scanId, url);
    
    return { scanId, status: 'started' };
  }

  async getScanStatus(scanId: string) {
    return clientStorage.getScan(scanId);
  }

  private async performScan(scanId: string, url: string): Promise<void> {
    try {
      // Add a small delay to simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Run scan and brand extraction in parallel
      const [scanResults, brandElements] = await Promise.all([
        pageSpeedClient.scanWebsite(url),
        extractBrandElements(url),
      ]);

      // Update scan with results
      clientStorage.updateScan(scanId, {
        ...scanResults,
        brandElements,
        // Note: Screenshot functionality would need to be handled differently in static site
        // Could use a service like htmlcsstoimage.com or prompt user to upload screenshot
        screenshot: null,
      });
    } catch (error) {
      console.error('Background scan error:', error);
      // The scan will remain in "running" state, showing that it failed
    }
  }
}

// Create singleton instance
export const staticScanService = new StaticScanService();