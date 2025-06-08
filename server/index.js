const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.post('/api/chat', async (req, res) => {
  try {
    const { message, companyInfo } = req.body;
    const API_KEY = 'AIzaSyB07ONZhPK-V-hYB-Vw0sFEroxtYC1r4bE';

    if (!API_KEY) {
      return res.status(500).json({ error: 'API key is missing' });
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `Đây là thông tin của công ty mà bạn có thể sử dụng để trả lời câu hỏi: ${companyInfo}` }]
          },
          {
            role: "model",
            parts: [{ text: "Tôi hiểu. Tôi sẽ sử dụng thông tin công ty này để trả lời câu hỏi." }]
          },
          {
            role: "user",
            parts: [{ text: message }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    };

    const response = await fetch(API_URL, requestOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Unknown error');
    }

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const cleanText = data.candidates[0].content.parts[0].text
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/`/g, '')
        .trim();

      res.json({ text: cleanText });
    } else {
      throw new Error("Invalid response format from API");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 