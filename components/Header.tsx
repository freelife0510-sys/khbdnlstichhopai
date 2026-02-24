import React from 'react';
import { BookOpen, GraduationCap, Settings, Bot, Cpu } from 'lucide-react';
import { AppMode } from '../types';

interface HeaderProps {
  onOpenSettings: () => void;
  appMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings, appMode, onModeChange }) => {
  const isAIMode = appMode === AppMode.AI_EDU;

  return (
    <header className={`${isAIMode ? 'bg-purple-600' : 'bg-blue-600'} text-white shadow-lg transition-colors duration-300`}>
      <div className="max-w-5xl mx-auto px-6 py-4">
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 ${isAIMode ? 'bg-purple-800' : 'bg-blue-800'} rounded-lg`}>
              {isAIMode ? <Bot size={32} /> : <GraduationCap size={32} />}
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                {isAIMode ? 'SOẠN GIÁO ÁN GIÁO DỤC AI' : 'SOẠN GIÁO ÁN NĂNG LỰC SỐ'}
              </h1>
              <p className={`${isAIMode ? 'text-purple-100' : 'text-blue-100'} text-sm`}>
                {isAIMode
                  ? 'Tích hợp Giáo dục AI theo QĐ 3439/QĐ-BGDĐT'
                  : 'Hỗ trợ tích hợp Năng lực số toàn cấp bởi Trần Hoài Thanh'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenSettings}
              className={`p-2 ${isAIMode ? 'hover:bg-purple-700' : 'hover:bg-blue-700'} rounded-full transition-colors text-white/80 hover:text-white`}
              title="Cài đặt API Key"
            >
              <Settings size={20} />
            </button>
            <div className={`hidden md:flex items-center space-x-2 ${isAIMode ? 'text-purple-100 bg-purple-700' : 'text-blue-100 bg-blue-700'} px-4 py-2 rounded-full text-sm`}>
              {isAIMode ? <Cpu size={16} /> : <BookOpen size={16} />}
              <span>Powered by Gemini</span>
            </div>
          </div>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex space-x-1 bg-white/10 rounded-lg p-1">
          <button
            onClick={() => onModeChange(AppMode.NLS)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200
              ${!isAIMode
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
          >
            <GraduationCap size={16} />
            <span>Năng lực số</span>
          </button>
          <button
            onClick={() => onModeChange(AppMode.AI_EDU)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200
              ${isAIMode
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
          >
            <Bot size={16} />
            <span>Giáo dục AI (QĐ 3439)</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
