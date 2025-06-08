import React, { useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import ChatbotIcon from './ChatbotIcon';
import ChatForm from './ChatForm';
import ChatMessage from './ChatMessage';
import { companyInfo } from './companyInfo';
import '../index.css';

const Chatbot = ({ onClose, chatHistory, setChatHistory }) => {
  const chatBodyRef = useRef(null);

  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const generateBotResponse = async(history) => {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!API_KEY) {
      console.error("API key is missing. Please add VITE_GEMINI_API_KEY to your .env file");
      setChatHistory(prev => [...prev, {
        role: "model",
        text: "Error: API key is missing. Please check your configuration."
      }]);
      return;
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
    
    const lastUserMessage = history[history.length - 1];
    
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
            parts: [{ text: lastUserMessage.text }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    }

    try {
      const response = await fetch(API_URL, requestOptions);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error?.message || 'Unknown error'}`);
      }
      const data = await response.json();
      console.log("API Response:", data);
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        // Clean up the response text by removing markdown formatting
        const cleanText = data.candidates[0].content.parts[0].text
          .replace(/\*\*/g, '') // Remove ** marks
          .replace(/\*/g, '')   // Remove single * marks
          .replace(/`/g, '')    // Remove backticks
          .trim();              // Remove extra whitespace
        
        setChatHistory(prev => [...prev, {
          role: "model",
          text: cleanText
        }]);
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch(error) {
      console.error("Error generating bot response:", error);
      setChatHistory(prev => [...prev, {
        role: "model",
        text: `Sorry, I encountered an error: ${error.message}`
      }]);
    }
  }

  useEffect(() => {
    if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === "user") {
      generateBotResponse(chatHistory);
    }
  }, [chatHistory]);

  return (
    <div className="chatbot-container">
      <div className="chatbot-popup">
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">Q-Rise Assistant</h2>
          </div>
          <button onClick={onClose} className="close-button">
            <FaTimes />
          </button>
        </div>
        <div className="chat-body" ref={chatBodyRef}>
          <div className="message bot-message">
            <ChatbotIcon />
            <p className="message-text">
              Xin chào! Tôi là Q-Rise assistant. Tôi có thể giúp gì cho bạn hôm nay?
            </p>
          </div>
          {chatHistory.map((chat, index) => (  
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>
        <div className="chat-footer">
          <ChatForm 
            chatHistory={chatHistory} 
            setChatHistory={setChatHistory} 
            generateBotResponse={generateBotResponse}
          />
        </div>
      </div>
    </div>
  );
};

export default Chatbot; 