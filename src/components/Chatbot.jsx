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
    const lastUserMessage = history[history.length - 1];
    
    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: lastUserMessage.text,
          companyInfo: companyInfo
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response from server');
      }

      const data = await response.json();
      
      setChatHistory(prev => [...prev, {
        role: "model",
        text: data.text
      }]);
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