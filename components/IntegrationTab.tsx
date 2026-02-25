import React, { useState } from 'react';
import { Subject, AppMode, IntegrationRow, getSubjectsByGrade } from '../types';
import { generateAIIntegrationTable } from '../services/geminiService';
import IntegrationResult from './IntegrationResult';
import { Upload, BookOpen, Sparkles, AlertCircle } from 'lucide-react';

// Use global pdfjsLib loaded from CDN in index.html
declare const pdfjsLib: any;

interface IntegrationTabProps {
    apiKey: string;
}

const IntegrationTab: React.FC<IntegrationTabProps> = ({ apiKey }) => {
    const [subject, setSubject] = useState<Subject>(Subject.TOAN);
    const [grade, setGrade] = useState<number>(10);
    const [textbookContent, setTextbookContent] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');
    const [fileLoading, setFileLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<IntegrationRow[]>([]);
    const [error, setError] = useState<string | null>(null);

    const availableSubjects = getSubjectsByGrade(grade);

    // Ensure pdfjsLib worker is configured
    const ensurePdfWorker = () => {
        if (typeof pdfjsLib !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
            if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            }
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileLoading(true);
        setError(null);
        setTextbookContent('');
        setFileName(file.name);

        try {
            let extractedText = '';

            if (file.name.endsWith('.pdf')) {
                if (typeof pdfjsLib === 'undefined') {
                    throw new Error('Thư viện đọc PDF chưa được tải. Vui lòng tải lại trang và thử lại.');
                }
                ensurePdfWorker();

                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items
                        .map((item: any) => item.str)
                        .join(' ');
                    fullText += pageText + '\n\n';
                }
                extractedText = fullText;
            } else if (file.name.endsWith('.docx')) {
                const arrayBuffer = await file.arrayBuffer();
                const JSZip = (await import('jszip')).default;
                const zip = await JSZip.loadAsync(arrayBuffer);
                const docXml = await zip.file('word/document.xml')?.async('text');
                if (docXml) {
                    extractedText = docXml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                }
            } else if (file.name.endsWith('.txt')) {
                extractedText = await file.text();
            } else {
                setFileName('');
                setFileLoading(false);
                setError('Định dạng file không được hỗ trợ. Vui lòng tải file .pdf, .docx hoặc .txt');
                return;
            }

            if (!extractedText || extractedText.trim().length === 0) {
                setFileName('');
                setError('Không thể trích xuất văn bản từ file này. File có thể chứa ảnh scan hoặc không có nội dung text. Vui lòng thử file khác.');
            } else {
                setTextbookContent(extractedText);
            }
        } catch (err: any) {
            console.error('File read error:', err);
            setFileName('');
            setError(err.message || 'Lỗi khi đọc file. Vui lòng thử lại.');
        } finally {
            setFileLoading(false);
        }
    };

    const handleProcess = async () => {
        if (!textbookContent.trim()) {
            setError('Vui lòng tải lên file SGK trước khi xử lý.');
            return;
        }
        if (!apiKey) {
            setError('Vui lòng cấu hình API Key trước khi sử dụng.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult([]);

        try {
            const data = await generateAIIntegrationTable(
                { subject, grade, content: textbookContent },
                { analyzeOnly: false, detailedReport: false, comparisonExport: false, apiKey }
            );
            setResult(data);
        } catch (err: any) {
            console.error('Integration error:', err);
            setError(err.message || 'Đã xảy ra lỗi khi phân tích SGK.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Form Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-teal-100">
                <div className="flex items-center mb-5">
                    <BookOpen className="text-teal-600 mr-2" size={22} />
                    <h3 className="font-bold text-teal-900 text-lg">Thông tin môn học</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Khối lớp</label>
                        <select
                            value={grade}
                            onChange={(e) => {
                                const g = parseInt(e.target.value);
                                setGrade(g);
                                const subs = getSubjectsByGrade(g);
                                if (!subs.includes(subject)) setSubject(subs[0]);
                            }}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(g => (
                                <option key={g} value={g}>Lớp {g}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Môn học</label>
                        <select
                            value={subject}
                            onChange={(e) => setSubject(e.target.value as Subject)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                            {availableSubjects.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Upload Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-teal-100">
                <div className="flex items-center mb-4">
                    <Upload className="text-teal-600 mr-2" size={20} />
                    <h3 className="font-semibold text-teal-900">Tải lên Sách giáo khoa</h3>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                    Tải lên file SGK (PDF, DOCX hoặc TXT) để AI phân tích và gợi ý địa chỉ tích hợp giáo dục AI
                </p>

                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-teal-300 rounded-xl cursor-pointer bg-teal-50/50 hover:bg-teal-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {fileLoading ? (
                            <>
                                <svg className="w-8 h-8 mb-2 text-teal-600 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <p className="text-sm text-teal-700 font-medium">Đang đọc file...</p>
                            </>
                        ) : textbookContent ? (
                            <>
                                <svg className="w-8 h-8 mb-2 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-teal-700 font-medium">{fileName}</p>
                                <p className="text-xs text-slate-500 mt-1">{(textbookContent.length / 1000).toFixed(0)}K ký tự đã đọc</p>
                            </>
                        ) : (
                            <>
                                <Upload className="w-8 h-8 mb-2 text-teal-400" />
                                <p className="text-sm text-slate-600"><strong className="text-teal-600">Nhấp để chọn file</strong> hoặc kéo thả</p>
                                <p className="text-xs text-slate-400 mt-1">PDF, DOCX hoặc TXT</p>
                            </>
                        )}
                    </div>
                    <input type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileUpload} />
                </label>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                    <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {/* Process Button */}
            <button
                onClick={handleProcess}
                disabled={loading || !textbookContent}
                className={`w-full py-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 text-white font-bold text-lg transition-all transform hover:-translate-y-1 ${loading || !textbookContent
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-teal-600 to-teal-800 hover:shadow-teal-500/30'
                    }`}
            >
                {loading ? (
                    <span>Đang phân tích SGK...</span>
                ) : (
                    <>
                        <Sparkles size={24} />
                        <span>GỢI Ý ĐỊA CHỈ TÍCH HỢP AI</span>
                    </>
                )}
            </button>

            {/* Results */}
            <IntegrationResult data={result} subject={subject} grade={grade} loading={loading} />
        </div>
    );
};

export default IntegrationTab;
