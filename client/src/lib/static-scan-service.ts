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
      // Synchronize scan timing with animation duration (~7 seconds total)
      // Animation has 4 steps with 1.75-second intervals
      
      // Step 1: Website Analysis (1.75 seconds)
      await new Promise(resolve => setTimeout(resolve, 1750));
      
      // Step 2: Performance Scan (1.75 seconds) 
      await new Promise(resolve => setTimeout(resolve, 1750));
      
      // Step 3: Brand Extraction (1.75 seconds)
      // Start actual API calls during this phase
      const brandElementsPromise = extractBrandElements(url);
      await new Promise(resolve => setTimeout(resolve, 1750));
      
      // Step 4: Final Processing & Preview Generation (1.75 seconds)
      const scanResultsPromise = pageSpeedClient.scanWebsite(url);
      
      // Wait for both API calls to complete
      const [scanResults, brandElements] = await Promise.all([
        scanResultsPromise,
        brandElementsPromise,
      ]);
      
      // Ensure we don't finish too early - wait for remaining time if needed
      await new Promise(resolve => setTimeout(resolve, 500));

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