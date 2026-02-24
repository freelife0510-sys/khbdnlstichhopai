import React from 'react';
import { Subject, AppMode } from '../types';

interface LessonFormProps {
  subject: Subject;
  setSubject: (val: Subject) => void;
  grade: number;
  setGrade: (val: number) => void;
  appMode: AppMode;
}

const LessonForm: React.FC<LessonFormProps> = ({
  subject,
  setSubject,
  grade,
  setGrade,
  appMode,
}) => {
  const isAIMode = appMode === AppMode.AI_EDU;

  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border ${isAIMode ? 'border-purple-100' : 'border-blue-100'} mb-6`}>
      <div className="flex items-center mb-4">
        <div className={`h-8 w-1 ${isAIMode ? 'bg-purple-600' : 'bg-blue-600'} rounded-full mr-3`}></div>
        <h2 className={`text-lg font-semibold ${isAIMode ? 'text-purple-900' : 'text-blue-900'}`}>Thông tin Kế hoạch bài dạy</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Subject */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Môn học</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value as Subject)}
            className={`block w-full rounded-lg border-slate-200 bg-slate-50 border p-2.5 text-slate-700 transition-colors ${isAIMode ? 'focus:border-purple-500 focus:ring-purple-500' : 'focus:border-blue-500 focus:ring-blue-500'}`}
          >
            {Object.values(Subject).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Grade */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Khối lớp</label>
          <select
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value))}
            className={`block w-full rounded-lg border-slate-200 bg-slate-50 border p-2.5 text-slate-700 transition-colors ${isAIMode ? 'focus:border-purple-500 focus:ring-purple-500' : 'focus:border-blue-500 focus:ring-blue-500'}`}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
              <option key={g} value={g}>Lớp {g}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default LessonForm;
