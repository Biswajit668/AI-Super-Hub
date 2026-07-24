import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Lazy initialize Razorpay
  const getRazorpayInstance = () => {
    const key_id = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      return null;
    }
    return new Razorpay({ key_id, key_secret });
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

  // Razorpay API: Create Order
  app.post('/api/razorpay/create-order', async (req, res) => {
    try {
      const { amount = 799, currency = 'INR', plan = 'pro' } = req.body;
      const razorpay = getRazorpayInstance();

      const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mockkey123';

      if (!razorpay) {
        // Return structured mock order for testing/demo when live secret keys aren't set yet
        return res.json({
          id: 'order_mock_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          amount: Math.round(amount * 100),
          currency,
          key: keyId,
          isMock: true,
          notes: { plan },
          message: 'Razorpay sandbox mode active. To use live payments, set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'
        });
      }

      const options = {
        amount: Math.round(amount * 100), // in paise
        currency: currency,
        receipt: `receipt_${Date.now()}`,
        notes: { plan }
      };

      const order = await razorpay.orders.create(options);
      res.json({
        ...order,
        key: keyId,
        isMock: false
      });
    } catch (err: any) {
      console.error('Razorpay Order Error:', err);
      res.status(500).json({ error: err.message || 'Failed to create Razorpay order' });
    }
  });

  // Razorpay API: Verify Payment Signature
  app.post('/api/razorpay/verify-payment', async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      const secret = process.env.RAZORPAY_KEY_SECRET;

      if (!secret || razorpay_order_id?.startsWith('order_mock_')) {
        // Simulated approval for sandbox/testing mode
        return res.json({ success: true, verified: true, isMock: true });
      }

      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature === razorpay_signature) {
        return res.json({ success: true, verified: true, isMock: false });
      } else {
        return res.status(400).json({ success: false, error: 'Invalid payment signature verification' });
      }
    } catch (err: any) {
      console.error('Razorpay Verification Error:', err);
      res.status(500).json({ error: err.message || 'Payment verification failed' });
    }
  });

  // SEO: Robots.txt endpoint
  app.get('/robots.txt', (req, res) => {
    const host = `${req.protocol}://${req.get('host')}`;
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${host}/sitemap.xml`);
  });

  // SEO: Sitemap.xml endpoint
  app.get('/sitemap.xml', (req, res) => {
    const host = `${req.protocol}://${req.get('host')}`;
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

    res.type('application/xml');
    res.send(xml);
  });

  // Gemini Proxy API Endpoint
  app.post('/api/gemini', async (req, res) => {
    try {
      const { prompt, systemInstruction, image, model } = req.body;

      if (!prompt && !image) {
        return res.status(400).json({ error: 'Prompt or image is required' });
      }

      const ai = getAiClient();
      const selectedModel = model || 'gemini-2.5-flash';

      let contents: any[] = [];
      if (image) {
        // Base64 image support
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const mimeTypeMatch = image.match(/^data:(image\/\w+);base64,/);
        const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

        contents = [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          prompt || 'Describe this image in detail.',
        ];
      } else {
        contents = [prompt];
      }

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: systemInstruction ? { systemInstruction } : undefined,
      });

      return res.json({ result: response.text });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      return res.status(500).json({ error: error.message || 'Error processing request' });
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
