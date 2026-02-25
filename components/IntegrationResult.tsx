import React from 'react';
import { IntegrationRow } from '../types';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { Download, Table2, FileText } from 'lucide-react';

interface IntegrationResultProps {
    data: IntegrationRow[];
    subject: string;
    grade: number;
    loading: boolean;
}

const IntegrationResult: React.FC<IntegrationResultProps> = ({ data, subject, grade, loading }) => {
    if (loading) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-teal-100 mt-6">
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
                    <p className="text-teal-700 font-medium">Đang phân tích SGK và gợi ý địa chỉ tích hợp AI...</p>
                    <p className="text-sm text-slate-500 mt-2">Quá trình này có thể mất 30-60 giây</p>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) return null;

    const handleDownloadWord = async () => {
        try {
            const headerCells = ['STT', 'Chủ đề', 'Tên bài học', 'Mục tiêu bài học', 'Mục tiêu tích hợp', 'YCCĐ theo khung 3439', 'Ghi chú'];

            const headerRow = new TableRow({
                tableHeader: true,
                children: headerCells.map((text, idx) => new TableCell({
                    width: { size: idx === 0 ? 500 : (idx >= 3 && idx <= 5 ? 2000 : 1200), type: WidthType.DXA },
                    shading: { fill: '0D7377' },
                    children: [new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 20, font: 'Times New Roman' })]
                    })]
                }))
            });

            const dataRows = data.map((row, idx) => new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(idx + 1), size: 20, font: 'Times New Roman' })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: row.chuDe, size: 20, font: 'Times New Roman' })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: row.tenBaiHoc, size: 20, font: 'Times New Roman' })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: row.mucTieuBaiHoc, size: 20, font: 'Times New Roman' })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: row.mucTieuTichHop, size: 20, font: 'Times New Roman', color: '0D7377' })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: row.yeuCauCanDat, size: 20, font: 'Times New Roman', italics: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: row.ghiChu, size: 20, font: 'Times New Roman' })] })] }),
                ]
            }));

            const doc = new Document({
                sections: [{
                    properties: {
                        page: { size: { orientation: 'landscape' } }
                    },
                    children: [
                        new Paragraph({
                            heading: HeadingLevel.HEADING_1,
                            alignment: AlignmentType.CENTER,
                            children: [new TextRun({
                                text: 'GỢI Ý ĐỊA CHỈ TÍCH HỢP GIÁO DỤC AI',
                                bold: true, size: 28, font: 'Times New Roman', color: '0D7377'
                            })]
                        }),
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 200 },
                            children: [new TextRun({
                                text: `Môn: ${subject} - Lớp: ${grade}`,
                                size: 24, font: 'Times New Roman'
                            })]
                        }),
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 300 },
                            children: [new TextRun({
                                text: '(Theo Quyết định 3439/QĐ-BGDĐT và Công văn 8334/BGDĐT-GDPT)',
                                size: 20, font: 'Times New Roman', italics: true
                            })]
                        }),
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [headerRow, ...dataRows]
                        }),
                        new Paragraph({
                            spacing: { before: 400 },
                            children: [new TextRun({
                                text: 'Ghi chú: NLa = Tư duy lấy con người làm trung tâm | NLb = Đạo đức AI | NLc = Kỹ thuật và ứng dụng AI | NLd = Thiết kế hệ thống AI',
                                size: 18, font: 'Times New Roman', italics: true
                            })]
                        })
                    ]
                }]
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, `Tich_hop_AI_${subject}_Lop${grade}.docx`);
        } catch (err) {
            console.error('Error generating DOCX:', err);
            alert('Lỗi khi tạo file Word. Vui lòng thử lại.');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-teal-100 mt-6 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white p-5 flex items-center justify-between">
                <div className="flex items-center">
                    <Table2 className="mr-3" size={24} />
                    <div>
                        <h3 className="font-bold text-lg">Gợi ý địa chỉ tích hợp giáo dục AI</h3>
                        <p className="text-teal-100 text-sm">Môn {subject} - Lớp {grade} | {data.length} địa chỉ được gợi ý</p>
                    </div>
                </div>
                <button
                    onClick={handleDownloadWord}
                    className="flex items-center space-x-2 bg-white text-teal-800 px-4 py-2 rounded-lg font-medium hover:bg-teal-50 transition-colors shadow-sm"
                >
                    <Download size={18} />
                    <span>Tải Word</span>
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-teal-50">
                            <th className="px-3 py-3 text-left text-xs font-semibold text-teal-800 uppercase tracking-wider border-b border-teal-200 w-10">STT</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-teal-800 uppercase tracking-wider border-b border-teal-200">Chủ đề</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-teal-800 uppercase tracking-wider border-b border-teal-200">Tên bài học</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-teal-800 uppercase tracking-wider border-b border-teal-200">Mục tiêu bài học</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-teal-800 uppercase tracking-wider border-b border-teal-200 bg-teal-100">Mục tiêu tích hợp</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-teal-800 uppercase tracking-wider border-b border-teal-200 bg-teal-100">YCCĐ theo khung 3439</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-teal-800 uppercase tracking-wider border-b border-teal-200">Ghi chú</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, idx) => (
                            <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-teal-50 transition-colors`}>
                                <td className="px-3 py-3 text-center font-medium text-slate-600 border-b border-slate-100">{idx + 1}</td>
                                <td className="px-3 py-3 text-slate-700 border-b border-slate-100 font-medium">{row.chuDe}</td>
                                <td className="px-3 py-3 text-slate-700 border-b border-slate-100 font-medium">{row.tenBaiHoc}</td>
                                <td className="px-3 py-3 text-slate-600 border-b border-slate-100 text-xs leading-relaxed">{row.mucTieuBaiHoc}</td>
                                <td className="px-3 py-3 text-teal-800 border-b border-slate-100 text-xs leading-relaxed bg-teal-50/50 font-medium">{row.mucTieuTichHop}</td>
                                <td className="px-3 py-3 text-teal-700 border-b border-slate-100 text-xs leading-relaxed bg-teal-50/50 italic">{row.yeuCauCanDat}</td>
                                <td className="px-3 py-3 text-slate-500 border-b border-slate-100 text-xs">{row.ghiChu}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Legend */}
            <div className="bg-teal-50 p-4 border-t border-teal-100">
                <p className="text-xs text-teal-700">
                    <strong>Chú thích:</strong> NLa = Tư duy lấy con người làm trung tâm | NLb = Đạo đức AI | NLc = Kỹ thuật và ứng dụng AI | NLd = Thiết kế hệ thống AI
                </p>
                <p className="text-xs text-teal-600 mt-1">
                    Theo Quyết định 3439/QĐ-BGDĐT và Công văn 8334/BGDĐT-GDPT ngày 18/12/2025
                </p>
            </div>
        </div>
    );
};

export default IntegrationResult;
