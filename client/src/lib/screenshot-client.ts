/**
 * Screenshot service using screenshotapi.net
 * Provides fallback behavior when API key is not available
 */

interface ScreenshotOptions {
  width?: number;
  height?: number;
  fullPage?: boolean;
  delay?: number;
  format?: 'png' | 'jpeg' | 'webp';
}

export class ScreenshotClient {
  private readonly apiKey: string | undefined;
  private readonly baseUrl = 'https://shot.screenshotapi.net/screenshot';

  constructor() {
    // API key is optional - service degrades gracefully without it
    this.apiKey = import.meta.env.VITE_SCREENSHOT_API_KEY;
    
    if (!this.apiKey) {
      console.info('Screenshot API key not found. Screenshots will be disabled, falling back to iframe previews.');
    }
  }

  /**
   * Captures a screenshot of the specified URL
   * Returns base64 encoded image string or null if service unavailable
   */
  async captureScreenshot(url: string, options: ScreenshotOptions = {}): Promise<string | null> {
    // Return null immediately if no API key is configured
    if (!this.apiKey) {
      return null;
    }

    const {
      width = 1200,
      height = 800,
      fullPage = false,
      delay = 1000,
      format = 'png'
    } = options;

    try {
      // Build the API URL with parameters
      const params = new URLSearchParams({
        token: this.apiKey,
        url: url,
        output: 'image',
        file_type: format,
        width: width.toString(),
        height: height.toString(),
        delay: delay.toString(),
        fresh: 'true', // Bypass cache for latest version
        ...(fullPage && { full_page: 'true' })
      });

      const apiUrl = `${this.baseUrl}?${params.toString()}`;
      
      console.log('Capturing screenshot for:', url);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'image/*',
        },
      });

      if (!response.ok) {
        console.error('Screenshot API error:', response.status, response.statusText);
        return null;
      }

      // Convert response to base64
      const arrayBuffer = await response.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      console.log('Screenshot captured successfully');
      return base64;

    } catch (error) {
      console.error('Screenshot capture failed:', error);
      return null;
    }
  }

  /**
   * Check if the screenshot service is available
   */
  isAvailable(): boolean {
    return Boolean(this.apiKey);
  }

  /**
   * Get service status for debugging
   */
  getStatus() {
    return {
      available: this.isAvailable(),
      hasApiKey: Boolean(this.apiKey),
      provider: 'screenshotapi.net'
    };
  }
}

// Create singleton instance
export const screenshotClient = new ScreenshotClient();