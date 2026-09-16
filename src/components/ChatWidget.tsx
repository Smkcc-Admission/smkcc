"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";
import Image from "next/image";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "สวัสดีครับ! ผม **น้องชุมชน** ยินดีให้คำแนะนำเกี่ยวกับการรับสมัครเรียนครับ มีอะไรให้ผมช่วยไหมครับ?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...newMessages, { role: "assistant", content: data.message }]);
      } else {
        setMessages([...newMessages, { role: "assistant", content: "ขออภัยครับ ระบบกำลังขัดข้องชั่วคราว" }]);
      }
    } catch (error) {
      setMessages([...newMessages, { role: "assistant", content: "ขออภัยครับ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          {/* Tooltip Bubble */}
          <div className="bg-white px-4 py-2 rounded-2xl shadow-lg border border-blue-100 text-sm font-medium text-blue-800 animate-bounce relative">
            น้องชุมชนพร้อมแนะนำการรับสมัครเรียน 🐟
            {/* Tooltip tail */}
            <div className="absolute right-[-6px] top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white border-t border-r border-blue-100 rotate-45"></div>
          </div>
          
          <button
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform bg-white overflow-hidden border-4 border-blue-500"
          >
            <Image 
              src="/mascot.jpg" 
              alt="น้องชุมชน" 
              width={64} 
              height={64} 
              className="object-cover w-full h-full"
            />
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 z-50" style={{ height: '600px', maxHeight: '85vh' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 flex justify-between items-center shadow-md z-10">
            <div className="font-bold flex items-center gap-3 text-lg">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-white">
                <Image 
                  src="/mascot.jpg" 
                  alt="น้องชุมชน" 
                  width={40} 
                  height={40} 
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                น้องชุมชน <span className="text-xs bg-blue-400 px-2 py-0.5 rounded-full ml-1 font-medium">AI</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:bg-blue-400 p-1.5 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-white flex-shrink-0 mr-2 mt-1">
                    <Image src="/mascot.jpg" alt="น้องชุมชน" width={32} height={32} className="object-cover w-full h-full" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-blue-800 leading-relaxed'
                }`}>
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                  <Image src="/mascot.jpg" alt="น้องชุมชน" width={32} height={32} className="object-cover w-full h-full" />
                </div>
                <div className="bg-white border shadow-sm rounded-2xl rounded-tl-sm py-2.5 px-4 text-gray-400 flex gap-1 items-center h-[40px]">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="พิมพ์ถามน้องชุมชนได้เลย..."
                className="flex-1 border border-gray-300 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="w-11 h-11 bg-blue-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-blue-700 hover:scale-105 transition-all shadow-md flex-shrink-0"
              >
                <Send size={18} className="ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
