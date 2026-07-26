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
    let title = 'Super Hub AI - All-in-One Free AI, PDF, Image & Utility Tools Platform';
    let description = '100% Free online AI tools powered by Gemini 2.5. Generate AI text, merge & convert PDFs, remove image backgrounds, generate QR codes, convert image formats, edit code, compress files and more in one super-fast hub.';
    let keywords = 'Super Hub AI, Gemini AI, AI Chat, AI Writer, PDF Merger, Image Format Converter, Background Remover, Free AI Tools, QR Code Generator, Online Utility Suite, JPG to PNG, WebP Converter';
    let canonicalPath = '/';

    if (activeView === 'tool-runner' && selectedTool) {
      const toolTagsStr = selectedTool.tags ? selectedTool.tags.join(', ') : '';
      title = `${selectedTool.name} - Free Online Tool | Super Hub AI`;
      description = `${selectedTool.description} Use ${selectedTool.name} instantly online for free with no installation or registration required. Fast, private, and secure browser-based tool on Super Hub AI.`;
      keywords = `${selectedTool.name}, free ${selectedTool.name} online, ${selectedTool.name} converter, ${toolTagsStr}, free online tools, Super Hub AI`;
      canonicalPath = `/tool/${selectedTool.id}`;
    } else if (activeView === 'favorites') {
      title = 'My Bookmarked Tools | Super Hub AI';
      description = 'Your favorite bookmarked AI, PDF, image, and utility tools on Super Hub AI for quick 1-click access.';
      canonicalPath = '/favorites';
    } else if (activeView === 'history') {
      title = 'Activity History & Generation Logs | Super Hub AI';
      description = 'View your recent AI generations, file conversions, and tool activity logs on Super Hub AI.';
      canonicalPath = '/history';
    } else if (activeView === 'admin') {
      title = 'Admin Panel - Platform Analytics & System Settings | Super Hub AI';
      description = 'Super Hub AI administrative portal for user management, credit configuration, and platform analytics.';
      canonicalPath = '/admin';
    } else if (activeCategory !== 'all') {
      const categoryNames: Record<string, string> = {
        ai: 'AI Powered Tools & Assistants',
        pdf: 'PDF Utilities & Converters',
        image: 'Image Processors & Converters',
        text: 'Text Generators & Formatting Tools',
        calculator: 'Smart Calculators & Financial Tools',
        utility: 'Smart Utilities & Productivity Tools',
      };
      const categoryName = categoryNames[activeCategory] || activeCategory.toUpperCase();
      title = `${categoryName} - 100% Free Online Suite | Super Hub AI`;
      description = `Explore top-rated free ${categoryName.toLowerCase()} on Super Hub AI. Ultra-fast, secure, and browser-based online tools with no download required.`;
      canonicalPath = `/category/${activeCategory}`;
    }

    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://super-hub-ai.web.app';
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
    updateMeta('meta[name="author"]', 'name', 'author', 'Super Hub AI Team');
    updateMeta('meta[name="robots"]', 'name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    updateMeta('meta[name="googlebot"]', 'name', 'googlebot', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
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
    updateMeta('meta[property="og:site_name"]', 'property', 'og:site_name', 'Super Hub AI');
    updateMeta('meta[property="og:locale"]', 'property', 'og:locale', 'en_US');
    updateMeta('meta[property="og:image"]', 'property', 'og:image', ogImageUrl);

    // Twitter Card Tags
    updateMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    updateMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    updateMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    updateMeta('meta[name="twitter:image"]', 'name', 'twitter:image', ogImageUrl);
    updateMeta('meta[name="twitter:site"]', 'name', 'twitter:site', '@SuperHubAI');

    // Build JSON-LD Structured Data
    const jsonLdData: any[] = [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Super Hub AI',
        url: currentOrigin,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${currentOrigin}/?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Super Hub AI',
        url: currentOrigin,
        logo: `${currentOrigin}/icon-512.svg`,
        sameAs: [
          'https://twitter.com/SuperHubAI',
          'https://github.com/SuperHubAI',
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
    ];

    if (selectedTool) {
      // SoftwareApplication / WebApplication Schema for the selected tool
      jsonLdData.push({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: selectedTool.name,
        applicationCategory: selectedTool.category === 'ai' 
          ? 'BusinessApplication' 
          : selectedTool.category === 'pdf' || selectedTool.category === 'image' 
          ? 'MultimediaApplication' 
          : 'UtilitiesApplication',
        operatingSystem: 'All',
        url: canonicalUrl,
        description: selectedTool.description,
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        offers: {
          '@type': 'Offer',
          price: '0.00',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: selectedTool.rating ? selectedTool.rating.toString() : '4.9',
          ratingCount: selectedTool.usageCount ? selectedTool.usageCount.toString() : '1850',
          bestRating: '5',
          worstRating: '1',
        },
        featureList: selectedTool.tags ? selectedTool.tags.join(', ') : 'Free, Online, Instant, Secure',
      });

      // HowTo Schema for the tool
      jsonLdData.push({
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: `How to use ${selectedTool.name} online for free`,
        description: `Step-by-step guide on how to use ${selectedTool.name} on Super Hub AI.`,
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Select or upload your input',
            text: `Open ${selectedTool.name} on Super Hub AI and upload your file or enter text/options.`,
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Configure parameters or click process',
            text: 'Adjust your desired options, formats, or parameters according to your requirement.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Download or copy results instantly',
            text: 'Click process or generate to receive your converted file or generated result immediately for free.',
          },
        ],
      });

      // Tool Specific FAQ Schema
      jsonLdData.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Is ${selectedTool.name} completely free on Super Hub AI?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Yes! ${selectedTool.name} is 100% free to use online with no hidden fees or required software installations.`,
            },
          },
          {
            '@type': 'Question',
            name: `Is my file or data safe when using ${selectedTool.name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Absolutely. Your privacy and file security are top priorities on Super Hub AI. Processing happens securely in your browser and on encrypted SSL servers.`,
            },
          },
          {
            '@type': 'Question',
            name: `Do I need to install any software to use ${selectedTool.name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `No installation is required! ${selectedTool.name} works directly in any modern web browser on desktop, tablet, or smartphone.`,
            },
          },
        ],
      });
    } else {
      // Platform-wide FAQ Schema
      jsonLdData.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Is Super Hub AI free to use?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! Super Hub AI offers generous free daily credits for AI chat, writing, PDF utilities, image processing, and text tools.',
            },
          },
          {
            '@type': 'Question',
            name: 'Which AI model powers Super Hub AI?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Super Hub AI is powered by Google Gemini 2.5 Flash for ultra-fast, highly contextual AI generation.',
            },
          },
          {
            '@type': 'Question',
            name: 'What tools are included in Super Hub AI?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Super Hub AI includes 100+ free online tools for AI writing & chat, PDF merging/converting, image editing & format conversion, text utilities, and financial/scientific calculators.',
            },
          },
        ],
      });
    }

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

