// 1. 适配浏览器环境的变量定义 (替代 import)
const { useState, useEffect } = React;
const { Search, BookOpen, TrendingUp, Anchor, RefreshCw, ChevronRight, FileText, ExternalLink, User } = lucide;

// 这里是你原本定义的 apiKey，记得填入你的有效 Key 才能抓取新闻
const apiKey = "AIzaSyAb6Cnm7dk44zOu_u6muglMw3iDIaGoYR4"; 

const App = () => {
  const [loading, setLoading] = useState(false);
  const [newsList, setNewsList] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const [error, setError] = useState(null);
  const [activeInvestor, setActiveInvestor] = useState('buffett');

  const investors = {
    buffett: {
      name: "Warren Buffett",
      keyword: "Warren Buffett Berkshire Hathaway latest news 2025",
      color: "bg-blue-600"
    },
    stanley: {
      name: "Stanley Druckenmiller",
      keyword: "Stanley Druckenmiller latest investment moves 2025",
      color: "bg-purple-600"
    }
  };

  const fetchNews = async (investorKey) => {
    setLoading(true);
    setError(null);
    setSelectedNews(null);
    const investor = investors[investorKey];
    
    const systemPrompt = `
      You are a financial news curator. 
      Task:
      1. Search for the 4 most recent and important news items about ${investor.name}.
      2. For each news item, provide:
         - A clear, concise Title.
         - The main content in clear, natural professional English.
         - The same content translated into natural, professional Chinese.
      3. Format the response as a JSON object:
         { "news": [ { "id": 1, "title": "...", "en": "...", "zh": "..." }, ... ] }
    `;

    const userQuery = `Get the latest 4 news updates for ${investor.name}.`;

    try {
      // 注意：这里使用了你代码中的 URL 和配置
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userQuery }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          tools: [{ "google_search": {} }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      
      if (!response.ok) throw new Error('Failed to fetch news');
      const data = await response.json();
      const result = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text);
      
      setNewsList(result.news || []);
      if (result.news?.length > 0) setSelectedNews(result.news[0]);
    } catch (err) {
      setError("无法获取最新动态，请检查 API Key 或稍后重试。");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(apiKey) {
        fetchNews(activeInvestor);
    } else {
        setError("请在 App.js 中填入你的 Gemini API Key");
    }
  }, [activeInvestor]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-900">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <TrendingUp size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Investor Insights</h1>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {Object.entries(investors).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setActiveInvestor(key)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeInvestor === key ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {info.name.split(' ')[1]}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full">
        <aside className="w-full md:w-80 border-r border-gray-200 bg-white overflow-y-auto">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Latest Updates</span>
            <button onClick={() => fetchNews(activeInvestor)} className="text-indigo-600 hover:rotate-180 transition-transform duration-500">
              <RefreshCw size={14} />
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              ))
            ) : error ? (
              <div className="p-4 text-xs text-red-500">{error}</div>
            ) : (
              newsList.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedNews(item)}
                  className={`w-full text-left p-4 hover:bg-indigo-50 transition-colors flex gap-3 items-start ${
                    selectedNews?.id === item.id ? "bg-indigo-50/50 border-r-4 border-indigo-500" : ""
                  }`}
                >
                  <div className="mt-1 text-indigo-400"><FileText size={16} /></div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug">{item.title}</h3>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <main className="flex-1 bg-white overflow-y-auto">
          {selectedNews ? (
            <div className="p-6 md:p-12 max-w-3xl mx-auto">
              <div className="mb-8">
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold text-white mb-4 ${investors[activeInvestor].color}`}>
                  {investors[activeInvestor].name}
                </span>
                <h2 className="text-3xl font-bold text-slate-900 leading-tight mb-4">
                  {selectedNews.title}
                </h2>
                <div className="h-1 w-20 bg-indigo-600 rounded"></div>
              </div>

              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">English Original</span>
                  </div>
                  <p className="text-lg text-slate-700 leading-relaxed font-serif">
                    {selectedNews.en}
                  </p>
                </div>

                <div className="group">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded uppercase">中文翻译</span>
                  </div>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    {selectedNews.zh}
                  </p>
                </div>
              </div>
              
              <div className="mt-12 p-6 bg-slate-900 rounded-2xl text-white">
                <div className="flex items-center gap-2 mb-3 text-indigo-400">
                  <Anchor size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Entrepreneur's Note</span>
                </div>
                <p className="text-sm opacity-90 leading-relaxed">
                  Think about how {investors[activeInvestor].name.split(' ')[1]}'s logic applies to your Shopee store. 
                  If he talks about "Quality over Quantity", consider if your TikTok content should focus on a single hero product (yoga socks) rather than posting generic lifestyle videos.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-10 text-center">
              <Search size={48} className="mb-4 opacity-20" />
              <p>Select a news item from the sidebar to start reading.</p>
            </div>
          )}
        </main>
      </div>

      <footer className="bg-white border-t border-gray-200 py-3 px-6 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        <div>System: Real-time News Engine</div>
        <div>Focus: Clarity & Logic</div>
      </footer>
    </div>
  );
};

// 最后一步：渲染组件
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
