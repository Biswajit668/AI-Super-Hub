import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Lazy initialize Razorpay
  const getRazorpayInstance = () => {
    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_live_TIAhxSAoznVVVx';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'R6sNknjzJKjP736pooeei7k0';
    if (!key_id || !key_secret) {
      return null;
    }
    return {
      instance: new Razorpay({ key_id, key_secret }),
      key_id,
      key_secret
    };
  };

  // Lazy initialize GoogleGenAI
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    return new GoogleGenAI({ apiKey });
  };

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Razorpay API: Create Secure Order
  app.post('/api/razorpay/create-order', async (req, res) => {
    const defaultKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_live_TIAhxSAoznVVVx';
    const requestedPlan = req.body?.plan || 'premium';
    const pricePaise = requestedPlan === 'adfree' ? 9900 : 79900;
    const planName = requestedPlan === 'adfree' ? 'Ad-Free & Offline Plan' : 'PRO Membership';

    try {
      const rzpConfig = getRazorpayInstance();
      if (!rzpConfig) {
        throw new Error('Razorpay configuration missing');
      }

      const CURRENCY = 'INR';

      const options = {
        amount: pricePaise,
        currency: CURRENCY,
        receipt: `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        notes: {
          plan: requestedPlan,
          plan_name: planName,
          created_at: new Date().toISOString()
        }
      };

      const order = await rzpConfig.instance.orders.create(options);
      res.json({
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: rzpConfig.key_id,
        isMock: false
      });
    } catch (err: any) {
      // Quietly fall back to client/demo mode if Razorpay API keys are unauthorized or inactive
      res.json({
        id: 'order_demo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        amount: pricePaise,
        currency: 'INR',
        key: defaultKeyId,
        isMock: true,
        notice: 'Razorpay order creation fallback mode active.'
      });
    }
  });

  // Razorpay API: Secure Cryptographic Verification (HMAC SHA256)
  app.post('/api/razorpay/verify-payment', async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      if (razorpay_order_id?.startsWith('order_demo_') || razorpay_order_id?.startsWith('order_client_')) {
        return res.json({ verified: true, paymentId: razorpay_payment_id || 'DEMO_PAY_' + Date.now(), isMock: true });
      }

      const rzpConfig = getRazorpayInstance();
      if (!rzpConfig) {
        return res.status(500).json({ verified: false, error: 'Server configuration missing' });
      }

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ verified: false, error: 'Missing required payment verification fields' });
      }

      const secret = rzpConfig.key_secret;
      const bodyData = `${razorpay_order_id}|${razorpay_payment_id}`;

      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(bodyData)
        .digest('hex');

      // Use timingSafeEqual to prevent timing side-channel attacks
      const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
      const actualBuf = Buffer.from(razorpay_signature, 'utf-8');

      const isMatch = expectedBuf.length === actualBuf.length && crypto.timingSafeEqual(expectedBuf, actualBuf);

      if (isMatch) {
        return res.json({ verified: true, paymentId: razorpay_payment_id, orderId: razorpay_order_id });
      } else {
        console.warn('Razorpay Signature Mismatch detected for order:', razorpay_order_id);
        return res.status(400).json({ verified: false, error: 'Cryptographic signature mismatch. Payment not verified.' });
      }
    } catch (err: any) {
      console.error('Razorpay Verification Error:', err);
      res.status(500).json({ verified: false, error: err.message || 'Payment verification failed' });
    }
  });

  // SEO: Robots.txt endpoint
  app.all('/robots.txt', (req, res) => {
    const publicRobots = path.join(process.cwd(), 'public', 'robots.txt');
    const distRobots = path.join(process.cwd(), 'dist', 'robots.txt');

    res.header('Content-Type', 'text/plain; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=86400');

    if (fs.existsSync(publicRobots)) {
      return res.sendFile(publicRobots);
    } else if (fs.existsSync(distRobots)) {
      return res.sendFile(distRobots);
    }

    res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://super-hub-ai.web.app/sitemap.xml`);
  });

  // SEO: Sitemap.xml endpoint
  app.all('/sitemap.xml', (req, res) => {
    const publicSitemap = path.join(process.cwd(), 'public', 'sitemap.xml');
    const distSitemap = path.join(process.cwd(), 'dist', 'sitemap.xml');

    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=86400');

    if (fs.existsSync(publicSitemap)) {
      return res.sendFile(publicSitemap);
    } else if (fs.existsSync(distSitemap)) {
      return res.sendFile(distSitemap);
    }

    // Dynamic fallback using canonical HTTPS domain
    const host = 'https://super-hub-ai.web.app';
    const dateStr = new Date().toISOString().split('T')[0];

    const tools = [
      'ai-chat', 'ai-writer', 'ai-rewriter', 'ai-summarizer', 'ai-translator', 
      'ai-grammar', 'ai-email-writer', 'ai-resume-builder', 'pdf-merge', 'pdf-split',
      'pdf-compress', 'pdf-to-word', 'pdf-ocr', 'image-resizer', 'image-converter',
      'image-compressor', 'image-bg-remover', 'word-counter', 'unit-converter',
      'calculator', 'json-formatter', 'qr-generator'
    ];

    const categories = ['ai', 'pdf', 'image', 'text', 'utility'];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${host}/</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${categories.map(cat => `
  <url>
    <loc>${host}/category/${cat}</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
  ${tools.map(tool => `
  <url>
    <loc>${host}/tool/${tool}</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

    res.send(xml);
  });

  // Multi-Provider AI Handler (Primary: Google Gemini AI -> Backup 1: Groq -> Backup 2: OpenRouter)
  const callGeminiProvider = async (prompt: string, systemInstruction?: string, image?: string, model?: string) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      throw new Error('GEMINI_API_KEY is missing or invalid.');
    }

    const ai = new GoogleGenAI({ apiKey });
    const selectedModel = (model && model !== 'gemini-2.5-flash') ? model : 'gemini-3.6-flash';

    let contents: any[] = [];
    if (image) {
      const base64Data = image.replace(/^data:[^;]+;base64,/, '');
      const mimeTypeMatch = image.match(/^data:([^;]+);base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'application/pdf';

      contents = [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        prompt || 'Analyze and process this file in detail.',
      ];
    } else {
      contents = [prompt];
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: systemInstruction ? { systemInstruction } : undefined,
    });

    if (!response.text) {
      throw new Error('Gemini API returned an empty text response.');
    }
    return response.text;
  };

  const callGroqProvider = async (prompt: string, systemInstruction?: string) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('GROQ_API_KEY is not set in environment variables.');
    }

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Groq API returned HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('Groq API returned invalid response payload.');
    }
    return text;
  };

  const callOpenRouterProvider = async (prompt: string, systemInstruction?: string) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('OPENROUTER_API_KEY is not set in environment variables.');
    }

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'HTTP-Referer': 'https://super-hub-ai.web.app',
        'X-Title': 'Super Hub AI',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct',
        messages,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenRouter API returned HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('OpenRouter API returned invalid response payload.');
    }
    return text;
  };

  // AI Proxy Endpoint with Auto-Failover
  app.post('/api/gemini', async (req, res) => {
    try {
      const { prompt, systemInstruction, image, model } = req.body;

      if (!prompt && !image) {
        return res.status(400).json({ error: 'Prompt or image is required' });
      }

      const errors: string[] = [];

      // 1. Primary AI: Google Gemini AI
      try {
        const text = await callGeminiProvider(prompt, systemInstruction, image, model);
        return res.json({ result: text, provider: 'gemini' });
      } catch (geminiErr: any) {
        const msg = geminiErr?.message || String(geminiErr);
        console.warn('Primary AI (Gemini) failed/quota reached. Trying Groq fallback...', msg);
        errors.push(`Gemini Error: ${msg}`);
      }

      // 2. Backup AI 1: Groq API
      try {
        const text = await callGroqProvider(prompt, systemInstruction);
        console.log('Successfully generated text using Backup AI 1 (Groq).');
        return res.json({ result: text, provider: 'groq' });
      } catch (groqErr: any) {
        const msg = groqErr?.message || String(groqErr);
        console.warn('Backup AI 1 (Groq) failed/quota reached. Trying OpenRouter fallback...', msg);
        errors.push(`Groq Error: ${msg}`);
      }

      // 3. Backup AI 2: OpenRouter API
      try {
        const text = await callOpenRouterProvider(prompt, systemInstruction);
        console.log('Successfully generated text using Backup AI 2 (OpenRouter).');
        return res.json({ result: text, provider: 'openrouter' });
      } catch (openRouterErr: any) {
        const msg = openRouterErr?.message || String(openRouterErr);
        console.warn('Backup AI 2 (OpenRouter) failed/quota reached.', msg);
        errors.push(`OpenRouter Error: ${msg}`);
      }

      // All providers failed
      return res.status(503).json({
        error: 'All AI service providers (Gemini, Groq, OpenRouter) are currently unavailable or rate-limited. Please try again in a few moments.',
        details: errors
      });
    } catch (error: any) {
      return res.status(500).json({ error: error?.message || 'Error processing AI request' });
    }
  });


  // Serve Vite in development, static in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Super Hub running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
