import React, { useState } from 'react';
import { Download, CheckCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Packer,
  UnderlineType,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  AlignmentType
} from 'docx';
import FileSaver from 'file-saver';
import JSZip from 'jszip';
import { OriginalDocxFile, AppMode } from '../types';

interface ResultDisplayProps {
  result: string | null;
  loading: boolean;
  originalDocx?: OriginalDocxFile | null;
  appMode: AppMode;
}

// Interface cho các section đã parse (NLS hoặc AI)
interface ContentSection {
  marker: string;
  content: string;
  searchPatterns: string[];
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, loading, originalDocx, appMode }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);

  const isAIMode = appMode === AppMode.AI_EDU;
  const colorTag = isAIMode ? 'blue' : 'red';
  const colorHex = isAIMode ? '0000FF' : 'FF0000';

  // Parse tất cả các section từ kết quả AI (supports NLS_, DC_, AI_ markers)
  const parseAllSections = (content: string): ContentSection[] => {
    const sections: ContentSection[] = [];

    // Regex: ===NLS_XXX===, ===DC_XXX===, ===AI_XXX=== ... ===END===
    const sectionRegex = /===(NLS|DC|AI)_([^=]+)===(\s*[\s\S]*?)===END===/g;
    let match;

    while ((match = sectionRegex.exec(content)) !== null) {
      const prefix = match[1]; // NLS, DC, or AI
      const marker = match[2].trim();
      const sectionContent = match[3].trim();

      let searchPatterns: string[] = [];

      // ================== VIETNAMESE NLS/AI MARKERS ==================
      if (prefix === 'NLS' || prefix === 'AI') {
        if (marker === 'MỤC_TIÊU') {
          searchPatterns = [
            'Năng lực chung', 'năng lực chung', 'NĂNG LỰC CHUNG',
            'Năng lực:', 'năng lực:', '3. Năng lực', '2. Năng lực',
            'Năng lực đặc thù', 'năng lực đặc thù',
            'b) Năng lực', 'b. Năng lực',
            'Năng lực tính toán', 'Năng lực tự học', 'Năng lực hợp tác',
            '3. Thái độ', 'c) Thái độ', 'c. Thái độ',
            'Thái độ', 'thái độ', 'THÁI ĐỘ',
            'Phẩm chất', 'phẩm chất', 'PHẨM CHẤT', '3. Phẩm chất',
            'I. MỤC TIÊU', 'I. Mục tiêu', '1. Kiến thức', 'a) Kiến thức',
            'Năng lực tính toán', 'hình thành năng lực'
          ];
        }
        else if (marker.startsWith('HOẠT_ĐỘNG_')) {
          const parts = marker.replace('HOẠT_ĐỘNG_', '').split('_');
          const actNum = parts[0];
          const subPart = parts.slice(1).join('_');

          const actPatterns = [
            `Hoạt động ${actNum}:`, `Hoạt động ${actNum}.`, `Hoạt động ${actNum} `,
            `**Hoạt động ${actNum}`, `HOẠT ĐỘNG ${actNum}`, `HĐ ${actNum}:`,
            `Hoạt động ${actNum}`, `HĐ${actNum}`, `hoạt động ${actNum}`
          ];

          if (subPart === 'NỘI_DUNG') {
            searchPatterns = [...actPatterns, 'b) Nội dung', 'b. Nội dung', 'Nội dung:', 'b)Nội dung', '* Nội dung', '- Nội dung', 'NỘI DUNG'];
          } else if (subPart === 'SẢN_PHẨM') {
            searchPatterns = [...actPatterns, 'c) Sản phẩm', 'c. Sản phẩm', 'Sản phẩm:', 'c)Sản phẩm', '* Sản phẩm', '- Sản phẩm', 'SẢN PHẨM'];
          } else if (subPart === 'TỔ_CHỨC') {
            searchPatterns = [...actPatterns, 'd) Tổ chức thực hiện', 'd. Tổ chức thực hiện', 'd)Tổ chức', 'Tổ chức thực hiện', 'd) Tổ chức', 'd. Tổ chức', '* Tổ chức', 'TỔ CHỨC THỰC HIỆN'];
          } else if (subPart === 'MỤC_TIÊU_HĐ') {
            searchPatterns = [...actPatterns, 'a) Mục tiêu', 'a. Mục tiêu', 'Mục tiêu:', 'a)Mục tiêu', '* Mục tiêu', '- Mục tiêu'];
          } else if (subPart === 'BƯỚC_1') {
            searchPatterns = [...actPatterns, 'Bước 1:', 'Bước 1.', 'Bước 1 ', 'bước 1', 'Giao nhiệm vụ', 'Chuyển giao nhiệm vụ', 'Chuyển giao'];
          } else if (subPart === 'BƯỚC_2') {
            searchPatterns = [...actPatterns, 'Bước 2:', 'Bước 2.', 'Bước 2 ', 'bước 2', 'Thực hiện nhiệm vụ', 'HS thực hiện'];
          } else if (subPart === 'BƯỚC_3') {
            searchPatterns = [...actPatterns, 'Bước 3:', 'Bước 3.', 'Bước 3 ', 'bước 3', 'Báo cáo', 'Thảo luận', 'Trình bày', 'báo cáo, thảo luận'];
          } else if (subPart === 'BƯỚC_4' || subPart === 'KẾT_LUẬN') {
            searchPatterns = [...actPatterns, 'Bước 4:', 'Bước 4.', 'Bước 4 ', 'bước 4', 'Kết luận', 'Nhận định', 'Đánh giá', 'kết luận, nhận định', 'Kết luận, nhận định'];
          } else {
            searchPatterns = actPatterns;
          }
        }
        else if (marker === 'NỘI_DUNG') {
          searchPatterns = ['b) Nội dung', 'b. Nội dung', 'Nội dung:'];
        } else if (marker === 'BƯỚC_1') {
          searchPatterns = ['Bước 1:', 'Giao nhiệm vụ', 'Chuyển giao nhiệm vụ'];
        } else if (marker === 'BƯỚC_2') {
          searchPatterns = ['Bước 2:', 'Thực hiện nhiệm vụ', 'HS thực hiện'];
        } else if (marker === 'BƯỚC_3') {
          searchPatterns = ['Bước 3:', 'Báo cáo', 'Thảo luận'];
        } else if (marker === 'BƯỚC_4') {
          searchPatterns = ['Bước 4:', 'Kết luận', 'Nhận định'];
        } else if (marker === 'CỦNG_CỐ') {
          searchPatterns = ['Củng cố', 'Vận dụng'];
        } else if (marker === 'NỘI_DUNG_GDAI') {
          searchPatterns = [
            '3. Phẩm chất', 'Phẩm chất', 'phẩm chất', 'PHẨM CHẤT',
            'c) Phẩm chất', 'c. Phẩm chất',
            'I. MỤC TIÊU', 'I. Mục tiêu'
          ];
        } else if (marker === 'THIẾT_BỊ') {
          searchPatterns = [
            'II. THIẾT BỊ', 'II. Thiết bị', 'Thiết bị dạy học', 'THIẾT BỊ DẠY HỌC',
            'II. CHUẨN BỊ', 'Chuẩn bị', 'Học liệu', 'HỌC LIỆU',
            'Thiết bị và học liệu', 'Đồ dùng dạy học'
          ];
        } else if (marker === 'VẬN_DỤNG') {
          searchPatterns = [
            'Hoạt động 4', 'Hoạt động 5', 'Hoạt động vận dụng',
            'Vận dụng', 'VẬN DỤNG', 'Củng cố', 'CỦNG CỐ',
            'Hoạt động luyện tập', 'Tìm tòi mở rộng',
            'D. HOẠT ĐỘNG', 'IV. RÚT KINH NGHIỆM'
          ];
        } else if (marker === 'ĐÁNH_GIÁ') {
          searchPatterns = [
            'Rút kinh nghiệm', 'RÚT KINH NGHIỆM', 'IV. Rút kinh nghiệm',
            'Kế hoạch đánh giá', 'Đánh giá', 'ĐÁNH GIÁ',
            'Hoạt động 4', 'Hoạt động 5', 'Hoạt động vận dụng'
          ];
        }
      }
      // ================== ENGLISH DC/AI MARKERS ==================
      else if (prefix === 'DC') {
        if (marker === 'OBJECTIVES') {
          searchPatterns = [
            'Competences', 'competences', 'COMPETENCES',
            '2. Competences', 'competence',
            '3. Attitudes', 'Attitudes', 'attitudes', 'ATTITUDES',
            'I. OBJECTIVES', 'OBJECTIVES', 'I. Objectives',
            '1. Language knowledge', 'Language knowledge and skills'
          ];
        }
        else if (marker.startsWith('WARM_UP')) {
          const parts = marker.replace('WARM_UP_', '').split('_');
          const subPart = parts.join('_');
          const warmUpPatterns = ['A. Warm up', 'A.Warm up', 'Warm up:', 'WARM UP', 'Warm up', 'warm up', 'Warm-up'];

          if (subPart === 'ORGANIZATION' || subPart === '') {
            searchPatterns = [...warmUpPatterns, 'd) Organization', 'd. Organization', 'Organization:', "TEACHER'S ACTIVITIES", "STUDENTS' ACTIVITIES"];
          } else if (subPart === 'CONTENT') {
            searchPatterns = [...warmUpPatterns, 'b) Content', 'b. Content', 'Content:'];
          } else if (subPart === 'OUTCOMES') {
            searchPatterns = [...warmUpPatterns, 'c) Outcomes', 'c. Outcomes', 'Outcomes:'];
          } else if (subPart === 'OBJECTIVE') {
            searchPatterns = [...warmUpPatterns, 'a) Objective', 'a. Objective', 'Objective:'];
          } else {
            searchPatterns = warmUpPatterns;
          }
        }
        else if (marker.startsWith('ACTIVITY_')) {
          const parts = marker.replace('ACTIVITY_', '').split('_');
          const actNum = parts[0];
          const subPart = parts.slice(1).join('_');

          const actPatterns = [
            `Activity ${actNum}:`, `Activity ${actNum}.`, `Activity ${actNum} `,
            `**Activity ${actNum}`, `ACTIVITY ${actNum}`, `Activity${actNum}`,
            `Activity ${actNum}`, `activity ${actNum}`,
            ...(actNum === '1' ? ['Presentation', 'presentation', 'PRESENTATION'] : []),
            ...(actNum === '2' ? ['Practice', 'practice', 'PRACTICE'] : []),
            ...(actNum === '3' ? ['Production', 'production', 'PRODUCTION'] : [])
          ];

          if (subPart === 'CONTENT') {
            searchPatterns = [...actPatterns, 'b) Content', 'b. Content', 'Content:', 'b)Content', '* Content', '- Content', 'CONTENT'];
          } else if (subPart === 'OUTCOMES') {
            searchPatterns = [...actPatterns, 'c) Outcomes', 'c. Outcomes', 'Outcomes:', 'c)Outcomes', '* Outcomes', '- Outcomes', 'OUTCOMES'];
          } else if (subPart === 'ORGANIZATION') {
            searchPatterns = [...actPatterns, 'd) Organization', 'd. Organization', 'd)Organization', 'Organization:', '* Organization', 'ORGANIZATION', "TEACHER'S ACTIVITIES", "STUDENTS' ACTIVITIES"];
          } else if (subPart === 'OBJECTIVE') {
            searchPatterns = [...actPatterns, 'a) Objective', 'a. Objective', 'Objective:', 'a)Objective', '* Objective', '- Objective'];
          } else if (subPart === 'TEACHER_ACTIVITIES') {
            searchPatterns = [...actPatterns, "TEACHER'S ACTIVITIES", "Teacher's Activities", "Teacher's activities"];
          } else if (subPart === 'STUDENT_ACTIVITIES') {
            searchPatterns = [...actPatterns, "STUDENTS' ACTIVITIES", "Students' Activities", "Students' activities"];
          } else {
            searchPatterns = actPatterns;
          }
        }
        else if (marker.startsWith('CONSOLIDATION')) {
          const consolidationPatterns = ['C. Consolidation', 'C.Consolidation', 'Consolidation:', 'CONSOLIDATION', 'Consolidation', 'consolidation'];
          if (marker === 'CONSOLIDATION' || marker.endsWith('ORGANIZATION')) {
            searchPatterns = [...consolidationPatterns, 'd) Organization', "TEACHER'S ACTIVITIES"];
          } else {
            searchPatterns = consolidationPatterns;
          }
        }
        else if (marker.startsWith('HOMEWORK')) {
          searchPatterns = ['D. Homework', 'D.Homework', 'Homework:', 'HOMEWORK', 'Homework', 'homework'];
        }
      }

      sections.push({
        marker: `${prefix}_${marker}`,
        content: sectionContent,
        searchPatterns
      });
    }

    return sections;
  };

  // Helper: Tạo Table
  const createTableFromMarkdown = (tableLines: string[]): Table | null => {
    try {
      const validLines = tableLines.filter(line => !line.match(/^\|?\s*[-:]+[-|\s:]*\|?\s*$/));
      const rows = validLines.map(line => {
        const cells = line.split('|');
        if (line.trim().startsWith('|')) cells.shift();
        if (line.trim().endsWith('|')) cells.pop();
        return new TableRow({
          children: cells.map(cellContent => new TableCell({
            children: [new Paragraph({ children: parseTextWithFormatting(cellContent.trim()) })],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            },
            width: { size: 100 / cells.length, type: WidthType.PERCENTAGE }
          }))
        });
      });
      return new Table({ rows: rows, width: { size: 100, type: WidthType.PERCENTAGE } });
    } catch (e) {
      return null;
    }
  };

  // Helper: Parse text - supports both <red> (NLS) and <blue> (AI) tags
  const parseTextWithFormatting = (text: string): TextRun[] => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|<u>.*?<\/u>|<red>.*?<\/red>|<blue>.*?<\/blue>)/g);
    return parts.map(part => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return new TextRun({ text: part.slice(2, -2), bold: true });
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return new TextRun({ text: part.slice(1, -1), italics: true });
      }
      if (part.startsWith('<u>') && part.endsWith('</u>')) {
        return new TextRun({ text: part.replace(/<\/?u>/g, ''), underline: { type: UnderlineType.SINGLE } });
      }
      if (part.startsWith('<red>') && part.endsWith('</red>')) {
        return new TextRun({ text: part.replace(/<\/?red>/g, ''), color: "FF0000" });
      }
      if (part.startsWith('<blue>') && part.endsWith('</blue>')) {
        return new TextRun({ text: part.replace(/<\/?blue>/g, ''), color: "0000FF" });
      }
      return new TextRun({ text: part });
    });
  };

  // Escape XML
  const escapeXml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  // Chuyển Markdown sang Word XML - hỗ trợ cả màu đỏ và xanh
  const convertMarkdownToWordXml = (markdown: string): string => {
    const lines = markdown.split('\n');
    let xml = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Chỉ skip marker lines (===XXX=== hoặc ===END===)
      if (trimmed.match(/^===[A-Z_]+=*===$/) || trimmed === '===END===') {
        continue;
      }

      let processedLine = trimmed;

      // Loại bỏ thẻ <u>
      processedLine = processedLine.replace(/<\/?u>/g, '');

      // Detect color tags
      let isRedContent = trimmed.includes('<red>') || trimmed.includes('</red>');
      let isBlueContent = trimmed.includes('<blue>') || trimmed.includes('</blue>');
      processedLine = processedLine.replace(/<\/?red>/g, '');
      processedLine = processedLine.replace(/<\/?blue>/g, '');

      // Detect bold
      let isBold = processedLine.startsWith('**') && processedLine.endsWith('**');
      if (isBold) processedLine = processedLine.slice(2, -2);

      const content = escapeXml(processedLine);

      // Build run properties
      let rPr = '';
      if (isBlueContent) rPr += '<w:color w:val="0000FF"/>';
      else if (isRedContent) rPr += '<w:color w:val="FF0000"/>';
      if (isBold) rPr += '<w:b/>';

      if (rPr) {
        xml += `<w:p><w:r><w:rPr>${rPr}</w:rPr><w:t>${content}</w:t></w:r></w:p>`;
      } else {
        xml += `<w:p><w:r><w:t>${content}</w:t></w:r></w:p>`;
      }
    }

    return xml;
  };

  // Tìm và chèn nội dung SAU vị trí tìm thấy
  const findAndInsertAfter = (xml: string, searchPatterns: string[], contentToInsert: string): { result: string; inserted: boolean } => {
    for (const pattern of searchPatterns) {
      const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const regex = new RegExp(`(<w:p[^>]*>(?:(?!<w:p[^>]*>)[\\s\\S])*?${escapedPattern}(?:(?!<w:p[^>]*>)[\\s\\S])*?</w:p>)`, 'i');

      const match = xml.match(regex);
      if (match) {
        const newXml = xml.replace(match[0], match[0] + contentToInsert);
        return { result: newXml, inserted: true };
      }
    }

    return { result: xml, inserted: false };
  };

  // XML Injection với NHIỀU vị trí chèn
  const injectContentToDocx = async (
    originalArrayBuffer: ArrayBuffer,
    aiResult: string
  ): Promise<Blob> => {
    const zip = await JSZip.loadAsync(originalArrayBuffer);

    const documentXmlFile = zip.file('word/document.xml');
    if (!documentXmlFile) {
      throw new Error('File DOCX không hợp lệ');
    }

    let documentXml = await documentXmlFile.async('string');

    const sections = parseAllSections(aiResult);

    let insertedCount = 0;
    let notInsertedSections: string[] = [];

    for (const section of sections) {
      const sectionXml = convertMarkdownToWordXml(section.content);
      const { result, inserted } = findAndInsertAfter(documentXml, section.searchPatterns, sectionXml);

      if (inserted) {
        documentXml = result;
        insertedCount++;
        console.log(`✓ Đã chèn nội dung cho: ${section.marker}`);
      } else {
        notInsertedSections.push(section.marker);
        console.log(`✗ Không tìm thấy vị trí cho: ${section.marker}`);
      }
    }

    // Map marker names to readable Vietnamese labels
    const getMarkerLabel = (marker: string): string => {
      const labels: Record<string, string> = {
        'AI_MỤC_TIÊU': 'Năng lực AI đặc thù',
        'AI_NỘI_DUNG_GDAI': 'Nội dung giáo dục AI',
        'AI_THIẾT_BỊ': 'Công cụ số và AI',
        'AI_VẬN_DỤNG': 'Hoạt động vận dụng giáo dục AI',
        'AI_ĐÁNH_GIÁ': 'Kế hoạch đánh giá năng lực AI',
        'AI_CỦNG_CỐ': 'Củng cố - Giáo dục AI',
        'NLS_MỤC_TIÊU': 'Mục tiêu năng lực số',
        'NLS_CỦNG_CỐ': 'Củng cố - Tích hợp NLS',
      };
      if (labels[marker]) return labels[marker];
      // Handle dynamic markers like AI_HOẠT_ĐỘNG_1_NỘI_DUNG
      const actMatch = marker.match(/^(AI|NLS)_HOẠT_ĐỘNG_(\d+)_?(.*)$/);
      if (actMatch) {
        const prefix = actMatch[1] === 'AI' ? 'Giáo dục AI' : 'NLS';
        const actNum = actMatch[2];
        const sub = actMatch[3]?.replace(/_/g, ' ') || '';
        return `Hoạt động ${actNum} - ${prefix}${sub ? ': ' + sub : ''}`;
      }
      return marker.replace(/_/g, ' ');
    };

    if (notInsertedSections.length > 0) {
      const labelText = isAIMode ? '═══ NỘI DUNG GIÁO DỤC AI BỔ SUNG ═══' : '═══ NỘI DUNG NLS BỔ SUNG ═══';
      let fallbackXml = `
        <w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="12" w:space="1" w:color="${colorHex}"/></w:pBdr></w:pPr></w:p>
        <w:p><w:r><w:rPr><w:color w:val="${colorHex}"/><w:b/></w:rPr><w:t>${labelText}</w:t></w:r></w:p>
      `;

      for (const section of sections) {
        if (notInsertedSections.includes(section.marker)) {
          const label = getMarkerLabel(section.marker);
          fallbackXml += `<w:p><w:r><w:rPr><w:color w:val="${colorHex}"/><w:b/></w:rPr><w:t>${escapeXml(label)}</w:t></w:r></w:p>`;
          fallbackXml += convertMarkdownToWordXml(section.content);
        }
      }

      documentXml = documentXml.replace('</w:body>', fallbackXml + '</w:body>');
    }

    console.log(`Tổng: ${insertedCount}/${sections.length} section được chèn vào đúng vị trí`);

    zip.file('word/document.xml', documentXml);

    return await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
  };

  // Chuẩn bị nội dung cho DOCX - giữ nguyên tất cả, chỉ loại bỏ markers
  const getFullContentForDocx = (content: string): string => {
    return content
      // Remove marker lines but keep content between them
      .replace(/===(NLS|DC|AI)_[^=]+=*===/g, '')
      .replace(/===END===/g, '')
      // Clean up excessive blank lines
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  // Fallback: Tạo file DOCX mới - đầy đủ nội dung
  const createNewDocx = async (content: string): Promise<Blob> => {
    const lines = content.split('\n');
    const children: (Paragraph | Table)[] = [];
    let tableBuffer: string[] = [];
    let inTable = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trimEnd();
      const trimmed = line.trim();

      // Table handling
      if (trimmed.startsWith('|')) {
        inTable = true;
        tableBuffer.push(line);
        continue;
      } else if (inTable) {
        if (tableBuffer.length > 0) {
          const tableNode = createTableFromMarkdown(tableBuffer);
          if (tableNode) {
            children.push(tableNode);
            children.push(new Paragraph({ text: "" }));
          }
          tableBuffer = [];
        }
        inTable = false;
      }

      // Skip empty lines and horizontal rules
      if (!trimmed || trimmed === '---' || trimmed === '***') continue;

      // Headings - support all levels
      if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
        children.push(new Paragraph({
          children: parseTextWithFormatting(trimmed.replace(/^# /, '')),
          heading: HeadingLevel.TITLE,
          spacing: { before: 240, after: 120 }
        }));
      } else if (trimmed.startsWith('## ')) {
        children.push(new Paragraph({
          children: parseTextWithFormatting(trimmed.replace(/^## /, '')),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 100 }
        }));
      } else if (trimmed.startsWith('### ')) {
        children.push(new Paragraph({
          children: parseTextWithFormatting(trimmed.replace(/^### /, '')),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 150, after: 50 }
        }));
      } else if (trimmed.startsWith('#### ')) {
        children.push(new Paragraph({
          children: parseTextWithFormatting(trimmed.replace(/^#### /, '')),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 120, after: 40 }
        }));
      }
      // Bullet points - support nested levels (  + or    - )
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        children.push(new Paragraph({
          children: parseTextWithFormatting(trimmed.substring(2)),
          bullet: { level: 0 }
        }));
      } else if (trimmed.startsWith('+ ') || (line.startsWith('  ') && (trimmed.startsWith('- ') || trimmed.startsWith('* ')))) {
        children.push(new Paragraph({
          children: parseTextWithFormatting(trimmed.replace(/^[+\-*] /, '')),
          bullet: { level: 1 }
        }));
      }
      // Numbered lists
      else if (trimmed.match(/^\d+\.\s/)) {
        children.push(new Paragraph({
          children: parseTextWithFormatting(trimmed),
          spacing: { after: 60 },
          alignment: AlignmentType.JUSTIFIED
        }));
      }
      // Regular paragraphs
      else {
        children.push(new Paragraph({
          children: parseTextWithFormatting(trimmed),
          spacing: { after: 100 },
          alignment: AlignmentType.JUSTIFIED
        }));
      }
    }

    // Flush remaining table buffer
    if (tableBuffer.length > 0) {
      const tableNode = createTableFromMarkdown(tableBuffer);
      if (tableNode) children.push(tableNode);
    }

    const doc = new Document({
      sections: [{ properties: {}, children: children }],
    });

    return await Packer.toBlob(doc);
  };

  // Hàm chính xuất file DOCX
  const generateDocx = async () => {
    if (!result) return;
    setIsGeneratingDoc(true);

    try {
      let blob: Blob;
      let fileName: string;

      if (originalDocx?.arrayBuffer) {
        console.log('XML Injection: Chèn nội dung vào nhiều vị trí...');
        blob = await injectContentToDocx(originalDocx.arrayBuffer, result);
        const suffix = isAIMode ? '_AI_EDU' : '_NLS';
        fileName = originalDocx.fileName.replace('.docx', `${suffix}.docx`);
      } else {
        console.log('Tạo file DOCX mới...');
        const docxContent = getFullContentForDocx(result);
        blob = await createNewDocx(docxContent);
        fileName = isAIMode ? 'Giao_an_AI_Edu.docx' : 'Giao_an_NLS.docx';
      }

      FileSaver.saveAs(blob, fileName);
    } catch (error) {
      console.error("Lỗi tạo file docx:", error);
      alert("Không thể tạo file .docx. Hệ thống sẽ tải về file văn bản thô.");
      handleDownloadTxt();
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  const handleDownloadTxt = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/plain' });
    const fileName = isAIMode ? 'Giao_an_AI_Edu.txt' : 'Giao_an_NLS.txt';
    FileSaver.saveAs(blob, fileName);
  };

  if (loading) {
    return (
      <div className={`bg-white p-12 rounded-xl shadow-sm border ${isAIMode ? 'border-purple-100' : 'border-blue-100'} flex flex-col items-center justify-center min-h-[300px]`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 ${isAIMode ? 'border-purple-600' : 'border-blue-600'} mb-6`}></div>
        <h3 className={`text-lg font-semibold ${isAIMode ? 'text-purple-900' : 'text-blue-900'} animate-pulse`}>Đang xử lý...</h3>
        <p className="text-slate-500 mt-2 text-sm">
          {isAIMode
            ? 'Đang phân tích KHBD và tích hợp giáo dục AI theo QĐ 3439...'
            : 'Đang phân tích KHBD và tích hợp năng lực số...'
          }
        </p>
      </div>
    );
  }

  if (!result) return null;

  const components = {
    red: ({ children }: { children: React.ReactNode }) => (
      <span style={{ color: 'red' }}>{children}</span>
    ),
    blue: ({ children }: { children: React.ReactNode }) => (
      <span style={{ color: '#2563eb' }}>{children}</span>
    ),
  };

  // Đếm số section
  const sections = parseAllSections(result);

  // Hiển thị nội dung preview - hỗ trợ tất cả markers (NLS + DC + AI)
  const getCleanResultForPreview = (content: string): string => {
    return content
      // ================== VIETNAMESE NLS MARKERS ==================
      .replace(/===NLS_MỤC_TIÊU===/g, '\n**📌 MỤC TIÊU NĂNG LỰC SỐ:**\n')
      .replace(/===NLS_HOẠT_ĐỘNG_(\d+)_NỘI_DUNG===/g, '\n**📌 HOẠT ĐỘNG $1 - NỘI DUNG NLS:**\n')
      .replace(/===NLS_HOẠT_ĐỘNG_(\d+)_SẢN_PHẨM===/g, '\n**📌 HOẠT ĐỘNG $1 - SẢN PHẨM NLS:**\n')
      .replace(/===NLS_HOẠT_ĐỘNG_(\d+)_TỔ_CHỨC===/g, '\n**📌 HOẠT ĐỘNG $1 - TỔ CHỨC NLS:**\n')
      .replace(/===NLS_HOẠT_ĐỘNG_(\d+)_MỤC_TIÊU_HĐ===/g, '\n**📌 HOẠT ĐỘNG $1 - MỤC TIÊU NLS:**\n')
      .replace(/===NLS_HOẠT_ĐỘNG_(\d+)_BƯỚC_(\d+)===/g, '\n**📌 HOẠT ĐỘNG $1 - BƯỚC $2 NLS:**\n')
      .replace(/===NLS_HOẠT_ĐỘNG_(\d+)_KẾT_LUẬN===/g, '\n**📌 HOẠT ĐỘNG $1 - KẾT LUẬN NLS:**\n')
      .replace(/===NLS_HOẠT_ĐỘNG_(\d+)===/g, '\n**📌 HOẠT ĐỘNG $1 - NLS:**\n')
      .replace(/===NLS_CỦNG_CỐ===/g, '\n**📌 CỦNG CỐ - TÍCH HỢP NLS:**\n')

      // ================== VIETNAMESE AI MARKERS ==================
      .replace(/===AI_MỤC_TIÊU===/g, '\n**🤖 NĂNG LỰC AI:**\n')
      .replace(/===AI_HOẠT_ĐỘNG_(\d+)_NỘI_DUNG===/g, '\n**🤖 HOẠT ĐỘNG $1 - NỘI DUNG AI:**\n')
      .replace(/===AI_HOẠT_ĐỘNG_(\d+)_SẢN_PHẨM===/g, '\n**🤖 HOẠT ĐỘNG $1 - SẢN PHẨM AI:**\n')
      .replace(/===AI_HOẠT_ĐỘNG_(\d+)_TỔ_CHỨC===/g, '\n**🤖 HOẠT ĐỘNG $1 - TỔ CHỨC AI:**\n')
      .replace(/===AI_HOẠT_ĐỘNG_(\d+)_MỤC_TIÊU_HĐ===/g, '\n**🤖 HOẠT ĐỘNG $1 - MỤC TIÊU AI:**\n')
      .replace(/===AI_HOẠT_ĐỘNG_(\d+)_BƯỚC_(\d+)===/g, '\n**🤖 HOẠT ĐỘNG $1 - BƯỚC $2 AI:**\n')
      .replace(/===AI_HOẠT_ĐỘNG_(\d+)_KẾT_LUẬN===/g, '\n**🤖 HOẠT ĐỘNG $1 - KẾT LUẬN AI:**\n')
      .replace(/===AI_HOẠT_ĐỘNG_(\d+)===/g, '\n**🤖 HOẠT ĐỘNG $1 - GIÁO DỤC AI:**\n')
      .replace(/===AI_CỦNG_CỐ===/g, '\n**🤖 CỦNG CỐ - GIÁO DỤC AI:**\n')
      .replace(/===AI_NỘI_DUNG_GDAI===/g, '\n**🤖 NỘI DUNG GIÁO DỤC AI:**\n')
      .replace(/===AI_THIẾT_BỊ===/g, '\n**🤖 CÔNG CỤ SỐ VÀ AI:**\n')
      .replace(/===AI_VẬN_DỤNG===/g, '\n**🤖 HOẠT ĐỘNG VẬN DỤNG GIÁO DỤC AI:**\n')
      .replace(/===AI_ĐÁNH_GIÁ===/g, '\n**🤖 KẾ HOẠCH ĐÁNH GIÁ NĂNG LỰC AI:**\n')

      // ================== ENGLISH DC MARKERS ==================
      .replace(/===DC_OBJECTIVES===/g, '\n**📌 DIGITAL COMPETENCE OBJECTIVES:**\n')
      .replace(/===DC_WARM_UP_ORGANIZATION===/g, '\n**📌 WARM UP - DC ORGANIZATION:**\n')
      .replace(/===DC_WARM_UP_CONTENT===/g, '\n**📌 WARM UP - DC CONTENT:**\n')
      .replace(/===DC_WARM_UP_OUTCOMES===/g, '\n**📌 WARM UP - DC OUTCOMES:**\n')
      .replace(/===DC_WARM_UP_OBJECTIVE===/g, '\n**📌 WARM UP - DC OBJECTIVE:**\n')
      .replace(/===DC_WARM_UP===/g, '\n**📌 WARM UP - DC:**\n')
      .replace(/===DC_ACTIVITY_(\d+)_CONTENT===/g, '\n**📌 ACTIVITY $1 - DC CONTENT:**\n')
      .replace(/===DC_ACTIVITY_(\d+)_OUTCOMES===/g, '\n**📌 ACTIVITY $1 - DC OUTCOMES:**\n')
      .replace(/===DC_ACTIVITY_(\d+)_ORGANIZATION===/g, '\n**📌 ACTIVITY $1 - DC ORGANIZATION:**\n')
      .replace(/===DC_ACTIVITY_(\d+)_OBJECTIVE===/g, '\n**📌 ACTIVITY $1 - DC OBJECTIVE:**\n')
      .replace(/===DC_ACTIVITY_(\d+)_TEACHER_ACTIVITIES===/g, '\n**📌 ACTIVITY $1 - TEACHER DC:**\n')
      .replace(/===DC_ACTIVITY_(\d+)_STUDENT_ACTIVITIES===/g, '\n**📌 ACTIVITY $1 - STUDENT DC:**\n')
      .replace(/===DC_ACTIVITY_(\d+)===/g, '\n**📌 ACTIVITY $1 - DC:**\n')
      .replace(/===DC_CONSOLIDATION_ORGANIZATION===/g, '\n**📌 CONSOLIDATION - DC:**\n')
      .replace(/===DC_CONSOLIDATION===/g, '\n**📌 CONSOLIDATION - DC:**\n')
      .replace(/===DC_HOMEWORK===/g, '\n**📌 HOMEWORK - DC:**\n')

      // ================== ENGLISH AI MARKERS ==================
      .replace(/===AI_OBJECTIVES===/g, '\n**🤖 AI COMPETENCE:**\n')
      .replace(/===AI_ACTIVITY_(\d+)_CONTENT===/g, '\n**🤖 ACTIVITY $1 - AI CONTENT:**\n')
      .replace(/===AI_ACTIVITY_(\d+)_OUTCOMES===/g, '\n**🤖 ACTIVITY $1 - AI OUTCOMES:**\n')
      .replace(/===AI_ACTIVITY_(\d+)_ORGANIZATION===/g, '\n**🤖 ACTIVITY $1 - AI ORGANIZATION:**\n')
      .replace(/===AI_ACTIVITY_(\d+)_OBJECTIVE===/g, '\n**🤖 ACTIVITY $1 - AI OBJECTIVE:**\n')
      .replace(/===AI_ACTIVITY_(\d+)===/g, '\n**🤖 ACTIVITY $1 - AI:**\n')

      .replace(/===END===/g, '\n---\n');
  };

  const modeLabel = isAIMode ? 'giáo dục AI' : 'NLS';
  const modeColorLabel = isAIMode ? 'xanh dương' : 'đỏ';

  return (
    <div className={`bg-white rounded-xl shadow-lg border ${isAIMode ? 'border-purple-200' : 'border-blue-200'} overflow-hidden animate-fade-in-up`}>
      <div className={`${isAIMode ? 'bg-purple-50' : 'bg-blue-50'} px-6 py-8 flex flex-col items-center justify-center text-center space-y-4`}>
        <div className="p-4 bg-green-100 rounded-full">
          <CheckCircle className="text-green-600" size={40} />
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${isAIMode ? 'text-purple-900' : 'text-blue-900'}`}>
            {isAIMode ? 'Tích hợp giáo dục AI thành công!' : 'Phân tích KHBD thành công!'}
          </h2>
          <p className="text-slate-600 mt-2 max-w-lg mx-auto">
            Đã tạo <strong>{sections.length} phần</strong> nội dung {modeLabel} để chèn vào KHBD.
          </p>
          {originalDocx && (
            <p className={`${isAIMode ? 'text-purple-600' : 'text-green-600'} font-medium mt-2 text-sm ${isAIMode ? 'bg-purple-50' : 'bg-green-50'} p-2 rounded`}>
              ✓ XML Injection: Chèn nội dung vào <strong>nhiều vị trí</strong> trong file gốc
            </p>
          )}
          <p className={`font-medium mt-2 text-sm p-2 rounded ${isAIMode ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50'}`}>
            {isAIMode
              ? <>📌 Nội dung AI: <span style={{ color: '#2563eb' }}>màu xanh dương</span> • Theo QĐ 3439/QĐ-BGDĐT</>
              : <>📌 Nội dung NLS: <span style={{ color: 'red' }}>màu đỏ</span> • Phân bố vào: Mục tiêu + Các Hoạt động</>
            }
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full max-w-md">
          <button
            onClick={generateDocx}
            disabled={isGeneratingDoc}
            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 text-white rounded-xl text-lg font-bold transition-all shadow-md transform hover:-translate-y-1 ${isAIMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isGeneratingDoc ? (
              <span className="animate-pulse">Đang tạo file...</span>
            ) : (
              <>
                <Download size={24} />
                <span>Tải về .docx</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownloadTxt}
            className="flex-none flex items-center justify-center px-4 py-4 bg-white text-slate-600 rounded-xl font-medium border border-slate-300 hover:bg-slate-50 transition-colors"
            title="Tải bản text dự phòng"
          >
            <FileText size={24} />
          </button>
        </div>

        <button
          onClick={() => setShowPreview(!showPreview)}
          className={`flex items-center ${isAIMode ? 'text-purple-600' : 'text-blue-600'} text-sm font-medium hover:underline mt-4`}
        >
          {showPreview ? (
            <>Thu gọn xem trước <ChevronUp size={16} className="ml-1" /></>
          ) : (
            <>Xem trước nội dung ({sections.length} phần) <ChevronDown size={16} className="ml-1" /></>
          )}
        </button>
      </div>

      {showPreview && (
        <div className={`p-8 prose max-w-none prose-p:text-slate-700 prose-headings:text-blue-900 border-t border-slate-100 bg-slate-50/50 ${isAIMode ? 'prose-purple' : 'prose-blue'}`}>
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            components={components as any}
          >
            {getCleanResultForPreview(result)}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;