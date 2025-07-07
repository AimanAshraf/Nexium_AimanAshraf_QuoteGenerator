import express from 'express';
import 'dotenv/config';
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const endpoint = process.env.AZURE_AI_ENDPOINT || "https://models.github.ai/inference";
const model = process.env.AZURE_AI_MODEL || "openai/gpt-4.1";
const key = process.env.AZURE_AI_KEY;

async function getQuote(keyword = "motivation") {
  try {
    const client = ModelClient(endpoint, new AzureKeyCredential(key));
    
    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { 
            role: "system", 
            content: `You are a creative quote generator. 
                     Generate exactly 3 motivational quotes about the given topic.
                     Format each quote EXACTLY like this between quotes:
                     1. "First quote text"
                     2. "Second quote text"
                     3. "Third quote text"`
          },
          { 
            role: "user", 
            content: `Generate 3 different motivational quotes about "${keyword}".
                     Each should be under 120 characters.
                     Use the exact format with numbers and quotes as shown.`
          }
        ],
        temperature: 0.7,
        max_tokens: 400,
        model: model
      }
    });

    if (isUnexpected(response)) {
      console.error('API Error:', response.body);
      throw new Error(response.body.error?.message || "API request failed");
    }

    const content = response.body?.choices?.[0]?.message?.content || "";
    console.log('API Content:', content);
    const quotes = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      const match = line.match(/\d+\.\s*"(.*?)"/) || line.match(/\d+\.\s*(.*)/);
      if (match && match[1]) {
        quotes.push(match[1].trim());
      }
    });

    if (quotes.length === 0) {
      const fallbackQuotes = content.match(/"(.*?)"/g);
      if (fallbackQuotes) {
        quotes.push(...fallbackQuotes.map(q => q.replace(/^"|"$/g, '')));
      }
    }

    if (quotes.length === 0) {
      quotes.push(
        "Believe you can and you're halfway there",
        "The only way to do great work is to love what you do",
        "Success is not final, failure is not fatal"
      );
      console.warn('Using fallback quotes');
    }

    return quotes.slice(0, 3);
  } catch (err) {
    console.error("Error in getQuote:", err);
    throw err;
  }
}

export default async function handler(req, res) {
  try {
    const keyword = req.body?.keyword || req.query?.keyword || "motivation";
    const quotes = await getQuote(keyword);
    res.status(200).json({ quotes });
  } catch (error) {
    console.error("Error fetching quote:", error);
    res.status(500).json({ 
      error: error.message || "Failed to fetch quotes",
      quotes: [
        "Sometimes the greatest wisdom comes from silence",
        "Even when systems fail, the human spirit prevails",
        "This temporary setback will lead to greater understanding"
      ]
    });
  }
}

app.post('/api/quote', async (req, res) => {
  try {
    const { keyword } = req.body;
    const quotes = await getQuote(keyword);
    res.json({ quotes });
  } catch (err) {
    res.status(500).json({ 
      error: err.message,
      quotes: [
        "Adversity reveals true character",
        "Every problem is an opportunity in disguise",
        "Persistence will overcome resistance"
      ]
    });
  }
});

if (process.env.VERCEL !== "1") {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}
