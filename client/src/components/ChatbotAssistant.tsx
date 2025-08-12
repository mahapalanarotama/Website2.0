import { marked } from 'marked';
// Fungsi format markdown penuh menggunakan marked
function formatMarkdown(text: string): string {
  if (!text) return '';
  // Gunakan parseSync agar selalu return string
  // @ts-ignore
  return marked.parseSync ? marked.parseSync(text, { breaks: true }) : marked.parse(text, { breaks: true });
}
import { useState, useEffect, useRef } from 'react';
import { Brain, X, User } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const FAQ: FaqItem[] = [
    // Informasi Pendaftaran
    { q: 'Bagaimana cara mendaftar sebagai anggota Mahapala Narotama?', a: 'Untuk mendaftar sebagai anggota, kunjungi halaman Pendaftaran di website Mahapala Narotama, isi formulir yang tersedia, dan ikuti petunjuk selanjutnya.' },
    { q: 'Apa saja syarat pendaftaran anggota baru?', a: 'Syarat pendaftaran meliputi identitas diri (KTP/KTM), nomor telepon aktif, dan komitmen mengikuti kegiatan organisasi.' },
    { q: 'Kapan pendaftaran anggota baru dibuka?', a: 'Jadwal pendaftaran anggota baru diumumkan secara berkala di website dan media sosial Mahapala Narotama.' },
    { q: 'Apakah pendaftaran anggota Mahapala Narotama gratis?', a: 'Ya, pendaftaran anggota baru Mahapala Narotama tidak dipungut biaya.' },
    { q: 'Bagaimana alur seleksi calon anggota?', a: 'Setelah mendaftar, calon anggota akan mengikuti seleksi administrasi dan wawancara sesuai jadwal yang ditentukan.' },
    { q: 'Apakah ada batas usia untuk mendaftar?', a: 'Tidak ada , namun Pendaftar harus dari Mahasiswa Aktif Universitas Narotama dengan ketentuan dapat di lihat di Halaman Pendaftaran' },
    { q: 'Bagaimana jika saya salah mengisi data pendaftaran?', a: 'Data dapat diedit sebelum pendaftaran ditutup' },
    { q: 'Apakah bisa mendaftar lewat HP?', a: 'Ya, seluruh proses pendaftaran dapat dilakukan melalui perangkat mobile.' },

    // Informasi Organisasi Mahapala Narotama
    { q: 'Apa itu Mahapala Narotama?', a: 'Mahapala Narotama adalah organisasi pecinta alam di Universitas Narotama yang bergerak di bidang pelestarian alam, petualangan, dan pengembangan diri.' },
    { q: 'Apa manfaat menjadi anggota Mahapala Narotama?', a: 'Anggota dapat mengikuti pelatihan, kegiatan alam bebas, pengembangan softskill, serta memperluas jaringan pertemanan.' },
    { q: 'Apa saja kegiatan rutin Mahapala Narotama?', a: 'Kegiatan rutin meliputi pelatihan dasar, ekspedisi, bakti sosial, seminar lingkungan, dan diskusi rutin.' },
    { q: 'Bagaimana cara mengikuti kegiatan Mahapala Narotama?', a: 'Setelah menjadi anggota, Anda dapat mendaftar/ mengikuti kegiatan melalui pengumuman di website atau grup resmi.' },
    { q: 'Apakah ada grup diskusi untuk pendaftar?', a: 'Ya, grup diskusi akan diberikan setelah pendaftaran melakukan pendaftaran.' },
    { q: 'Bagaimana cara menghubungi pengurus Mahapala Narotama?', a: 'Gunakan menu Hubungi Kami di website atau kontak WhatsApp/email yang tersedia.' },
    { q: 'Apakah ada pelatihan untuk anggota baru?', a: 'Ya, anggota baru akan mendapatkan pelatihan dasar organisasi dan kegiatan alam.' },
    { q: 'Apakah ada kuota anggota baru setiap tahun?', a: 'Ya, kuota anggota baru terbatas sesuai kebijakan organisasi.' },
    { q: 'Bagaimana cara mendapatkan sertifikat keanggotaan?', a: 'Sertifikat akan diberikan setelah menyelesaikan pelatihan dan aktif berpartisipasi dalam kegiatan.' },
   
    // Informasi Perkuliahan
    { q: 'Apakah Mahapala Narotama hanya untuk mahasiswa Universitas Narotama?', a: 'Ya, anggota Mahapala Narotama adalah mahasiswa aktif Universitas Narotama.' },
    { q: 'Apakah kegiatan Mahapala Narotama mengganggu perkuliahan?', a: 'Tidak, kegiatan organisasi diatur agar tidak mengganggu jadwal perkuliahan anggota.' },
    { q: 'Bagaimana jika ada jadwal kuliah yang bentrok dengan kegiatan?', a: 'Anggota dapat mengkomunikasikan jadwal kepada pengurus agar dapat menyesuaikan keikutsertaan dalam kegiatan.' },
    { q: 'Apakah ada dukungan akademik untuk anggota?', a: 'Mahapala Narotama mendukung anggotanya dalam hal akademik melalui diskusi dan saling membantu antar anggota.' },
    { q: 'Apakah keanggotaan Mahapala Narotama mempengaruhi nilai akademik?', a: 'Keanggotaan tidak mempengaruhi nilai akademik, namun pengalaman organisasi dapat menjadi nilai tambah di luar akademik.' },
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
              role: "system",
              content: "Kamu adalah MPN AI Assistant, asisten virtual Mahapala Narotama yang ramah, romantis, informatif, dan sangat mencintai alam. Jawablah semua pertanyaan dalam bahasa Indonesia yang baik, sopan, dan selalu perkenalkan dirimu sebagai MPN AI Assistant jika diminta. Tunjukkan kecintaanmu pada alam dan ajak pengguna untuk ikut menjaga dan mencintai alam dalam setiap kesempatan yang relevan.",
            },
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
  const [messages, setMessages] = useState<{from: 'user'|'bot', text: string}[]>([{
    from: 'bot',
    text: '🌸 Hai, aku <strong>MPN AI Assistant</strong>! Senang bisa menemani harimu di dunia maya dan alam nyata. Aku sangat mencintai alam, dan siap membantu kamu seputar Mahapala Narotama, pendaftaran anggota baru, atau pertanyaan lain yang ingin kamu tahu. Jangan ragu untuk bertanya, dan jangan lupa untuk selalu mencintai serta menjaga alam bersama aku! 💙🌿',
  }]);
  // removed unused loading state
  const scrollToTopVisible = useScrollToTopVisible();
  const chatRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [closing, setClosing] = useState(false);
  const [faqPrompts, setFaqPrompts] = useState<string[]>(() => getRandomFaqPrompts(FAQ, 1));
  const [typing, setTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [showPromptMenu, setShowPromptMenu] = useState(false);

  // Auto-scroll ke bawah setiap ada pesan baru
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, typing, typingText]);

  // Regenerate FAQ prompts setiap kali chat dibuka
  useEffect(() => {
    if (open) setFaqPrompts(getRandomFaqPrompts(FAQ, 1));
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
      if (inputFocused) return; // Don't close if input is focused
      setClosing(true);
      setTimeout(() => {
        setOpen(false);
        setClosing(false);
      }, 300);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [open, closing, inputFocused]);

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
        setTypingText(formatMarkdown(answer.slice(0, i)));
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
      setFaqPrompts(getRandomFaqPrompts(FAQ, 1, [customInput]));
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
              <div key={i} className={msg.from === 'user' ? 'flex justify-end mb-2' : 'flex justify-start mb-2'}>
                {msg.from === 'bot' && (
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-blue-200 flex items-center justify-center mr-2 overflow-hidden">
                    <img src="https://raw.githubusercontent.com/mahapalanarotama/OfficialWebsite/refs/heads/main/Img/favicon.png" alt="MPN" className="w-7 h-7 object-contain" />
                  </span>
                )}
                <span className={msg.from === 'user' ? 'inline-block bg-blue-100 text-blue-800 rounded px-3 py-2 max-w-[70%]' : 'inline-block bg-gray-100 text-gray-800 rounded px-3 py-2 max-w-[70%]'}>
                  {msg.from === 'bot' ? (
                    <span dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.text) }} />
                  ) : (
                    msg.text
                  )}
                </span>
                {msg.from === 'user' && (
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center ml-2">
                    <User className="w-5 h-5 text-blue-700" />
                  </span>
                )}
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
          <div className="p-3 border-t flex gap-2 relative items-center bg-gray-50">
            {/* Tombol menu prompt di kiri */}
            <button
              className="flex items-center justify-center bg-white border border-gray-300 hover:bg-blue-100 text-blue-700 rounded-full w-9 h-9 shadow mr-2 transition"
              style={{zIndex: 2}}
              title="Lihat semua pertanyaan FAQ"
              onClick={() => setShowPromptMenu(true)}
              type="button"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="18" r="1.5"/></svg>
            </button>
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-0 bg-white"
              placeholder="Tulis pertanyaan..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' ? handleSend() : undefined}
              disabled={typing}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              style={{maxWidth: 180}}
            />
            <button
              onClick={() => handleSend()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-semibold shadow"
              disabled={typing || !input.trim()}
              style={{minWidth: 64}}
            >Kirim</button>
          {/* Modal Prompt Menu */}
          {showPromptMenu && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-0 relative overflow-y-auto max-h-[80vh] border border-blue-100">
                <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-green-50 rounded-t-2xl">
                  <h2 className="text-lg font-bold text-blue-800">Daftar Pertanyaan FAQ</h2>
                  <button
                    className="text-gray-500 hover:text-red-500 text-2xl font-bold"
                    onClick={() => setShowPromptMenu(false)}
                    aria-label="Tutup daftar pertanyaan"
                    type="button"
                  >
                    ×
                  </button>
                </div>
                <div className="px-6 py-4">
                  {/* Kategorisasi manual berdasarkan urutan FAQ */}
                  <div className="mb-5">
                    <div className="font-semibold text-blue-700 mb-2 text-base">Informasi Pendaftaran</div>
                    <ul className="space-y-1">
                      {FAQ.slice(0,8).map((item, idx) => (
                        <li key={idx}><button className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 transition text-sm" onClick={() => { setShowPromptMenu(false); handleSend(item.q); }}>{item.q}</button></li>
                      ))}
                    </ul>
                  </div>
                  <div className="mb-5">
                    <div className="font-semibold text-blue-700 mb-2 text-base">Informasi Organisasi</div>
                    <ul className="space-y-1">
                      {FAQ.slice(8,18).map((item, idx) => (
                        <li key={idx}><button className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 transition text-sm" onClick={() => { setShowPromptMenu(false); handleSend(item.q); }}>{item.q}</button></li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="font-semibold text-blue-700 mb-2 text-base">Informasi Perkuliahan</div>
                    <ul className="space-y-1">
                      {FAQ.slice(18).map((item, idx) => (
                        <li key={idx}><button className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 transition text-sm" onClick={() => { setShowPromptMenu(false); handleSend(item.q); }}>{item.q}</button></li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
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
