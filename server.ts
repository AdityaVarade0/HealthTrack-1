import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Gemini Multi-turn Chat Endpoint with Google Search Grounding
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, patientContext } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const patientInfoText = patientContext
      ? `\n\nCURRENT PATIENT CONTEXT:
Patient Name: ${patientContext.name || 'Patient'}
Known Allergies: ${patientContext.allergies?.join(', ') || 'None documented'}
Current Medications: ${patientContext.medications?.join(', ') || 'None active'}
Latest Vitals: ${patientContext.vitals || 'Not provided'}`
      : '';

    const systemInstruction = `You are "HealthTrack MedAssist", a clinically minded, empathetic personal health and pharmacotherapy assistant.
Your goal is to help patients safely understand their prescribed medications, identify potential drug or food interactions, interpret vital readings (like blood pressure categories and blood sugar ranges), and formulate constructive questions to bring to their doctor.

RULES & BOUNDARIES:
1. Always use Google Search to verify recent clinical guidelines, drug safety alerts, contraindications, and dietary warnings (e.g. grapefruit interactions with statins/calcium-channel blockers, potassium monitoring with ACE inhibitors).
2. Ground your explanations in clear, patient-friendly language while retaining clinical accuracy.
3. If the patient describes severe red-flag emergency symptoms (e.g., crushing chest pain, sudden numbness, difficulty breathing, BP > 180/120 with headache), urge immediate emergency medical services (911/local emergency).
4. Always conclude advice by reminding the patient to confirm dosage adjustments with their prescribing physician.${patientInfoText}`;

    // Map messages into standard Gemini contents format
    const contents = messages.map((m: any) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: Array.isArray(m.parts) ? m.parts : [{ text: m.content || m.text || '' }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.6,
      },
    });

    const candidate = response.candidates?.[0];
    const text = response.text || '';
    const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];
    const webSearchQueries = candidate?.groundingMetadata?.webSearchQueries || [];

    // Extract citation sources if available
    const sources = groundingChunks
      .filter((c: any) => c.web?.uri && c.web?.title)
      .map((c: any) => ({
        title: c.web.title,
        uri: c.web.uri,
      }));

    return res.json({
      reply: text,
      sources,
      webSearchQueries,
    });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to process medical query with Gemini.',
    });
  }
});

// Fast Vital Assessment Endpoint using gemini-3.1-flash-lite
app.post('/api/analyze-vitals', async (req, res) => {
  try {
    const { vitalData, patientName } = req.body;

    const prompt = `Analyze these vital readings for patient ${patientName || 'Patient'}:
Blood Pressure: ${vitalData.bp || 'N/A'} mmHg
Blood Glucose: ${vitalData.sugar || 'N/A'} mg/dL (${vitalData.sugarContext || 'fasting'})
Weight: ${vitalData.weight || 'N/A'} kg
Pulse: ${vitalData.pulse || 'N/A'} bpm
Notes: ${vitalData.notes || 'None'}

Provide:
1. Short 2-sentence clinical assessment of the values according to standard AHA/ADA ranges.
2. 2 practical lifestyle or monitoring recommendations.
3. 2 targeted questions the patient should bring to their next check-up.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        systemInstruction: 'You are a concise clinical triage AI providing swift vital reading summaries for patients.',
        temperature: 0.3,
      },
    });

    return res.json({ analysis: response.text });
  } catch (error: any) {
    console.error('Vital analysis error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to analyze vitals.' });
  }
});

// Mount Vite or serve static
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, '../dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HealthTrack server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
