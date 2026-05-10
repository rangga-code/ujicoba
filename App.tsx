import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Trash2, 
  Wifi, 
  Battery, 
  Image as ImageIcon, 
  RotateCcw,
  Zap,
  Smartphone,
  User,
  MessageCircle,
  Smartphone as DeviceIcon,
  Copy,
  X,
  History as HistoryIcon,
  Layout,
  ExternalLink,
  Github,
  CheckCircle2,
  AlertCircle,
  Plus,
  Upload,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { MessageState, ChatConfig, HistoryItem } from './lib/types';

import { SupportAssistant } from './components/SupportAssistant';

const addFooterToImage = (imageUrl: string, appHost: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Ensure CORS is handled if needed
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('No canvas context'));

      const footerHeight = 180;
      canvas.width = img.width;
      canvas.height = img.height + footerHeight;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Draw footer background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, img.height, canvas.width, footerHeight);

      // Add a subtle border
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, img.height, canvas.width, 2);

      const centerX = canvas.width / 2;

      // Draw footer text
      ctx.textAlign = 'center';
      
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('Buat Fake iPhone seperti ini! 📱✨', centerX, img.height + 65);
      
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText(appHost, centerX, img.height + 115);
      
      ctx.fillStyle = '#64748b';
      ctx.font = '24px sans-serif';
      ctx.fillText('by Rangga Code', centerX, img.height + 155);

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas to Blob failed'));
      }, 'image/png');
    };
    img.onerror = () => reject(new Error('Failed to load image into canvas'));
    img.src = imageUrl;
  });
};

