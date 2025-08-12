import { useState, useEffect, useRef } from 'react';
import { Brain, X } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const FAQ: FaqItem[] = [
  { q: 'Bagaimana cara mendaftar?', a: 'Klik menu Pendaftaran, isi formulir, dan ikuti petunjuk yang diberikan.' },
  { q: 'Apa saja persyaratan pendaftaran?', a: 'Persyaratan pendaftaran dapat dilihat di halaman Pendaftaran.' },
  { q: 'Bagaimana cara menghubungi admin?', a: 'Gunakan menu Hubungi Kami atau kontak yang tertera di footer.' },
  { q: 'Apakah ada biaya pendaftaran?', a: 'Informasi biaya pendaftaran dapat dilihat di halaman Pendaftaran.' },
];

function getRandomFaqPrompts(faqArr: FaqItem[], max = 3, exclude: string[] = []): string[] {
  const filtered = faqArr.filter((f: FaqItem) => !exclude.includes(f.q));
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, max).map((f: FaqItem) => f.q);
}

// Custom hook untuk deteksi apakah tombol ScrollToTopButton sedang tampil
function useScrollToTopVisible() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handler = () => {
      setVisible(window.scrollY > 200);
    };
    window.addEventListener('scroll', handler);
    handler(); // initial check
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return visible;
}

