import React, { useEffect } from 'react';
import { ToolItem, ToolCategory } from '../types';

interface SEOProps {
  activeView: string;
  selectedTool: ToolItem | null;
  activeCategory: ToolCategory;
}

export const SEO: React.FC<SEOProps> = ({ activeView, selectedTool, activeCategory }) => {
  useEffect(() => {
    // Determine dynamic title, description, and keywords based on view/tool
    let title = 'AI Super Hub - All-in-One AI, PDF, Image & Utility Platform';
    let description = 'Free online AI tools powered by Gemini 2.5. Generate text, merge & convert PDFs, remove image backgrounds, edit code, compress files and more in one fast hub.';
    let keywords = 'AI Super Hub, Gemini AI, AI Chat, AI Writer, PDF Merger, Image Converter, Background Remover, Free AI Tools, Online Utility Suite';
    let canonicalPath = '/';

    if (activeView === 'tool-runner' && selectedTool) {
      title = `${selectedTool.name} - Free Online Tool | AI Super Hub`;
      description = `${selectedTool.description} Use ${selectedTool.name} instantly online for free on AI Super Hub. No setup required.`;
      keywords = `${selectedTool.name}, ${selectedTool.tags ? selectedTool.tags.join(', ') : ''}, AI Super Hub, free online tool`;
      canonicalPath = `/tool/${selectedTool.id}`;
    } else if (activeView === 'favorites') {
      title = 'My Bookmarked Tools | AI Super Hub';
      description = 'Your favorite bookmarked AI, PDF, image, and utility tools on AI Super Hub for quick access.';
      canonicalPath = '/favorites';
    } else if (activeView === 'history') {
      title = 'Activity History & Generation Logs | AI Super Hub';
      description = 'View your recent AI generations, conversions, and tool activity logs on AI Super Hub.';
      canonicalPath = '/history';
    } else if (activeView === 'admin') {
      title = 'Admin Panel - Platform Analytics & System Settings | AI Super Hub';
      description = 'AI Super Hub administrative portal for user management, credit configuration, and platform analytics.';
      canonicalPath = '/admin';
    } else if (activeCategory !== 'all') {
      const categoryNames: Record<string, string> = {
        ai: 'AI Powered Tools & Assistants',
        pdf: 'PDF Utilities & Converters',
        image: 'Image Processors & Converters',
        text: 'Text Generators & Formatting Tools',
        utility: 'Smart Utilities & Calculators',
      };
      const categoryName = categoryNames[activeCategory] || activeCategory.toUpperCase();
      title = `${categoryName} - Free Online Suite | AI Super Hub`;
      description = `Explore top-rated free ${categoryName.toLowerCase()} on AI Super Hub. Fast, secure, and browser-based tools.`;
      canonicalPath = `/category/${activeCategory}`;
    }

    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://ai-super-hub.app';
    const canonicalUrl = `${currentOrigin}${canonicalPath}`;
    const ogImageUrl = `${currentOrigin}/og-image.png`;

    // Update document title
    document.title = title;

    // Helper function to update or create meta tag
    const updateMeta = (selector: string, attrName: string, attrVal: string, content: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard Meta Tags
    updateMeta('meta[name="description"]', 'name', 'description', description);
    updateMeta('meta[name="keywords"]', 'name', 'keywords', keywords);
    updateMeta('meta[name="author"]', 'name', 'author', 'AI Super Hub Team');
    updateMeta('meta[name="robots"]', 'name', 'robots', 'index, follow');
    updateMeta('meta[name="theme-color"]', 'name', 'theme-color', '#4f46e5');

    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // OpenGraph Tags
    updateMeta('meta[property="og:title"]', 'property', 'og:title', title);
    updateMeta('meta[property="og:description"]', 'property', 'og:description', description);
    updateMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    updateMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
    updateMeta('meta[property="og:site_name"]', 'property', 'og:site_name', 'AI Super Hub');
    updateMeta('meta[property="og:locale"]', 'property', 'og:locale', 'en_US');
    updateMeta('meta[property="og:image"]', 'property', 'og:image', ogImageUrl);

    // Twitter Card Tags
    updateMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    updateMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    updateMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    updateMeta('meta[name="twitter:image"]', 'name', 'twitter:image', ogImageUrl);
    updateMeta('meta[name="twitter:site"]', 'name', 'twitter:site', '@AISuperHub');

    // Structured Data (JSON-LD)
    const jsonLdData = [
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'AI Super Hub',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All',
        url: currentOrigin,
        description: 'Comprehensive suite of free online AI generators, PDF utilities, image editors, text formatters, and smart productivity calculators.',
        offers: {
          '@type': 'Offer',
          price: '0.00',
          priceCurrency: 'USD',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '1250',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'AI Super Hub',
        url: currentOrigin,
        logo: `${currentOrigin}/logo.png`,
        sameAs: [
          'https://twitter.com/AISuperHub',
          'https://github.com/AISuperHub',
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: currentOrigin,
          },
          ...(selectedTool
            ? [
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: selectedTool.category.toUpperCase(),
                  item: `${currentOrigin}/category/${selectedTool.category}`,
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: selectedTool.name,
                  item: canonicalUrl,
                },
              ]
            : [
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: activeView === 'dashboard' ? 'Dashboard' : activeView,
                  item: canonicalUrl,
                },
              ]),
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Is AI Super Hub free to use?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! AI Super Hub offers generous free daily credits for AI chat, writing, PDF utilities, and image processing tools.',
            },
          },
          {
            '@type': 'Question',
            name: 'Which AI model powers AI Super Hub?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'AI Super Hub is powered by Google Gemini 2.5 Flash for ultra-fast, highly contextual AI generation.',
            },
          },
        ],
      },
    ];

    let scriptTag = document.getElementById('json-ld-structured-data');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'json-ld-structured-data';
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(jsonLdData);

  }, [activeView, selectedTool, activeCategory]);

  return null;
};
