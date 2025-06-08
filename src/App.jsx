import React, { useState, useEffect, useRef } from 'react'
import ChatbotIcon from './components/ChatbotIcon'
import ChatForm from './components/ChatForm'
import ChatMessage from './components/ChatMessage'
import { companyInfo } from './components/companyInfo'
  
const App = () => {
  const[chatHistory, setChatHistory] = useState([
    {
      role: "model",
      text: companyInfo,
      hideInChat: true,
    }
  ]);
  const[showChatbot, setShowChatbot] = useState(false);
  const chatBodyRef = useRef(null);
  
  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  };

  // Scroll to bottom when chat history updates
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
    
    // Get the last user message
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
            parts: [{ text: `Here is the company information you should use to answer questions: ${companyInfo}` }]
          },
          {
            role: "model",
            parts: [{ text: "I understand. I will use this company information to answer questions." }]
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
      
      // Update chat history with the bot's response
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const responseText = data.candidates[0].content.parts[0].text.replace(/\*/g, '');
        setChatHistory(prev => [...prev, {
          role: "model",
          text: responseText
        }]);
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch(error) {
      console.error("Error generating bot response:", error);
      // Add error message to chat
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
    
    <div className={`container ${showChatbot ? "show-chatbot" : ""}`}>
      <button onClick={() => setShowChatbot(prev => !prev)} id='chatbot-toggler'>
        <span className='material-symbols-rounded'>mode_comment</span>
        <span className='material-symbols-rounded'>close</span>
      </button>
      <div className='chatbot-popup'>
        {/* Chatbot Header */}
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">
              Chatbot
            </h2>
          </div>
          <button onClick={() => setShowChatbot(prev => !prev)} className="material-symbols-rounded">keyboard_arrow_down</button>
        </div>
        {/* Chatbot Body */}
        <div className="chat-body" ref={chatBodyRef}>
          <div className="message bot-message">
            <ChatbotIcon />
            <p className="message-text">
              Hello, how can I help you today?
            </p>
          </div>
          {/* Render chat history */}
          {chatHistory.map((chat, index) => (  
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>
        {/* Chatbot Footer */}
        <div className="chat-footer">
          <ChatForm chatHistory={chatHistory} setChatHistory={setChatHistory} generateBotResponse={generateBotResponse}/>
        </div>
      </div>
    </div>
  )
}

export default App