import React, { useRef } from 'react'

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
    const inputRef = useRef(null);
    const handleSubmit = (e) => {
        e.preventDefault();
        const message = inputRef.current.value.trim();
        if (!message) return;
        inputRef.current.value = "";
        // Add user message to chat history
        setChatHistory(history => [...history, { role: "user", text: `${message}` }]);
    
    }

    return (
        <form action="" className="chat-form" onSubmit={handleSubmit}>
            <input ref={inputRef} type="text" placeholder='Nhập tin nhắn...' className="message-input" required />
            <button className="material-symbols-rounded">arrow_upward</button>
        </form>
    )
}

export default ChatForm