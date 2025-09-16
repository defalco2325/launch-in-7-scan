import { pageSpeedClient } from './pagespeed-client';
import { clientStorage } from './storage-client';
import { extractBrandElements } from './brand-extractor-client';
import { screenshotClient } from './screenshot-client';

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
      const screenshotPromise = screenshotClient.captureScreenshot(url, {
        width: 1200,
        height: 800,
        delay: 2000, // Wait 2 seconds for page to fully load
        format: 'png'
      });
      
      // Wait for all API calls to complete
      const [scanResults, brandElements, screenshot] = await Promise.all([
        scanResultsPromise,
        brandElementsPromise,
        screenshotPromise,
      ]);
      
      // Scan completes exactly when progress bar reaches 100% (at 7 seconds)
      // No additional delay needed

      // Update scan with results
      clientStorage.updateScan(scanId, {
        ...scanResults,
        brandElements,
        screenshot, // Will be base64 string or null if service unavailable
      });
    } catch (error) {
      console.error('Background scan error:', error);
      // The scan will remain in "running" state, showing that it failed
    }
  }
}

// Create singleton instance
export const staticScanService = new StaticScanService();