import React, { useState } from 'react'
import Chatbot from './components/Chatbot'
import { companyInfo } from './components/companyInfo'
import './App.css'

const App = () => {
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      role: "model",
      text: companyInfo,
      hideInChat: true,
    }
  ]);

  return (
    <>
      <div className={`container ${showChatbot ? "show-chatbot" : ""}`}>
        <button onClick={() => setShowChatbot(prev => !prev)} id='chatbot-toggler'>
          <span className='material-symbols-rounded'>mode_comment</span>
          <span className='material-symbols-rounded'>close</span>
        </button>
        {showChatbot && (
          <Chatbot 
            onClose={() => setShowChatbot(false)} 
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
          />
        )}
      </div>
    </>
  )
}

export default App