async function fetchAIAnswer(question: string): Promise<string> {
  try {
    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer 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`, // Ganti dengan token Anda
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: question,
            },
          ],
          model: "openai/gpt-oss-20b:fireworks-ai",
        }),
      }
    );
    const data = await response.json();
    // Parsing respons chat API
    if (data && data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content.trim();
    }
    return 'Maaf, AI tidak memberikan jawaban yang bisa ditampilkan.\n[DEBUG: ' + JSON.stringify(data) + ']';
  } catch (e) {
    return 'Maaf, terjadi kesalahan pada AI Assistant.';
  }
}

export default function ChatbotAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{from: 'user'|'bot', text: string}[]>([]);
  // removed unused loading state
  const scrollToTopVisible = useScrollToTopVisible();
  const chatRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [closing, setClosing] = useState(false);
  const [faqPrompts, setFaqPrompts] = useState<string[]>(() => getRandomFaqPrompts(FAQ));
  const [typing, setTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke bawah setiap ada pesan baru
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, typing, typingText]);

  // Regenerate FAQ prompts setiap kali chat dibuka
  useEffect(() => {
    if (open) setFaqPrompts(getRandomFaqPrompts(FAQ));
  }, [open]);

  // Close chat when clicking outside
  useEffect(() => {
    if (!(open || closing)) return;
    function handleClick(e: MouseEvent) {
      const chat = chatRef.current;
      const btn = buttonRef.current;
      if (chat && !chat.contains(e.target as Node) && btn && !btn.contains(e.target as Node)) {
        setClosing(true);
        setTimeout(() => {
          setOpen(false);
          setClosing(false);
        }, 300);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, closing]);

  // Tutup chat ketika scroll
  useEffect(() => {
    if (!(open || closing)) return;
    function handleScroll() {
      setClosing(true);
      setTimeout(() => {
        setOpen(false);
        setClosing(false);
      }, 300);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [open, closing]);

  const handleSend = async (customInput?: string) => {
    const sendText = typeof customInput === 'string' ? customInput : input;
    if (!sendText.trim()) return;
    setMessages(msgs => [...msgs, { from: 'user', text: sendText }]);
    setInput('');
    setTyping(true);
    setTypingText('');
    // Cek FAQ dulu
    const faq = FAQ.find(f => sendText.toLowerCase().includes(f.q.toLowerCase()));
    if (faq) {
      // Animasi mengetik karakter demi karakter untuk jawaban FAQ
      const answer = faq.a;
      for (let i = 1; i <= answer.length; i++) {
        setTypingText(answer.slice(0, i));
        // eslint-disable-next-line no-await-in-loop
        await new Promise(res => setTimeout(res, 18));
      }
      setMessages(msgs => [...msgs, { from: 'bot', text: answer }]);
      setTyping(false);
      setTypingText('');
    } else {
      let answer = await fetchAIAnswer(sendText);
      setMessages(msgs => [...msgs, { from: 'bot', text: answer }]);
      setTyping(false);
      setTypingText('');
    }
    // Ganti prompt yang dipakai dengan yang baru
    if (typeof customInput === 'string') {
      setFaqPrompts(getRandomFaqPrompts(FAQ, 3, [customInput]));
    }
  };

  return (
    <div>
      <button
        ref={buttonRef}
        onClick={() => setOpen(o => !o)}
        className="fixed right-6 z-[60] bg-blue-600 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-2xl hover:bg-blue-700 focus:outline-none"
        aria-label="Buka Chatbot"
        style={{
          bottom: scrollToTopVisible ? '5.5rem' : '1.5rem',
          transition: 'bottom 0.3s',
        }}
      >
        💬
      </button>
      {(open || closing) && (
        <div
          ref={chatRef}
          className={`fixed z-[70] w-80 max-w-full bg-white rounded-lg shadow-2xl border border-blue-200 flex flex-col transition-opacity duration-300 ${closing ? 'opacity-0' : 'opacity-100'}`}
          style={{
            right: '1.5rem',
            bottom: scrollToTopVisible ? '10rem' : '6rem',
            maxWidth: '95vw',
            pointerEvents: closing ? 'none' : 'auto',
            maxHeight: scrollToTopVisible ? '65vh' : '80vh',
            overflowY: 'auto',
          }}
        >
          <div className="p-3 border-b font-bold bg-blue-600 text-white rounded-t-lg flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6" />
              <span>MPN AI Assistant</span>
            </div>
            <button
              onClick={() => {
                setClosing(true);
                setTimeout(() => {
                  setOpen(false);
                  setClosing(false);
                }, 300);
              }}
              className="ml-2 p-1 rounded hover:bg-blue-700 focus:outline-none"
              aria-label="Tutup Chatbot"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div ref={chatScrollRef} className="flex-1 p-3 overflow-y-auto max-h-80 text-sm">
            {messages.length === 0 && (
              <div className="text-gray-500">Tanyakan apa saja tentang website, FAQ, atau pendaftaran.</div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={msg.from === 'user' ? 'text-right mb-2' : 'text-left mb-2'}>
                <span className={msg.from === 'user' ? 'inline-block bg-blue-100 text-blue-800 rounded px-2 py-1' : 'inline-block bg-gray-100 text-gray-800 rounded px-2 py-1'}>
                  {msg.text}
                </span>
              </div>
            ))}
            {typing && typingText && (
              <div className="text-left mb-2">
                <span className="inline-block bg-gray-100 text-gray-800 rounded px-2 py-1 animate-pulse">
                  {typingText}
                  <span className="inline-block w-2 h-2 bg-gray-400 rounded-full ml-1 animate-bounce" />
                </span>
              </div>
            )}
            {typing && !typingText && (
              <div className="text-gray-400 animate-pulse flex items-center gap-2 mt-2">
                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '100ms'}}></span>
                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '200ms'}}></span>
                <span>AI sedang mengetik...</span>
              </div>
            )}
          </div>
          <div className="p-2 border-t flex gap-2">
            <input
              type="text"
              className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none"
              placeholder="Tulis pertanyaan..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' ? handleSend() : undefined}
              disabled={typing}
            />
            <button
              onClick={() => handleSend()}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={typing || !input.trim()}
            >Kirim</button>
          </div>
          {/* FAQ Prompt */}
          <div className="px-3 pb-3 pt-1">
            <div className="text-xs text-gray-500 mb-1">Coba pertanyaan cepat:</div>
            <div className="flex flex-wrap gap-2">
              {faqPrompts.map((q, i) => (
                <button
                  key={i}
                  className="bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-xs hover:bg-blue-200 transition"
                  onClick={() => handleSend(q)}
                  type="button"
                  disabled={typing}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
