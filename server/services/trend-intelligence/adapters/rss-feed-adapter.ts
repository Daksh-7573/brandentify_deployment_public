/**
 * RSS Feed Trend Adapter
 * 
 * Fetches trends from industry-specific RSS feeds
 * No API key required - uses public RSS feeds
 */

import { BaseTrendAdapter, RawTrendData, AdapterConfig } from './base-adapter';
import fetch from 'node-fetch';
import { parseStringPromise } from 'xml2js';

export class RSSFeedAdapter extends BaseTrendAdapter {
  private feedUrls: Map<string, string[]>;

  constructor(config: Omit<AdapterConfig, 'source'>) {
    super({
      ...config,
      source: 'rss_feed'
    });

    // Industry-specific RSS feed URLs
    this.feedUrls = new Map([
      ['Technology', [
        'https://techcrunch.com/feed/',
        'https://www.theverge.com/rss/index.xml',
        'https://www.wired.com/feed/rss'
      ]],
      ['Healthcare', [
        'https://www.healthcareitnews.com/feed',
        'https://www.fiercehealthcare.com/rss.xml'
      ]],
      ['Finance', [
        'https://www.bloomberg.com/feed/podcasts/business-news.xml',
        'https://www.reuters.com/arc/outboundfeeds/v3/rss/?outputType=xml'
      ]],
      ['Marketing', [
        'https://www.marketingweek.com/feed/',
        'https://searchengineland.com/feed'
      ]],
      ['Hospitality', [
        'https://www.hotelnewsresource.com/rss.xml',
        'https://www.hotelmanagement.net/rss.xml'
      ]],
      ['Education', [
        'https://www.edsurge.com/news.rss',
        'https://www.insidehighered.com/rss/blogs'
      ]],
      ['Real Estate', [
        'https://www.inman.com/feed/',
        'https://www.housingwire.com/feed/'
      ]]
    ]);
  }

  async fetchTrends(industry: string, domain?: string): Promise<RawTrendData[]> {
    const feeds = this.feedUrls.get(industry) || [];
    
    if (feeds.length === 0) {
      console.log(`[RSS] No feeds configured for industry: ${industry}`);
      return [];
    }

    const allTrends: RawTrendData[] = [];

    // Fetch from multiple feeds
    for (const feedUrl of feeds.slice(0, 2)) { // Limit to 2 feeds per industry
      try {
        const trends = await this.parseFeed(feedUrl, industry, domain);
        allTrends.push(...trends);
      } catch (error) {
        console.error(`[RSS] Error parsing feed ${feedUrl}:`, error);
      }
    }

    // Return top 5 most recent items
    return allTrends.slice(0, 5);
  }

  private async parseFeed(url: string, industry: string, domain?: string): Promise<RawTrendData[]> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Brandentifier-TrendBot/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const xml = await response.text();
    const parsed = await parseStringPromise(xml);

    const trends: RawTrendData[] = [];

    // Handle different RSS formats (RSS 2.0, Atom)
    const items = parsed.rss?.channel?.[0]?.item || parsed.feed?.entry || [];

    for (const item of items.slice(0, 3)) { // Top 3 per feed
      const title = this.extractText(item.title);
      const description = this.extractText(item.description || item.summary || item.content);
      const link = this.extractText(item.link || item.id);

      if (!title) continue;

      // Calculate basic relevance score
      let relevanceScore = 50;
      if (domain) {
        const domainKeywords = domain.toLowerCase().split(/\s+/);
        const contentLower = (title + ' ' + description).toLowerCase();
        const matches = domainKeywords.filter(kw => contentLower.includes(kw));
        relevanceScore = Math.min(100, 40 + (matches.length * 15));
      }

      // Calculate velocity based on recency (RSS items are usually recent)
      const pubDate = this.extractText(item.pubDate || item.published || item.updated);
      let velocityScore = 60; // Default for recent RSS items
      
      if (pubDate) {
        const publishedDate = new Date(pubDate);
        const hoursAgo = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursAgo < 6) velocityScore = 80;
        else if (hoursAgo < 24) velocityScore = 70;
        else if (hoursAgo < 48) velocityScore = 60;
        else velocityScore = 50;
      }

      trends.push({
        title,
        description: description?.substring(0, 500), // Limit description length
        url: link,
        relevanceScore,
        engagementScore: velocityScore,
        keywords: this.extractKeywords(title + ' ' + description, industry)
      });
    }

    return trends;
  }

  private extractText(field: any): string {
    if (!field) return '';
    if (typeof field === 'string') return field;
    if (Array.isArray(field) && field.length > 0) {
      const first = field[0];
      if (typeof first === 'string') return first;
      if (first && first._) return first._;
      if (first && first.$t) return first.$t;
    }
    if (field._) return field._;
    if (field.$t) return field.$t;
    return String(field);
  }

  private extractKeywords(text: string, industry: string): string[] {
    const words = text.toLowerCase().split(/\W+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
    
    return words
      .filter(w => w.length > 4 && !stopWords.has(w))
      .slice(0, 10);
  }
}
