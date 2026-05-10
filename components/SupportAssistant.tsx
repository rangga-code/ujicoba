import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  ExternalLink, 
  Phone as WhatsApp, 
  Send as Telegram, 
  Link as LynkIcon,
  Bot,
  User,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SupportAssistantProps {
  isDark: boolean;
}

export const SupportAssistant: React.FC<SupportAssistantProps> = ({ isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'menu' | 'chat'>('menu');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const supportLinks = [
    {
      name: 'Saluran WhatsApp',
      url: 'https://whatsapp.com/channel/0029VbC7z9N9Gv7as7TuvX2Q',
      icon: WhatsApp,
      color: 'bg-green-500',
    },
    {
      name: 'Telegram Group',
      url: 'https://t.me/rangga_code',
      icon: Telegram,
      color: 'bg-blue-500',
    },
    {
      name: 'Lynk.id Portfolio',
      url: 'https://lynk.id/rangga_code',
      icon: LynkIcon,
      color: 'bg-purple-500',
    },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Gunakan key dari environment (AI Studio & Vercel Env), 
      // ATAU ganti tulisan 'ISI_API_KEY_ANDA_DISINI' dengan API Key Gemini Anda jika perlu.
      const fallbackKey = 'ISI_API_KEY_ANDA_DISINI';
      const currentKey = process.env.GEMINI_API_KEY || (fallbackKey === 'ISI_API_KEY_ANDA_DISINI' ? '' : fallbackKey);
      
      if (!currentKey) {
        const errorMessage: Message = {
          role: 'assistant',
          content: '⚠️ **API Key Gemini belum diatur.**\n\nJika Anda owner website ini, silakan masukkan **GEMINI_API_KEY** di pengaturan (Vercel Environment Variables) atau ganti langsung di kode.'
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsLoading(false);
        return;
      }
      
      const ai = new GoogleGenAI({ apiKey: currentKey });
      
      const systemPrompt = `Kamu adalah "Rangga AI", asisten cerdas untuk website "Fake iPhone Studio / Generator". 
Pencipta kamu adalah Rangga Code. 
Kamu membantu pengguna memahami cara menggunakan fitur-fitur di website ini (seperti membuat screenshot WA, media, dll).
Jawab pertanyaan dalam bahasa Indonesia yang ramah, singkat, jelas, dan asik.`;

      const chatContents = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
      chatContents.push({ role: 'user', parts: [{ text: input }] });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: chatContents,
        config: {
          systemInstruction: systemPrompt,
        }
      });

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: response.text || "Pardon me, I couldn't generate a response." 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Gemini Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I'm having trouble connecting to my brain right now. Please try again later." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "absolute bottom-20 right-0 w-[350px] md:w-[400px] max-h-[600px] rounded-[32px] shadow-2xl border overflow-hidden flex flex-col transition-colors duration-300",
              isDark ? "bg-[#0A0A0E] border-white/10" : "bg-white border-slate-200"
            )}
          >
            {/* Header */}
            <div className={cn(
              "px-6 py-5 border-b flex items-center justify-between",
              isDark ? "border-white/5 bg-white/5" : "border-slate-100 bg-slate-50"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center",
                  isDark ? "bg-white text-black" : "bg-slate-900 text-white"
                )}>
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={cn("text-sm font-black uppercase tracking-widest", isDark ? "text-white" : "text-slate-900")}>
                    {view === 'menu' ? 'Support & Help' : 'Rangga AI'}
                  </h3>
                  <p className={cn("text-[10px] font-bold uppercase tracking-widest opacity-40")}>
                    {view === 'menu' ? 'How can we help?' : 'Powered by Gemini'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (view === 'chat') setView('menu');
                  else setIsOpen(false);
                }}
                className={cn("p-2 rounded-xl transition-colors", isDark ? "hover:bg-white/5 text-white/40" : "hover:bg-slate-100 text-slate-400")}
              >
                {view === 'chat' ? <X className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 min-h-[300px]">
              {view === 'menu' ? (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isDark ? "text-white/30" : "text-slate-400")}>AI Assistant</p>
                    <button 
                      onClick={() => setView('chat')}
                      className={cn(
                        "w-full p-5 rounded-2xl border flex items-center justify-between group transition-all",
                        isDark ? "bg-white/5 border-white/5 hover:border-blue-500/30" : "bg-slate-50 border-slate-100 hover:border-blue-500/30"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="text-left">
                          <p className={cn("text-xs font-black uppercase tracking-widest", isDark ? "text-white" : "text-slate-900")}>Chat with AI</p>
                          <p className={cn("text-[9px] font-bold uppercase tracking-widest opacity-40")}>Instant Help</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 opacity-20 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isDark ? "text-white/30" : "text-slate-400")}>Official Support</p>
                    <div className="grid gap-3">
                      {supportLinks.map((link) => (
                        <a 
                          key={link.name}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className={cn(
                            "p-4 rounded-2xl border flex items-center justify-between group transition-all",
                            isDark ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white", link.color)}>
                              <link.icon className="w-4 h-4" />
                            </div>
                            <span className={cn("text-[10px] font-black uppercase tracking-widest", isDark ? "text-white/60" : "text-slate-700")}>{link.name}</span>
                          </div>
                          <ExternalLink className="w-4 h-4 opacity-20 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 h-full" ref={scrollRef}>
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                      <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center", isDark ? "bg-white/5" : "bg-slate-100")}>
                        <Bot className="w-8 h-8 text-blue-500" />
                      </div>
                      <div>
                        <p className={cn("text-xs font-black uppercase tracking-[0.2em]", isDark ? "text-white" : "text-slate-900")}>Halo! Saya Rangga AI</p>
                        <p className={cn("text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1")}>Tanyakan apa saja tentang Fake iPhone Generator</p>
                      </div>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div 
                      key={i}
                      className={cn(
                        "max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed",
                        msg.role === 'user' 
                          ? cn("ml-auto rounded-tr-none font-bold", isDark ? "bg-blue-600 text-white" : "bg-blue-500 text-white")
                          : cn("mr-auto rounded-tl-none border", isDark ? "bg-white/5 border-white/5 text-white/80" : "bg-slate-50 border-slate-100 text-slate-800")
                      )}
                    >
                      {msg.content}
                    </div>
                  ))}
                  {isLoading && (
                    <div className={cn("mr-auto max-w-[85%] p-4 rounded-2xl rounded-tl-none border flex items-center gap-3", isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100")}>
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Thinking...</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer / Input */}
            {view === 'chat' && (
              <div className={cn(
                "p-4 border-t",
                isDark ? "border-white/5 bg-white/5" : "border-slate-100 bg-slate-50/50"
              )}>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className={cn(
                      "flex-1 h-12 rounded-xl px-4 text-xs font-medium focus:outline-none transition-all",
                      isDark ? "bg-black/60 border border-white/5 text-white focus:border-blue-500/50" : "bg-white border border-slate-200 text-slate-800 focus:border-blue-500/30"
                    )}
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={isLoading || !input.trim()}
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50",
                      isDark ? "bg-white text-black hover:bg-slate-200" : "bg-slate-900 text-white hover:bg-black"
                    )}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
            
            <div className={cn("py-3 text-center border-t", isDark ? "border-white/5 bg-black/60" : "border-slate-100 bg-slate-50")}>
               <p className={cn("text-[7px] font-black uppercase tracking-[0.4em] opacity-20")}>Fake iPhone v2.0.0 // Rangga Code</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-[24px] shadow-2xl flex items-center justify-center transition-all duration-300 relative group",
          isDark 
            ? "bg-white text-black hover:shadow-white/10" 
            : "bg-slate-900 text-white hover:bg-black shadow-slate-900/20"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-7 h-7" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="relative">
              <MessageSquare className="w-7 h-7" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-inherit animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Glow effect */}
        {!isOpen && (
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </motion.button>
    </div>
  );
};
