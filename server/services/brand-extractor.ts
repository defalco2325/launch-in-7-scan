import * as cheerio from 'cheerio';
import { BrandElements } from '@shared/schema';

export async function extractBrandElements(url: string): Promise<BrandElements> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract business name from title, h1, or meta
    let businessName = $('title').text().split(' - ')[0].split(' | ')[0].trim();
    if (!businessName) {
      businessName = $('h1').first().text().trim();
    }
    if (!businessName) {
      businessName = $('meta[property="og:site_name"]').attr('content') || '';
    }

    // Extract tagline from meta description or first paragraph
    let tagline = $('meta[name="description"]').attr('content') || '';
    if (!tagline) {
      tagline = $('meta[property="og:description"]').attr('content') || '';
    }
    if (!tagline) {
      tagline = $('p').first().text().trim();
    }

    // Extract logo
    let logo = $('img[alt*="logo" i]').attr('src') || 
               $('img[class*="logo" i]').attr('src') ||
               $('img[id*="logo" i]').attr('src');
    
    if (logo && logo.startsWith('/')) {
      logo = new URL(logo, url).href;
    }

    // Extract colors from CSS - simplified approach
    let primaryColor = '#3B82F6'; // Default blue
    let secondaryColor = '#10B981'; // Default green
    
    // Look for common CSS custom properties
    const styleElements = $('style').text();
    const colorMatch = styleElements.match(/--primary[^:]*:\s*([^;]+)/i);
    if (colorMatch) {
      primaryColor = colorMatch[1].trim();
    }

    // Extract font family from computed styles (simplified)
    let fontFamily = 'Inter';
    const fontMatch = styleElements.match(/font-family[^:]*:\s*([^;]+)/i);
    if (fontMatch) {
      fontFamily = fontMatch[1].replace(/['"]/g, '').split(',')[0].trim();
    }

    return {
      businessName: businessName.substring(0, 100),
      tagline: tagline.substring(0, 200),
      logo,
      primaryColor,
      secondaryColor,
      fontFamily
    };
  } catch (error) {
    console.error('Brand extraction error:', error);
    
    // Return defaults on error
    return {
      businessName: new URL(url).hostname.replace('www.', ''),
      tagline: 'Your business tagline here',
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      fontFamily: 'Inter'
    };
  }
}