export default function App() {
  // --- States ---
  const [activeTab, setActiveTab] = useState<'chat' | 'media' | 'system'>('chat');
  
  // Mode specific states
  const [chatText, setChatText] = useState('Halo bang, lagi apa?');
  const [mediaData, setMediaData] = useState({
    url: '',
    caption: '',
  });

  const [message, setMessage] = useState<MessageState>({
    text: 'Halo bang, lagi apa?',
    caption: '',
    sender: 'self',
    senderName: '', 
    avatarUrl: '', 
    timestamp: '21:02',
    direction: 'right', 
    isRead: true,
    emojiStyle: 'apple',
  });

  const [config, setConfig] = useState<ChatConfig>({
    battery: 88,
    signalStrength: 4,
    wifi: true,
    carrier: 'INDOSAT',
    time: '21:02',
    isDark: true,
    isTyping: false,
    blurBackground: true,
    roundedBubble: true,
    canvasScale: 2,
    preset: 'iMessage',
    background: '', 
  });

  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('brat_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState<'media' | 'bg' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [selectedHistoryImage, setSelectedHistoryImage] = useState<string | null>(null);

  // --- Auto Theme detection ---
  useEffect(() => {
    // Check initial preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setConfig(prev => ({ ...prev, isDark: mediaQuery.matches }));

    // Listen for changes
    const handler = (e: MediaQueryListEvent) => {
      setConfig(prev => ({ ...prev, isDark: e.matches }));
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // --- Handlers ---
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'media' | 'bg' | 'avatar') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(type === 'bg' ? 'bg' : 'media');
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const data = await res.json();
      
      if (type === 'media') {
        setMediaData(prev => ({ ...prev, url: data.url }));
      } else if (type === 'bg') {
        setConfig(prev => ({ ...prev, background: data.url }));
      }
      showToast('Image uploaded successfully! 📸');
    } catch (err) {
      console.error('Upload Error:', err);
      showToast(err instanceof Error ? err.message : 'Failed to upload image.', 'error');
    } finally {
      setIsUploading(null);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    // Validation for Media Mode
    if (activeTab === 'media' && !mediaData.url) {
      showToast('Image is required for Media mode!', 'error');
      setIsGenerating(false);
      return;
    }
    
    try {
      const payload: any = {
        sender: message.sender || 'iPhone',
        message: activeTab === 'chat' ? chatText : mediaData.caption,
        timestamp: message.timestamp,
        time: config.time,
        status: {
          carrierName: config.carrier,
          carrier: config.carrier,
          batteryPercentage: Number(config.battery),
          battery: Number(config.battery),
          signalStrength: Number(config.signalStrength),
          wifi: config.wifi,
          wifiStatus: config.wifi,
          darkMode: config.isDark,
          isDark: config.isDark
        },
        readStatus: message.isRead,
        emojiStyle: message.emojiStyle
      };

      // Handle Image
      if (activeTab === 'media' && mediaData.url) {
        payload.imageUrl = mediaData.url;
        payload.image = mediaData.url;
      }

      // Handle Background
      if (config.background) {
        payload.backgroundUrl = config.background;
        payload.background = config.background;
      }
      
      // More Root Level Aliases
      payload.caption = mediaData.caption;
      payload.battery = Number(config.battery);
      payload.carrier = config.carrier;
      payload.signalStrength = Number(config.signalStrength);
      payload.wifi = config.wifi;
      payload.darkMode = config.isDark;
      payload.isDark = config.isDark;

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMsg = 'Failed to generate screenshot';
        try {
          const errData = await response.json();
          errorMsg = errData.error || errorMsg;
        } catch (e) {
          errorMsg = await response.text() || errorMsg;
        }
        throw new Error(errorMsg);
      }

      const blob = await response.blob();
      if (generatedUrl) window.URL.revokeObjectURL(generatedUrl);
      const url = window.URL.createObjectURL(blob);
      setGeneratedUrl(url);
      setSuccess(true);
      
      // Upload for persistent history
      let persistentUrl = undefined;
      try {
        const formData = new FormData();
        formData.append('image', blob, `brat-${Date.now()}.png`);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          persistentUrl = uploadData.url;
        }
      } catch (e) {
        console.warn('Failed to upload for history persistence', e);
      }

      // Save to history
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: (activeTab === 'chat' ? chatText : mediaData.caption).substring(0, 20) || 'Untitled Post',
        date: new Date().toISOString(),
        state: { 
          ...message, 
          text: activeTab === 'chat' ? chatText : mediaData.caption,
          image: activeTab === 'media' ? mediaData.url : undefined
        },
        config: { ...config },
        generatedImageUrl: persistentUrl || url
      };
      
      setHistory(prev => {
        const newHistory = [newItem, ...prev].slice(0, 20);
        // Persist only items with persistent URLs to localStorage, others will lose images on refresh but stay in history
        localStorage.setItem('brat_history', JSON.stringify(newHistory.map(item => ({
          ...item, 
          generatedImageUrl: item.generatedImageUrl?.startsWith('blob:') ? undefined : item.generatedImageUrl
        }))));
        return newHistory;
      });

      showToast('Image generated! 🚀');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async (imageUrl: string | null) => {
    if (!imageUrl) return;
    
    showToast('Memproses & Menambahkan watermark...');
    let fileToShare: File | null = null;
    const shareUrl = window.location.host;
    
    try {
      let response: Response;
      if (imageUrl.startsWith('blob:') || imageUrl.startsWith('data:')) {
        response = await fetch(imageUrl);
      } else {
        response = await fetch(`/api/download?url=${encodeURIComponent(imageUrl)}&filename=iphone-screenshot.png`);
      }
      
      const originalBlob = await response.blob();
      const localUrl = URL.createObjectURL(originalBlob);
      
      // Embed text directly into the image to prevent WhatsApp/others from dropping the text
      const annotatedBlob = await addFooterToImage(localUrl, shareUrl);
      URL.revokeObjectURL(localUrl);
      
      fileToShare = new File([annotatedBlob], 'iphone-screenshot-with-link.png', { type: 'image/png' });
    } catch (e) {
      console.error('Error creating shareable file:', e);
    }

    const shareText = `Lihat hasil screenshot Fake iPhone keren ini! 📱✨\n\nBuat kreasi unik milikmu sendiri sekarang juga, gratis dan tanpa ribet di:\n${window.location.origin}\n\nVia Rangga Code.`;
    
    if (navigator.share) {
      try {
        const shareData: ShareData = {
          title: 'Fake iPhone Studio',
          text: shareText,
        };

        if (fileToShare && navigator.canShare && navigator.canShare({ files: [fileToShare] })) {
          shareData.files = [fileToShare];
        }

        // We embed the text in the image now, no need for the scary warning!
        await navigator.share(shareData);
        showToast('Berhasil membuka menu share!', 'success');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          showToast('Batal atau gagal membagikan', 'error');
        }
      }
    } else {
      // Fallback if Web Share is not supported
      try {
        await navigator.clipboard.writeText(shareText + '\n\n' + imageUrl);
        showToast('Link & Caption disalin! PC/Browser ini tidak support native share.', 'success');
      } catch (e) {
        showToast('Gagal menyalin.', 'error');
      }
    }
  };

  const handleDownload = (url: string | null, filename = `IQC-BY-RANGGACODE-${Math.floor(100000 + Math.random() * 900000)}.png`) => {
    if (!url) return;
    
    if (url.startsWith('blob:')) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Download started! 📂');
      return;
    }

    try {
      showToast('Preparing download...');
      const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
      const link = document.createElement('a');
      link.href = proxyUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Download started! 📂');
    } catch (err) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
    }
  };

  const handleCopy = async () => {
    if (!generatedUrl) return;
    try {
      const response = await fetch(generatedUrl);
      const blob = await response.blob();
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      showToast('Copied to clipboard! 🚀');
    } catch (err) {
      showToast('Copy failed. Try downloading.', 'error');
    }
  };

  const resetAll = () => {
    setChatText('Halo bang, lagi apa?');
    setMediaData({ url: '', caption: '' });
    setMessage(prev => ({
      ...prev,
      sender: 'self',
      timestamp: '21:02',
      isRead: true,
    }));
    setConfig({
      battery: 88,
      signalStrength: 4,
      wifi: true,
      carrier: 'INDOSAT',
      time: '21:02',
      isDark: true,
      isTyping: false,
      blurBackground: true,
      roundedBubble: true,
      canvasScale: 2,
      preset: 'iMessage',
      background: '',
    });
    setGeneratedUrl(null);
    setError(null);
  };

  return (
    <div className={cn(
      "min-h-screen font-sans selection:bg-blue-600 selection:text-white transition-colors duration-500",
      config.isDark ? "bg-[#060608] text-slate-300" : "bg-slate-50 text-slate-800"
    )}>
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={cn("absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[160px]", config.isDark ? "bg-blue-600/5" : "bg-blue-600/10")} />
        <div className={cn("absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[180px]", config.isDark ? "bg-indigo-600/5" : "bg-indigo-600/10")} />
      </div>

      {/* Modern Header */}
      <header className={cn(
        "relative z-50 flex items-center justify-between px-6 md:px-12 py-5 border-b backdrop-blur-2xl sticky top-0 transition-all duration-300",
        config.isDark ? "border-white/5 bg-black/40" : "border-slate-200 bg-white/70"
      )}>
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center p-2.5 shadow-xl shadow-white/5 rotate-[-3deg] hover:rotate-0 transition-transform cursor-pointer">
             <Smartphone className="w-full h-full text-black" />
          </div>
          <div className="flex flex-col -space-y-1">
            <h1 className={cn("text-2xl font-black tracking-tighter uppercase italic leading-tight", config.isDark ? "text-white" : "text-slate-900")}>Fake</h1>
            <h1 className={cn("text-2xl font-black tracking-tighter uppercase italic leading-tight text-blue-500")}>iphone</h1>
            <div className="flex items-center gap-2 mt-2">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               <p className={cn("text-[8px] font-bold tracking-[0.1em]", config.isDark ? "text-white/30" : "text-slate-500/50")}>By Rangga Code v2.0.0</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={handleGenerate}
             disabled={isGenerating}
             className={cn(
               "px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-xl",
               config.isDark ? "bg-white text-black" : "bg-slate-900 text-white"
             )}
           >
             {isGenerating ? 'BUILDING...' : 'GENERATE'}
           </button>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8 lg:py-16 max-w-5xl flex flex-col gap-16">
        
        {/* TOP: Control Area (Input/Settings) */}
        <div className="space-y-8">
           {/* Navigation Chips */}
           <div className={cn(
             "flex p-1.5 rounded-[28px] border backdrop-blur-md overflow-x-auto no-scrollbar gap-1 scroll-smooth",
             config.isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/5"
           )}>
             {[
               { id: 'chat', label: 'Mode 1: Chat', icon: MessageCircle },
               { id: 'media', label: 'Mode 2: Media', icon: ImageIcon },
               { id: 'system', label: 'Settings', icon: DeviceIcon },
             ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex-1 min-w-[120px] lg:min-w-0 flex items-center justify-center gap-2.5 py-4 px-4 lg:px-6 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest whitespace-nowrap",
                    activeTab === tab.id 
                      ? (config.isDark ? "bg-white text-black shadow-lg shadow-white/10" : "bg-slate-900 text-white shadow-lg shadow-black/10") 
                      : (config.isDark ? "text-white/20 hover:text-white/40 hover:bg-white/5" : "text-black/30 hover:text-black/50 hover:bg-black/5")
                  )}
                >
                  <tab.icon className={cn("w-4 h-4 flex-shrink-0", activeTab === tab.id ? (config.isDark ? "text-black" : "text-white") : (config.isDark ? "text-white/20" : "text-black/30"))} />
                  <span>{tab.label}</span>
                </button>
             ))}
           </div>

           {/* Panels */}
           <div className={cn(
              "border rounded-[42px] p-8 md:p-10 backdrop-blur-3xl shadow-2xl relative overflow-hidden transition-colors duration-300",
              config.isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
           )}>
              <div className={cn("absolute top-0 right-0 p-8", config.isDark ? "opacity-5" : "opacity-[0.03]")}>
                 <Smartphone className={cn("w-32 h-32", config.isDark ? "text-white" : "text-black")} />
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'chat' && (
                  <motion.div key="chat" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-10">
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <label className={cn("text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2", config.isDark ? "text-white/40" : "text-slate-500")}>
                             <MessageCircle className="w-3 h-3 text-blue-500" /> Chat Text
                           </label>
                           <span className={cn("text-[8px] font-bold px-2 py-1 rounded-full uppercase tracking-widest", config.isDark ? "text-white/10 bg-white/5" : "text-slate-400 bg-slate-200/50")}>{chatText.length} Chars</span>
                        </div>
                        <textarea 
                          value={chatText} 
                          onChange={(e) => setChatText(e.target.value)}
                          className={cn(
                            "w-full border rounded-3xl p-6 min-h-[180px] focus:outline-none transition-all font-medium text-base resize-none shadow-inner custom-scrollbar",
                            config.isDark ? "bg-black/60 border-white/10 text-white placeholder:text-white/10 focus:border-blue-500/50" : "bg-slate-50 border-black/5 text-slate-800 placeholder:text-black/10 focus:border-blue-500/30"
                          )}
                          placeholder="Type the message content here..."
                        />
                     </div>

                  </motion.div>
                )}

                {activeTab === 'media' && (
                  <motion.div key="media" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-10">
                     {/* Media Attachment */}
                     <div className="space-y-4">
                        <label className={cn("text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2", config.isDark ? "text-white/40" : "text-slate-500")}><ImageIcon className="w-3 h-3 text-purple-500" /> Image (Required)</label>
                        <div className={cn("relative overflow-hidden border rounded-[32px] p-6 lg:p-8", config.isDark ? "bg-black/60 border-white/10" : "bg-slate-50/50 border-slate-200")}>
                           <div className="grid md:grid-cols-[200px_1fr] gap-8">
                              <div className={cn("aspect-square border border-dashed rounded-2xl relative overflow-hidden flex flex-col items-center justify-center", config.isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200")}>
                                 {mediaData.url ? (
                                    <>
                                       <img src={mediaData.url} className="w-full h-full object-cover opacity-80" />
                                       <button onClick={() => setMediaData(prev => ({...prev, url: ''}))} className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors"><X className="w-3 h-3" /></button>
                                    </>
                                 ) : (
                                    <div className="text-center p-4">
                                       <ImageIcon className={cn("w-10 h-10 mx-auto mb-3", config.isDark ? "text-white/5" : "text-black/5")} />
                                       <p className={cn("text-[9px] font-black uppercase tracking-widest", config.isDark ? "text-white/10" : "text-black/10")}>No Media Attached</p>
                                    </div>
                                 )}
                              </div>
                              <div className="flex flex-col justify-center space-y-6">
                                 <div className="flex flex-col md:flex-row gap-3">
                                    <label className="flex-1">
                                       <div className={cn(
                                          "cursor-pointer h-[58px] rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3",
                                          config.isDark ? "bg-white/5 border-white/10 text-white/40 hover:bg-white/10" : "bg-slate-200/50 border-black/5 text-slate-600 hover:bg-slate-200"
                                       )}>
                                          {isUploading === 'media' ? <RotateCcw className="w-4 h-4 animate-spin text-blue-500" /> : <Upload className="w-4 h-4" />}
                                          <span>Upload Image</span>
                                       </div>
                                       <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          setIsUploading('media');
                                          try {
                                             const formData = new FormData();
                                             formData.append('image', file);
                                             const res = await fetch('/api/upload', { method: 'POST', body: formData });
                                             if (!res.ok) throw new Error('Upload failed');
                                             const data = await res.json();
                                             setMediaData(prev => ({ ...prev, url: data.url }));
                                             showToast('Image uploaded! 📸');
                                          } catch (err) {
                                             showToast('Upload failed', 'error');
                                          } finally {
                                             setIsUploading(null);
                                          }
                                       }} />
                                    </label>
                                    <input 
                                      value={mediaData.url} 
                                      onChange={(e) => setMediaData(prev => ({...prev, url: e.target.value}))}
                                      placeholder="Paste image URL..."
                                      className={cn(
                                         "flex-[1.5] h-[58px] border rounded-2xl px-6 focus:outline-none text-xs font-medium transition-all",
                                         config.isDark ? "bg-black/40 border-white/10 text-white placeholder:text-white/20" : "bg-slate-50 border-black/5 text-slate-800 placeholder:text-slate-400"
                                      )}
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className={cn("text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2", config.isDark ? "text-white/40" : "text-slate-500")}><MessageCircle className="w-3 h-3 text-purple-500" /> Caption (Optional)</label>
                        <input 
                          value={mediaData.caption} 
                          onChange={(e) => setMediaData(prev => ({...prev, caption: e.target.value}))}
                          placeholder="Write an optional caption..."
                          className={cn(
                             "w-full h-[58px] border rounded-2xl px-6 focus:outline-none text-sm transition-all",
                             config.isDark ? "bg-black/60 border-white/10 text-white placeholder:text-white/20" : "bg-slate-50 border-black/5 text-slate-800 placeholder:text-slate-400"
                          )}
                        />
                     </div>

                     <div className="space-y-4">
                        <label className={cn("text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2", config.isDark ? "text-white/40" : "text-slate-500")}><ImageIcon className="w-3 h-3 text-purple-500" /> Background (Optional)</label>
                        <div className="flex flex-col md:flex-row gap-3">
                           <label className="flex-1">
                              <div className={cn(
                                 "cursor-pointer h-[58px] rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3",
                                 config.isDark ? "bg-white/5 border-white/10 text-white/40 hover:bg-white/10" : "bg-slate-200/50 border-black/5 text-slate-600 hover:bg-slate-200"
                              )}>
                                 {isUploading === 'bg' ? <RotateCcw className="w-4 h-4 animate-spin text-amber-500" /> : <Upload className="w-4 h-4" />}
                                 <span>Upload Background</span>
                              </div>
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'bg')} />
                           </label>
                           <input 
                             value={config.background} 
                             onChange={(e) => setConfig(prev => ({...prev, background: e.target.value}))}
                             placeholder="Wallpaper URL..."
                             className={cn(
                                "flex-[1.5] h-[58px] border rounded-2xl px-6 focus:outline-none text-xs font-medium transition-all",
                                config.isDark ? "bg-black/40 border-white/10 text-white placeholder:text-white/20" : "bg-slate-50 border-black/5 text-slate-800 placeholder:text-slate-400"
                             )}
                           />
                        </div>
                     </div>
                  </motion.div>
                )}

                {activeTab === 'system' && (
                  <motion.div key="system" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-12">
                     <div className="grid md:grid-cols-2 gap-10">
                        {/* Custom Wall */}
                        <div className="space-y-4 text-center md:text-left">
                           <label className={cn("text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center md:justify-start gap-2", config.isDark ? "text-white/40" : "text-slate-500")}><Layout className="w-3 h-3 text-amber-500" /> Custom Wallpaper</label>
                           <div className={cn(
                             "relative group overflow-hidden rounded-3xl p-6 transition-all border",
                             config.isDark ? "bg-black/60 border-white/10 hover:border-amber-500/20" : "bg-slate-50 border-slate-200 hover:border-amber-500/40"
                           )}>
                              <div className={cn(
                                "aspect-video rounded-2xl flex flex-col items-center justify-center border border-dashed relative overflow-hidden group shadow-2xl",
                                config.isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-200"
                              )}>
                                 {config.background ? (
                                    <>
                                      <img src={config.background} className="absolute inset-0 w-full h-full object-cover" />
                                      <button onClick={() => setConfig(prev => ({...prev, background: ''}))} className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-black/80 text-white hover:bg-red-500"><X className="w-3 h-3" /></button>
                                    </>
                                 ) : (
                                   <p className={cn("relative z-10 text-[9px] font-black uppercase tracking-[.4em] px-8 text-center leading-relaxed", config.isDark ? "text-white/10" : "text-slate-300")}>Default System Background</p>
                                 )}
                              </div>
                              <div className="mt-5 flex flex-col gap-3">
                                <label className="block w-full">
                                   <div className={cn(
                                     "cursor-pointer h-[52px] rounded-2xl border text-[10px] font-black uppercase text-center tracking-[0.1em] transition-colors flex items-center justify-center gap-3",
                                     config.isDark ? "bg-white/5 border-white/10 text-white/60 hover:bg-white/10" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                                   )}>
                                      {isUploading === 'bg' ? <RotateCcw className="w-4 h-4 animate-spin text-amber-500" /> : <Upload className="w-4 h-4" />} Upload Wallpaper
                                   </div>
                                   <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'bg')} />
                                </label>
                                <input 
                                  value={config.background || ''} 
                                  onChange={(e) => setConfig(prev => ({...prev, background: e.target.value}))}
                                  placeholder="Wallpaper Direct URL"
                                  className={cn(
                                    "w-full h-11 border rounded-xl px-4 text-[10px] font-bold focus:outline-none transition-all",
                                    config.isDark ? "bg-black/40 border-white/5 text-white/40 placeholder:text-white/10" : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-300"
                                  )} 
                                />
                              </div>
                           </div>
                        </div>

                        <div className="space-y-10">
                           {/* Status Rows */}
                           <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <label className={cn("text-[10px] font-black uppercase tracking-[0.2em] pl-1", config.isDark ? "text-white/40" : "text-slate-500")}>Bar Time</label>
                                <input type="text" value={config.time} onChange={(e) => setConfig(prev => ({...prev, time: e.target.value}))} className={cn("w-full h-[52px] border rounded-2xl px-6 focus:outline-none font-black text-xs text-center transition-all", config.isDark ? "bg-black/60 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-800")} />
                              </div>
                              <div className="space-y-3">
                                <label className={cn("text-[10px] font-black uppercase tracking-[0.2em] pl-1", config.isDark ? "text-white/40" : "text-slate-500")}>Carrier</label>
                                <input type="text" value={config.carrier} onChange={(e) => setConfig(prev => ({...prev, carrier: e.target.value}))} className={cn("w-full h-[52px] border rounded-2xl px-6 focus:outline-none font-black text-xs uppercase tracking-widest text-center transition-all", config.isDark ? "bg-black/60 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-800")} />
                              </div>
                           </div>

                           <div className={cn("space-y-8 p-6 border rounded-3xl transition-all", config.isDark ? "bg-black/60 border-white/10" : "bg-slate-50 border-slate-200")}>
                              <div className="space-y-4">
                                 <div className="flex justify-between items-center px-1">
                                    <label className={cn("text-[10px] font-black uppercase tracking-widest flex items-center gap-2", config.isDark ? "text-white/30" : "text-slate-400")}><Battery className="w-3 h-3" /> Battery Percentage</label>
                                    <span className={cn("text-[10px] font-black", config.isDark ? "text-white" : "text-slate-900")}>{config.battery}%</span>
                                 </div>
                                 <input type="range" min="0" max="100" value={config.battery} onChange={(e) => setConfig(prev => ({...prev, battery: parseInt(e.target.value)}))} className={cn("w-full accent-blue-500 h-1.5 rounded-full cursor-pointer transition-all", config.isDark ? "bg-white/5" : "bg-slate-200")} />
                              </div>

                              <div className="space-y-4">
                                 <div className="flex justify-between items-center px-1">
                                    <label className={cn("text-[10px] font-black uppercase tracking-widest flex items-center gap-2", config.isDark ? "text-white/30" : "text-slate-400")}><Smartphone className="w-3 h-3" /> Signal (Bars 0-4)</label>
                                    <div className="flex gap-2 items-end h-8">
                                       {[0, 1, 2, 3, 4].map(bar => (
                                          <button 
                                            key={bar} 
                                            onClick={() => setConfig(prev => ({...prev, signalStrength: bar}))}
                                            className={cn(
                                               "w-4 rounded-[2px] transition-all cursor-pointer relative group",
                                               bar === 0 ? cn("w-6 border flex items-center justify-center text-[8px] font-bold", config.isDark ? "border-white/10" : "border-slate-300") : "",
                                               bar <= config.signalStrength && bar !== 0 ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : (config.isDark ? "bg-white/10" : "bg-slate-200")
                                            )} 
                                            style={{ height: bar === 0 ? '20px' : `${bar * 6 + 8}px` }} 
                                          >
                                             {bar === 0 && "OFF"}
                                             <div className={cn("absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none", config.isDark ? "bg-black text-white" : "bg-slate-800 text-white")}>{bar}</div>
                                          </button>
                                       ))}
                                    </div>
                                 </div>
                              </div>

                              <div className={cn("pt-6 border-t flex items-center justify-between", config.isDark ? "border-white/5" : "border-slate-200")}>
                                 <div className="flex flex-col gap-1">
                                    <label className={cn("text-[10px] font-black uppercase tracking-widest flex items-center gap-2 font-mono", config.isDark ? "text-white/30" : "text-slate-400")}><Wifi className="w-3 h-3" /> WiFi Status</label>
                                    <span className={cn("text-[8px] font-bold uppercase tracking-widest", config.isDark ? "text-white/10" : "text-slate-300")}>{config.wifi ? 'Connected' : 'Disconnected'}</span>
                                 </div>
                                 <button 
                                   onClick={() => setConfig(prev => ({...prev, wifi: !prev.wifi}))}
                                   className={cn(
                                     "w-14 h-8 rounded-full p-1.5 transition-all duration-300 cursor-pointer relative",
                                     config.wifi ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]" : (config.isDark ? "bg-white/10" : "bg-slate-200")
                                   )}
                                 >
                                   <div className={cn("w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center", config.wifi ? "translate-x-6" : "translate-x-0")}>
                                      <div className={cn("w-1 h-3 rounded-full transition-colors", config.wifi ? "bg-green-500" : "bg-slate-300")} />
                                   </div>
                                 </button>
                              </div>

                              <div className={cn("pt-6 border-t flex items-center justify-between", config.isDark ? "border-white/5" : "border-slate-200")}>
                                 <div className="flex flex-col gap-1">
                                    <label className={cn("text-[10px] font-black uppercase tracking-widest flex items-center gap-2 font-mono", config.isDark ? "text-white/30" : "text-slate-400")}><Layout className="w-3 h-3" /> Dark Mode</label>
                                    <span className={cn("text-[8px] font-bold uppercase tracking-widest", config.isDark ? "text-white/10" : "text-slate-300")}>{config.isDark ? 'Dark Theme' : 'Light Theme'}</span>
                                 </div>
                                 <button 
                                   onClick={() => setConfig(prev => ({...prev, isDark: !prev.isDark}))}
                                   className={cn(
                                     "w-14 h-8 rounded-full p-1.5 transition-all duration-300 cursor-pointer",
                                     config.isDark ? "bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]" : "bg-slate-200 border border-black/5"
                                   )}
                                 >
                                   <div className={cn("w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300", config.isDark ? "translate-x-6" : "translate-x-0")} />
                                 </button>
                              </div>
                           </div>

                           <div className="space-y-4">
                              <label className={cn("text-[10px] font-black uppercase tracking-[0.2em] pl-1", config.isDark ? "text-white/40" : "text-slate-500")}>Emoji Style</label>
                              <div className="grid grid-cols-2 gap-3">
                                {['apple', 'google'].map((v) => (
                                  <button 
                                   key={v}
                                   onClick={() => setMessage(prev => ({...prev, emojiStyle: v as any}))}
                                   className={cn(
                                     "py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                     message.emojiStyle === v 
                                       ? (config.isDark ? "bg-white border-white text-black shadow-lg" : "bg-slate-900 border-slate-900 text-white shadow-lg") 
                                       : (config.isDark ? "bg-white/5 border-white/5 text-white/20 hover:bg-white/10" : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50")
                                   )}
                                  >
                                    {v} OS
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            <div className={cn("pt-8 border-t space-y-4", config.isDark ? "border-white/5" : "border-slate-200")}>
                               <label className={cn("text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2", config.isDark ? "text-white/40" : "text-slate-500")}><Smartphone className="w-3 h-3 text-blue-500" /> Message Time</label>
                               <input 
                                 type="text" 
                                 value={message.timestamp}
                                 onChange={(e) => setMessage(prev => ({...prev, timestamp: e.target.value}))}
                                 className={cn(
                                   "w-full h-[58px] border rounded-2xl px-6 focus:outline-none transition-all font-black text-xs text-center tracking-widest",
                                   config.isDark ? "bg-black/60 border-white/10 text-white focus:border-blue-500/50" : "bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500/30"
                                 )}
                                 placeholder="21:45"
                               />
                            </div>
                            
                            <div className="space-y-4 pt-4">
                               <label className={cn("text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2", config.isDark ? "text-white/40" : "text-slate-500")}><Layout className="w-3 h-3 text-blue-500" /> Message Side</label>
                               <div className={cn("flex gap-2 p-1.5 rounded-2xl border transition-all", config.isDark ? "bg-black/60 border-white/5" : "bg-slate-50 border-slate-200")}>
                                  {['other', 'self'].map((s) => (
                                    <button
                                      key={s}
                                      onClick={() => setMessage(prev => ({...prev, sender: s as any}))}
                                      className={cn(
                                        "flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        message.sender === s 
                                          ? (config.isDark ? "bg-white text-black shadow-xl" : "bg-white text-slate-900 shadow-md border border-slate-200") 
                                          : (config.isDark ? "text-white/20 hover:text-white/40" : "text-slate-400 hover:text-slate-600")
                                      )}
                                    >
                                      {s === 'other' ? 'Recipient' : 'Sender'}
                                    </button>
                                  ))}
                               </div>
                            </div>

                            <div className="space-y-4 pt-4">
                               <label className={cn("text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2", config.isDark ? "text-white/40" : "text-slate-500")}>
                                  <CheckCircle2 className="w-3 h-3 text-blue-500" /> Read Status
                               </label>
                               <div className="grid grid-cols-2 gap-3">
                                  {[true, false].map((v) => (
                                     <button 
                                       key={String(v)}
                                       onClick={() => setMessage(prev => ({...prev, isRead: v}))}
                                       className={cn(
                                         "py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                         message.isRead === v 
                                           ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20" 
                                           : (config.isDark ? "bg-white/5 border-white/5 text-white/20 hover:bg-white/10" : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50")
                                       )}
                                     >
                                       {v ? 'Blue Ticks' : 'Sent Only'}
                                     </button>
                                  ))}
                               </div>
                            </div>
                              <div className="grid grid-cols-2 gap-3">
                                {['apple', 'google'].map((v) => (
                                  <button 
                                   key={v}
                                   onClick={() => setMessage(prev => ({...prev, emojiStyle: v as any}))}
                                   className={cn(
                                     "py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                     message.emojiStyle === v ? "bg-white border-white text-black shadow-lg" : "bg-white/5 border-white/5 text-white/20 hover:bg-white/10"
                                   )}
                                  >
                                    {v} OS
                                  </button>
                                ))}
                              </div>
                           </div>
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>
           </div>

           <div className="flex justify-center pt-4">
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className={cn(
                  "w-full max-w-sm py-4 rounded-3xl transition-all font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl",
                  config.isDark ? "bg-white text-black hover:bg-slate-100" : "bg-slate-900 text-white hover:bg-black"
                )}
              >
                  {isGenerating ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {isGenerating ? 'GENERATING...' : 'GENERATE SCREENSHOT'}
              </button>
           </div>
        </div>

        {/* MIDDLE: Preview Section (Result) */}
        <div className="space-y-8 max-w-2xl mx-auto w-full">
           <div className={cn(
             "border rounded-[48px] p-8 md:p-10 ios-shadow backdrop-blur-2xl transition-all",
             config.isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
           )}>
              <div className="mb-10 flex items-center justify-between px-2">
                 <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-500/20" />
                 </div>
                 <h4 className={cn("text-[10px] font-black uppercase tracking-[0.4em]", config.isDark ? "text-white/20" : "text-slate-400")}>Studio Preview</h4>
              </div>

              <div className={cn(
                "relative aspect-[9/16] rounded-[44px] overflow-hidden border group shadow-inner transition-all",
                config.isDark ? "bg-[#0E0E12] border-white/5" : "bg-slate-100 border-slate-200 shadow-slate-200/50"
              )}>
                 <AnimatePresence mode="wait">
                    {isGenerating ? (
                      <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                         <div className="relative w-16 h-16">
                            <div className={cn("absolute inset-0 border-4 rounded-full", config.isDark ? "border-white/5" : "border-black/5")} />
                            <div className={cn("absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin")} />
                         </div>
                         <div className="space-y-2 text-center">
                            <p className={cn("text-[10px] font-black uppercase tracking-[0.3em]", config.isDark ? "text-white" : "text-slate-900")}>Rendering</p>
                            <p className={cn("text-[8px] font-bold uppercase tracking-widest animate-pulse", config.isDark ? "text-white/20" : "text-slate-400")}>Communicating with Backend</p>
                         </div>
                      </motion.div>
                    ) : generatedUrl ? (
                      <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full h-full p-2 relative group flex items-center justify-center">
                         <img src={generatedUrl} alt="Screenshot" className="w-full h-full object-contain drop-shadow-2xl" />
                         
                         <div className="absolute inset-x-8 bottom-8 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                            <div className="grid grid-cols-2 gap-3">
                               <button onClick={() => handleDownload(generatedUrl)} className={cn(
                                 "w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-all",
                                 config.isDark ? "bg-white text-black hover:bg-white/90" : "bg-slate-900 text-white hover:bg-black"
                               )}>
                                  <Download className="w-4 h-4" /> Download
                               </button>
                               <button 
                                 onClick={() => handleShare(generatedUrl)} 
                                 className={cn(
                                   "w-full py-4 backdrop-blur-md border rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-all text-white",
                                   config.isDark ? "bg-blue-600/20 border-blue-500/30 text-blue-400" : "bg-blue-500 border-blue-400"
                                 )}
                               >
                                  <Share2 className="w-4 h-4" /> Share
                               </button>
                            </div>
                            
                            <button onClick={handleCopy} className={cn(
                              "w-full py-4 backdrop-blur-md border rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all",
                              config.isDark ? "bg-black/60 text-white border-white/10" : "bg-white/80 text-slate-900 border-slate-200"
                            )}>
                               <Copy className="w-4 h-4" /> Copy to Clipboard
                            </button>
                         </div>
                      </motion.div>
                    ) : (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} className="absolute inset-0 flex flex-col items-center justify-center gap-6 pointer-events-none">
                         <ImageIcon className={cn("w-20 h-20", config.isDark ? "text-white" : "text-slate-900")} />
                         <p className={cn("text-xs font-black uppercase tracking-[0.4em] text-center px-12 leading-relaxed font-mono", config.isDark ? "text-white" : "text-slate-900")}>Studio is ready for your input</p>
                      </motion.div>
                    )}
                 </AnimatePresence>
              </div>

              {/* Status Notifications */}
              <div className="mt-8">
                 <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-5 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-4 text-red-500">
                         <AlertCircle className="w-6 h-6 flex-shrink-0" />
                         <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-widest">Error occurred</p>
                            <p className="text-[9px] font-bold opacity-80 leading-relaxed">{error}</p>
                         </div>
                      </motion.div>
                    )}
                    {success && (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-5 bg-green-500/10 border border-green-500/20 rounded-3xl flex items-center gap-4 text-green-500">
                         <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                         <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-widest">Generation Success</p>
                            <p className="text-[9px] font-bold opacity-80 leading-relaxed pr-8">Your quoted screenshot is ready. You can now download or copy the result.</p>
                         </div>
                      </motion.div>
                    )}
                 </AnimatePresence>
              </div>
           </div>
        </div>

        {/* BOTTOM: Visual History */}
        <div className="max-w-4xl mx-auto w-full">

           {/* Visual History */}
           {history.length > 0 && (
             <div className={cn(
               "border rounded-[40px] p-8 backdrop-blur-xl transition-all",
               config.isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
             )}>
                <div className="flex items-center justify-between mb-8 px-2">
                   <div className="flex items-center gap-3">
                      <HistoryIcon className={cn("w-4 h-4", config.isDark ? "text-white/40" : "text-slate-400")} />
                      <h5 className={cn("text-[10px] font-black uppercase tracking-[0.2em]", config.isDark ? "text-white/20" : "text-slate-400")}>
                         Visual History
                      </h5>
                   </div>
                   <button 
                     onClick={() => {
                        setHistory([]);
                        localStorage.removeItem('brat_history');
                     }} 
                     className={cn("text-[8px] font-black uppercase transition-colors", config.isDark ? "text-white/10 hover:text-red-400" : "text-slate-300 hover:text-red-500")}
                   >
                     Reset History
                   </button>
                </div>
                
                <div className="grid gap-6">
                   {history.map((item) => (
                     <motion.div 
                       layout
                       key={item.id} 
                       className={cn(
                         "group border rounded-[32px] overflow-hidden transition-all",
                         config.isDark ? "bg-black/40 border-white/5 hover:border-white/10" : "bg-slate-50 border-slate-200 hover:border-slate-300"
                       )}
                     >
                        <div className="p-4 flex gap-5">
                           {/* Thumbnail */}
                           <div 
                             onClick={() => item.generatedImageUrl && setSelectedHistoryImage(item.generatedImageUrl)}
                             className={cn(
                               "w-20 h-28 rounded-2xl overflow-hidden relative group-hover:scale-105 transition-transform cursor-zoom-in",
                               config.isDark ? "bg-white/5" : "bg-white border border-slate-200"
                             )}
                           >
                              {item.generatedImageUrl ? (
                                <img src={item.generatedImageUrl} className="w-full h-full object-cover" />
                              ) : (
                                <div className={cn("w-full h-full flex items-center justify-center", config.isDark ? "opacity-10" : "opacity-30")}>
                                   <ImageIcon className="w-6 h-6" />
                                </div>
                              )}
                           </div>

                           <div className="flex-1 flex flex-col justify-between py-1">
                              <div>
                                 <div className="flex justify-between items-start">
                                    <h6 className={cn("text-[10px] font-black uppercase tracking-tighter line-clamp-1", config.isDark ? "text-white/80" : "text-slate-900")}>{item.name || 'Untitled'}</h6>
                                    <p className={cn("text-[7px] font-bold whitespace-nowrap", config.isDark ? "text-white/20" : "text-slate-400")}>{new Date(item.date).toLocaleDateString()}</p>
                                 </div>
                                 <p className={cn("text-[8px] font-medium mt-1 line-clamp-1", config.isDark ? "text-white/40" : "text-slate-500")}>{item.state.text}</p>
                              </div>

                              <div className="flex gap-2">
                                 <button 
                                   onClick={() => {
                                      if (item.state.text && activeTab === 'chat') setChatText(item.state.text);
                                      if (item.state.image && activeTab === 'media') setMediaData(prev => ({...prev, url: item.state.image || ''}));
                                      setMessage(item.state);
                                      setConfig(item.config);
                                      if (item.generatedImageUrl) setGeneratedUrl(item.generatedImageUrl);
                                      showToast('Session restored! 📥');
                                   }}
                                   className={cn(
                                     "flex-1 h-9 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                     config.isDark ? "bg-white/5 border border-white/5 hover:bg-white/10" : "bg-white border border-slate-200 hover:bg-slate-100"
                                   )}
                                 >
                                     <RotateCcw className="w-3 h-3" /> Load
                                  </button>
                                  {item.generatedImageUrl && (
                                   <div className="flex gap-2">
                                     <button 
                                       onClick={() => handleDownload(item.generatedImageUrl!)}
                                       className={cn(
                                         "w-10 h-9 rounded-xl flex items-center justify-center transition-all",
                                         config.isDark ? "bg-blue-600/10 text-blue-400 hover:bg-blue-600/20" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                       )}
                                       title="Download"
                                     >
                                        <Download className="w-3 h-3" />
                                     </button>
                                     <button 
                                       onClick={() => handleShare(item.generatedImageUrl!)}
                                       className={cn(
                                         "w-10 h-9 rounded-xl flex items-center justify-center transition-all",
                                         config.isDark ? "bg-purple-600/10 text-purple-400 hover:bg-purple-600/20" : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                                       )}
                                       title="Share"
                                     >
                                        <Share2 className="w-3 h-3" />
                                     </button>
                                   </div>
                                  )}
                                 <button 
                                   onClick={() => {
                                      const newH = history.filter(h => h.id !== item.id);
                                      setHistory(newH);
                                      localStorage.setItem('brat_history', JSON.stringify(newH.map(i => ({...i, generatedImageUrl: undefined}))));
                                   }}
                                   className={cn(
                                     "w-10 h-9 rounded-xl flex items-center justify-center transition-colors",
                                     config.isDark ? "bg-white/5 hover:bg-red-500/10 hover:text-red-400" : "bg-slate-100 hover:bg-red-500 hover:text-white"
                                   )}
                                 >
                                    <Trash2 className="w-3 h-3" />
                                 </button>
                              </div>
                           </div>
                        </div>
                     </motion.div>
                   ))}
                </div>
             </div>
           )}
        </div>
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn(
              "fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 transition-all",
              toast.type === 'success' 
                ? (config.isDark ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-green-50 border-green-200 text-green-700") 
                : (config.isDark ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-200 text-red-700")
            )}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="text-[10px] font-black uppercase tracking-widest">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className={cn("py-20 border-t text-center mt-12 transition-all", config.isDark ? "border-white/5 bg-black/20" : "border-slate-200 bg-slate-100/50")}>
         <div className={cn("flex justify-center gap-8 mb-10", config.isDark ? "text-white/20" : "text-slate-300")}>
            <Github className={cn("w-6 h-6 transition-colors cursor-pointer", config.isDark ? "hover:text-white" : "hover:text-slate-900")} />
            <ExternalLink className={cn("w-6 h-6 transition-colors cursor-pointer", config.isDark ? "hover:text-white" : "hover:text-slate-900")} />
         </div>
         <p className={cn("text-[10px] font-black uppercase tracking-[0.8em]", config.isDark ? "text-white/10" : "text-slate-300")}>Fake iPhone Studio v2.0.0 // Rangga Code</p>
         <p className={cn("text-[8px] font-bold mt-4", config.isDark ? "text-white/5" : "text-slate-200/50")}>PRIVATE β BUILD - REPRODUCTION PROHIBITED</p>
      </footer>

      {/* Full Image Modal */}
      <AnimatePresence>
        {selectedHistoryImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 lg:p-12"
            onClick={() => setSelectedHistoryImage(null)}
          >
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="relative max-w-full max-h-full aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center"
               onClick={(e) => e.stopPropagation()}
             >
                <img src={selectedHistoryImage} className="w-full h-full object-contain" alt="Full size view" />
                <button 
                  onClick={() => setSelectedHistoryImage(null)}
                  className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all"
                >
                   <X className="w-6 h-6" />
                </button>
                
                <div className="absolute bottom-8 flex gap-4">
                   <button 
                     onClick={() => handleDownload(selectedHistoryImage)}
                     className="px-8 py-3 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-transform active:scale-95 shadow-2xl"
                   >
                      <Download className="w-4 h-4" /> Download
                   </button>
                   <button 
                     onClick={() => handleShare(selectedHistoryImage)}
                     className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-transform active:scale-95 shadow-2xl"
                   >
                      <Share2 className="w-4 h-4" /> Share
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SupportAssistant isDark={config.isDark} />
    </div>
  );
}
