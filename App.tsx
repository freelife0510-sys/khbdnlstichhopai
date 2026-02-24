import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LessonForm from './components/LessonForm';
import ContentInput from './components/ContentInput';
import ResultDisplay from './components/ResultDisplay';
import { Subject, AppMode, OriginalDocxFile } from './types';
import { generateNLSLessonPlan, generateAILessonPlan } from './services/geminiService';
import { Sparkles, Settings2, Key, Bot, Cpu } from 'lucide-react';
import ApiKeyModal from './components/ApiKeyModal';

const App: React.FC = () => {
  // App Mode
  const [appMode, setAppMode] = useState<AppMode>(AppMode.NLS);

  // State for Form
  const [subject, setSubject] = useState<Subject>(Subject.TOAN);
  const [grade, setGrade] = useState<number>(7);

  // Content States
  const [lessonContent, setLessonContent] = useState<string>('');
  const [distributionContent, setDistributionContent] = useState<string>('');

  // State for Options
  const [analyzeOnly, setAnalyzeOnly] = useState(false);
  const [detailedReport, setDetailedReport] = useState(false);

  // App State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // API Key State
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);

  // State lưu trữ file DOCX gốc cho XML Injection
  const [originalDocx, setOriginalDocx] = useState<OriginalDocxFile | null>(null);

  useEffect(() => {
    const storedKey = localStorage.getItem('GEMINI_API_KEY');
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setShowApiKeyModal(true);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem('GEMINI_API_KEY', key);
    setApiKey(key);
    setShowApiKeyModal(false);
  };

  const handleProcess = async () => {
    if (!lessonContent || lessonContent.trim().length === 0) {
      setError("Vui lòng tải lên file giáo án (Giáo án trống hoặc chưa được tải).");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let generatedText: string;

      if (appMode === AppMode.AI_EDU) {
        // Mode Giáo dục AI (QĐ 3439)
        generatedText = await generateAILessonPlan(
          {
            subject,
            grade,
            content: lessonContent,
            distributionContent: distributionContent
          },
          { analyzeOnly, detailedReport, comparisonExport: false, apiKey }
        );
      } else {
        // Mode Năng lực số (NLS)
        generatedText = await generateNLSLessonPlan(
          {
            subject,
            grade,
            content: lessonContent,
            distributionContent: distributionContent
          },
          { analyzeOnly, detailedReport, comparisonExport: false, apiKey }
        );
      }

      if (!generatedText || generatedText.trim().length === 0) {
        throw new Error("AI trả về kết quả rỗng. Vui lòng thử lại với file giáo án rõ ràng hơn.");
      }

      setResult(generatedText);
    } catch (err: any) {
      console.error("Process Error:", err);
      setError(err.message || "Đã xảy ra lỗi không xác định khi kết nối với AI.");
    } finally {
      setLoading(false);
    }
  };

  // Khi chuyển mode, xóa kết quả cũ
  const handleModeChange = (mode: AppMode) => {
    setAppMode(mode);
    setResult(null);
    setError(null);
  };

  const isAIMode = appMode === AppMode.AI_EDU;
  const themeColor = isAIMode ? 'purple' : 'blue';

  // Sidebar content based on mode
  const sidebarDomains = isAIMode
    ? [
      "Tư duy lấy con người làm trung tâm",
      "Đạo đức AI",
      "Kỹ thuật và Ứng dụng AI",
      "Thiết kế hệ thống AI"
    ]
    : [
      "Khai thác dữ liệu và thông tin",
      "Giao tiếp và Hợp tác",
      "Sáng tạo nội dung số",
      "An toàn số",
      "Giải quyết vấn đề",
      "Ứng dụng AI"
    ];

  return (
    <div className={`min-h-screen font-sans pb-12 ${isAIMode ? 'bg-[#F3E5F5]' : 'bg-[#E3F2FD]'}`}>
      <Header
        onOpenSettings={() => setShowApiKeyModal(true)}
        appMode={appMode}
        onModeChange={handleModeChange}
      />

      <main className="max-w-5xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Inputs */}
          <div className="lg:col-span-2 space-y-6">
            <LessonForm
              subject={subject} setSubject={setSubject}
              grade={grade} setGrade={setGrade}
              appMode={appMode}
            />

            <ContentInput
              lessonContent={lessonContent}
              setLessonContent={setLessonContent}
              distributionContent={distributionContent}
              setDistributionContent={setDistributionContent}
              onOriginalDocxLoaded={setOriginalDocx}
              appMode={appMode}
            />

            {/* Options Panel */}
            <div className={`bg-white p-6 rounded-xl shadow-sm border ${isAIMode ? 'border-purple-100' : 'border-blue-100'}`}>
              <div className="flex items-center mb-4">
                <Settings2 className={`${isAIMode ? 'text-purple-600' : 'text-blue-600'} mr-2`} size={20} />
                <h3 className={`font-semibold ${isAIMode ? 'text-purple-900' : 'text-blue-900'}`}>Tùy chọn nâng cao</h3>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={analyzeOnly}
                    onChange={(e) => setAnalyzeOnly(e.target.checked)}
                    className={`w-4 h-4 rounded border-slate-300 ${isAIMode ? 'text-purple-600 focus:ring-purple-500' : 'text-blue-600 focus:ring-blue-500'}`}
                  />
                  <span className="text-sm text-slate-700">Chỉ phân tích, không chỉnh sửa</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={detailedReport}
                    onChange={(e) => setDetailedReport(e.target.checked)}
                    className={`w-4 h-4 rounded border-slate-300 ${isAIMode ? 'text-purple-600 focus:ring-purple-500' : 'text-blue-600 focus:ring-blue-500'}`}
                  />
                  <span className="text-sm text-slate-700">Kèm báo cáo chi tiết</span>
                </label>
              </div>
            </div>

            {/* API Key Config Button */}
            <div className="flex justify-end items-center space-x-3">
              {!apiKey && (
                <span className="text-sm text-orange-600 font-medium animate-pulse">
                  ⚠️ Vui lòng lấy API KEY trước khi sử dụng app
                </span>
              )}
              <button
                onClick={() => setShowApiKeyModal(true)}
                className={`text-sm flex items-center space-x-1 ${isAIMode ? 'text-purple-600 hover:text-purple-800' : 'text-blue-600 hover:text-blue-800'}`}
              >
                <Key size={16} />
                <span>Cấu hình API Key</span>
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                <span className="font-medium mr-2">Lỗi:</span> {error}
              </div>
            )}

            <button
              onClick={handleProcess}
              disabled={loading}
              className={`w-full py-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 text-white font-bold text-lg transition-all transform hover:-translate-y-1 ${loading
                ? 'bg-slate-400 cursor-not-allowed'
                : isAIMode
                  ? 'bg-gradient-to-r from-purple-600 to-purple-800 hover:shadow-purple-500/30'
                  : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:shadow-blue-500/30'
                }`}
            >
              {loading ? (
                <span>Đang xử lý...</span>
              ) : (
                <>
                  {isAIMode ? <Bot size={24} /> : <Sparkles size={24} />}
                  <span>{isAIMode ? 'BẮT ĐẦU TÍCH HỢP GIÁO DỤC AI' : 'BẮT ĐẦU SOẠN GIÁO ÁN'}</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Info */}
          <div className="hidden lg:block space-y-6">
            <div className={`${isAIMode ? 'bg-purple-800' : 'bg-blue-800'} text-white p-6 rounded-xl shadow-md`}>
              <h3 className="font-bold text-lg mb-4">Hướng dẫn nhanh</h3>
              <ul className={`space-y-3 ${isAIMode ? 'text-purple-100' : 'text-blue-100'} text-sm`}>
                <li className="flex items-start">
                  <span className={`${isAIMode ? 'bg-purple-600' : 'bg-blue-600'} rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5`}>1</span>
                  Chọn môn học và khối lớp.
                </li>
                <li className="flex items-start">
                  <span className={`${isAIMode ? 'bg-purple-600' : 'bg-blue-600'} rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5`}>2</span>
                  <b>Bắt buộc:</b> Tải lên file giáo án (.docx hoặc .pdf).
                </li>
                <li className="flex items-start">
                  <span className={`${isAIMode ? 'bg-purple-500/50' : 'bg-blue-500/50'} rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5`}>3</span>
                  {isAIMode
                    ? <span>AI sẽ tích hợp giáo dục AI theo QĐ 3439 vào giáo án.</span>
                    : <span><i>Tùy chọn:</i> Tải file PPCT nếu muốn AI tham khảo năng lực cụ thể.</span>
                  }
                </li>
              </ul>
            </div>

            <div className={`bg-white p-6 rounded-xl shadow-sm border ${isAIMode ? 'border-purple-100' : 'border-blue-100'}`}>
              <h3 className={`font-bold ${isAIMode ? 'text-purple-900' : 'text-blue-900'} mb-2`}>
                {isAIMode ? '4 Miền năng lực AI' : 'Miền năng lực số'}
              </h3>
              {isAIMode && (
                <p className="text-xs text-purple-600 mb-3 font-medium">Theo QĐ 3439/QĐ-BGDĐT</p>
              )}
              <div className="space-y-2">
                {sidebarDomains.map((item, idx) => (
                  <div key={idx} className="flex items-center text-sm text-slate-600">
                    <div className={`w-1.5 h-1.5 ${isAIMode ? 'bg-purple-400' : 'bg-blue-400'} rounded-full mr-2`}></div>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {isAIMode && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm border border-purple-200">
                <div className="flex items-center mb-3">
                  <Cpu size={20} className="text-purple-600 mr-2" />
                  <h3 className="font-bold text-purple-900 text-sm">Phân theo cấp học</h3>
                </div>
                <div className="space-y-2 text-xs text-purple-800">
                  <p><b>Tiểu học:</b> Trải nghiệm AI đơn giản, bảo vệ dữ liệu</p>
                  <p><b>THCS:</b> Sử dụng công cụ AI, hiểu nguyên lý</p>
                  <p><b>THPT:</b> Thiết kế hệ thống AI, dự án nghiên cứu</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Result Section */}
        <div className="mt-8">
          <ResultDisplay result={result} loading={loading} originalDocx={originalDocx} appMode={appMode} />
        </div>
      </main>

      <footer className={`mt-12 text-center ${isAIMode ? 'text-purple-800/60' : 'text-blue-800/60'} text-sm py-6`}>
        <p>© 2024 NLS & AI Education Assistant. Built with Gemini API & React.</p>
        <p className={`mt-3 font-medium ${isAIMode ? 'text-purple-800' : 'text-blue-800'}`}>
          Mọi thông tin vui lòng liên hệ Hồ Sỹ Long, zalo 0943278804
        </p>
      </footer>

      <ApiKeyModal
        isOpen={showApiKeyModal}
        onSave={handleSaveApiKey}
        onClose={() => setShowApiKeyModal(false)}
        initialKey={apiKey}
      />
    </div>
  );
};

export default App;
