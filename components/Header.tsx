import React from 'react';
import { BookOpen, GraduationCap, Settings, Bot, Cpu, TableProperties } from 'lucide-react';
import { AppMode } from '../types';

interface HeaderProps {
  onOpenSettings: () => void;
  appMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings, appMode, onModeChange }) => {
  const isAIMode = appMode === AppMode.AI_EDU;
  const isIntegrationMode = appMode === AppMode.AI_INTEGRATION;

  const headerBg = isIntegrationMode ? 'bg-teal-600' : isAIMode ? 'bg-purple-600' : 'bg-blue-600';
  const headerBgDark = isIntegrationMode ? 'bg-teal-800' : isAIMode ? 'bg-purple-800' : 'bg-blue-800';
  const headerHover = isIntegrationMode ? 'hover:bg-teal-700' : isAIMode ? 'hover:bg-purple-700' : 'hover:bg-blue-700';
  const textLight = isIntegrationMode ? 'text-teal-100' : isAIMode ? 'text-purple-100' : 'text-blue-100';
  const badgeBg = isIntegrationMode ? 'text-teal-100 bg-teal-700' : isAIMode ? 'text-purple-100 bg-purple-700' : 'text-blue-100 bg-blue-700';

  const headerTitle = isIntegrationMode
    ? 'GỢI Ý ĐỊA CHỈ TÍCH HỢP AI'
    : isAIMode
      ? 'SOẠN KHBD GIÁO DỤC AI'
      : 'SOẠN KHBD NĂNG LỰC SỐ';

  const headerSubtitle = isIntegrationMode
    ? 'Gợi ý địa chỉ tích hợp GDAI theo QĐ 3439 & CV 8334 bởi Hồ Sỹ Long'
    : isAIMode
      ? 'Hỗ trợ tích hợp giáo dục AI bởi Hồ Sỹ Long'
      : 'Hỗ trợ tích hợp Năng lực số toàn cấp bởi Hồ Sỹ Long';

  const headerIcon = isIntegrationMode
    ? <TableProperties size={32} />
    : isAIMode
      ? <Bot size={32} />
      : <GraduationCap size={32} />;

  return (
    <header className={`${headerBg} text-white shadow-lg transition-colors duration-300`}>
      <div className="max-w-5xl mx-auto px-6 py-4">
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 ${headerBgDark} rounded-lg`}>
              {headerIcon}
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                {headerTitle}
              </h1>
              <p className={`${textLight} text-sm`}>
                {headerSubtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenSettings}
              className={`p-2 ${headerHover} rounded-full transition-colors text-white/80 hover:text-white`}
              title="Cài đặt API Key"
            >
              <Settings size={20} />
            </button>
            <div className={`hidden md:flex items-center space-x-2 ${badgeBg} px-4 py-2 rounded-full text-sm`}>
              {isIntegrationMode ? <TableProperties size={16} /> : isAIMode ? <Cpu size={16} /> : <BookOpen size={16} />}
              <span>Powered by Gemini</span>
            </div>
          </div>
        </div>

        {/* Mode Toggle Tabs - 3 tabs */}
        <div className="flex space-x-1 bg-white/10 rounded-lg p-1">
          <button
            onClick={() => onModeChange(AppMode.NLS)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200
              ${appMode === AppMode.NLS
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
          >
            <GraduationCap size={16} />
            <span>Năng lực số</span>
          </button>
          <button
            onClick={() => onModeChange(AppMode.AI_EDU)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200
              ${appMode === AppMode.AI_EDU
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
          >
            <Bot size={16} />
            <span>KHBD Giáo dục AI</span>
          </button>
          <button
            onClick={() => onModeChange(AppMode.AI_INTEGRATION)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200
              ${appMode === AppMode.AI_INTEGRATION
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
          >
            <TableProperties size={16} />
            <span className="hidden sm:inline">Gợi ý địa chỉ tích hợp AI</span>
            <span className="sm:hidden">Gợi ý tích hợp</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
