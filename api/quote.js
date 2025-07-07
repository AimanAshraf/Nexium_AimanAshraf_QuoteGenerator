import express from 'express';
import 'dotenv/config';
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1";
const key = process.env.AZURE_AI_KEY;

async function getQuote(keyword = "motivation") {
  try {
    const client = ModelClient(endpoint, new AzureKeyCredential(key));
    
    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { 
            role: "system", 
            content: "You are a creative quote generator. Generate 3 different motivational quotes that are inspiring and uplifting. Return them as a numbered list." 
          },
          { 
            role: "user", 
            content: `Give me 3 different motivational quotes about ${keyword}. Each quote should be under 120 characters. Format them as: 1. "quote1" 2. "quote2" 3. "quote3"` 
          }
        ],
        temperature: 0.7,
        max_tokens: 400, 
        model: model
      }
    });

    if (isUnexpected(response)) {
      throw new Error(response.body.error?.message || "API request failed");
    }

    const content = response.body.choices[0].message.content;
    return content.match(/\d+\.\s*"(.*?)"/g).map(q => q.replace(/^\d+\.\s*"/, '').replace(/"$/, ''));
  } catch (err) {
    console.error("Error in getQuote:", err);
    throw err;
  }
}

export default async function handler(req, res) {
  try {
    const quote = await getQuote(req.query.keyword || "motivation");
    res.status(200).json({ quote });
  } catch (error) {
    console.error("Error fetching quote:", error);
    res.status(500).json({ error: error.message });
  }
}

app.post('/api/quote', async (req, res) => {
  try {
    const { keyword } = req.body;
    const quotes = await getQuote(keyword);
    res.json({ quotes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
if (process.env.VERCEL !== "1") {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}
