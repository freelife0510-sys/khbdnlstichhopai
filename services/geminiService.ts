import { GoogleGenAI } from "@google/genai";
import { LessonInfo, ProcessingOptions, Subject, IntegrationRow } from "../types";

// Hàm xác định mức độ NLS phù hợp theo cấp lớp
function getGradeLevelGuidance(grade: number): string {
  if (grade >= 1 && grade <= 3) {
    return `
  🎯 MỨC ĐỘ NLS PHÙ HỢP VỚI LỚP ${grade} (CẤP TIỂU HỌC ĐẦU):
  - CHỈ SỬ DỤNG mức CB1 (Cơ bản 1) và CB2 (Cơ bản 2)
  - Học sinh cần được hướng dẫn từng bước, thao tác đơn giản
  - Ví dụ phù hợp: Xem video, quan sát hình ảnh, sử dụng phần mềm học tập có hướng dẫn
  - TRÁNH: Các hoạt động yêu cầu tự tìm kiếm, đánh giá phức tạp`;
  } else if (grade >= 4 && grade <= 6) {
    return `
  🎯 MỨC ĐỘ NLS PHÙ HỢP VỚI LỚP ${grade} (CẤP TIỂU HỌC CUỐI):
  - SỬ DỤNG mức CB2 (Cơ bản 2) và TC1 (Trung cấp 1)
  - Học sinh có thể thực hiện tác vụ độc lập với hướng dẫn rõ ràng
  - Ví dụ phù hợp: Tìm kiếm thông tin đơn giản, sử dụng MTCT, tạo nội dung cơ bản
  - TRÁNH: Đánh giá độ tin cậy nguồn, lập trình phức tạp`;
  } else if (grade >= 7 && grade <= 9) {
    return `
  🎯 MỨC ĐỘ NLS PHÙ HỢP VỚI LỚP ${grade} (CẤP THCS):
  - SỬ DỤNG mức TC1 (Trung cấp 1) và TC2 (Trung cấp 2)
  - Học sinh có thể giải quyết vấn đề, lựa chọn công cụ phù hợp
  - Ví dụ phù hợp: GeoGebra, Excel cơ bản, hợp tác qua Google Docs, tìm kiếm nâng cao
  - CÓ THỂ: Bắt đầu giới thiệu mức NC1 cho học sinh giỏi`;
  } else {
    return `
  🎯 MỨC ĐỘ NLS PHÙ HỢP VỚI LỚP ${grade} (CẤP THPT):
  - SỬ DỤNG mức TC2 (Trung cấp 2) và NC1 (Nâng cao 1)
  - Học sinh có thể áp dụng linh hoạt, sáng tạo trong bối cảnh mới
  - Ví dụ phù hợp: Phân tích dữ liệu phức tạp, đánh giá nguồn tin, lập trình Python/Block-code, sử dụng AI
  - KHUYẾN KHÍCH: Hoạt động yêu cầu tư duy phản biện, sáng tạo nội dung số`;
  }
}

// Hàm phân tích đặc thù môn học và đưa ra hướng dẫn NLS phù hợp
function getSubjectGuidance(subject: Subject): string {
  switch (subject) {
    case Subject.TOAN:
      return `
📚 ĐẶC THÙ MÔN TOÁN - HƯỚNG DẪN NLS:
- ƯU TIÊN: Sử dụng công cụ tính toán số (MTCT, GeoGebra, Excel, Desmos)
- NLS PHÙ HỢP: 5.2 (Xác định nhu cầu công nghệ), 3.4 (Lập trình), 1.1 (Tìm kiếm dữ liệu)
- VÍ DỤ: Vẽ đồ thị hàm số bằng GeoGebra, tính toán bằng MTCT, lập bảng tính Excel
- CHÚ Ý: Công thức toán học cần viết dạng LaTeX ($x^2$)`;

    case Subject.TIENG_VIET:
      return `
📚 ĐẶC THÙ MÔN TIẾNG VIỆT (TIỂU HỌC) - HƯỚNG DẪN NLS:
- ƯU TIÊN: Đọc hiểu nội dung số, sáng tạo bài viết đơn giản, giao tiếp an toàn
- NLS PHÙ HỢP: 1.1 (Tìm kiếm thông tin đơn giản), 3.1 (Tạo nội dung cơ bản), 2.2 (Chia sẻ)
- VÍ DỤ: Nghe đọc truyện qua ứng dụng, viết bài trên máy tính, tìm kiếm từ điển trực tuyến
- CHÚ Ý: Phù hợp lứa tuổi tiểu học, thao tác đơn giản, có hướng dẫn`;

    case Subject.NGU_VAN:
      return `
📚 ĐẶC THÙ MÔN NGỮ VĂN - HƯỚNG DẪN NLS:
- ƯU TIÊN: Khai thác thông tin, sáng tạo nội dung, giao tiếp hợp tác
- NLS PHÙ HỢP: 1.1, 1.2 (Tìm kiếm, đánh giá thông tin), 2.2, 2.4 (Chia sẻ, hợp tác), 3.1 (Sáng tạo nội dung)
- VÍ DỤ: Tìm kiếm tài liệu văn học trực tuyến, viết bài trên Google Docs, thảo luận nhóm qua Padlet
- CHÚ Ý: Đánh giá độ tin cậy nguồn tư liệu văn học, tránh thông tin sai lệch`;

    case Subject.DAO_DUC:
      return `
📚 ĐẶC THÙ MÔN ĐẠO ĐỨC (TIỂU HỌC) - HƯỚNG DẪN NLS:
- ƯU TIÊN: Ứng xử văn minh trên mạng, bảo vệ bản thân trên không gian số
- NLS PHÙ HỢP: 2.3 (Công dân số), 4.2 (Bảo vệ dữ liệu cá nhân), 2.5 (Văn hóa mạng)
- VÍ DỤ: Nhận biết thông tin tốt/xấu, không chia sẻ thông tin cá nhân, xin phép khi chụp ảnh người khác
- CHÚ Ý: Nội dung đơn giản, gần gũi đời sống, dùng ví dụ trực quan`;

    case Subject.TN_XH:
      return `
📚 ĐẶC THÙ MÔN TỰ NHIÊN VÀ XÃ HỘI (LỚP 1-3) - HƯỚNG DẪN NLS:
- ƯU TIÊN: Quan sát qua hình ảnh/video, tìm hiểu thiên nhiên qua công cụ số
- NLS PHÙ HỢP: 1.1 (Tìm kiếm thông tin đơn giản), 3.1 (Tạo nội dung đơn giản)
- VÍ DỤ: Xem video về động vật, thực vật, tìm hiểu hiện tượng tự nhiên qua ứng dụng
- CHÚ Ý: Hoạt động trải nghiệm trực tiếp kết hợp công cụ số hỗ trợ`;

    case Subject.KHOA_HOC:
      return `
📚 ĐẶC THÙ MÔN KHOA HỌC (LỚP 4-5) - HƯỚNG DẪN NLS:
- ƯU TIÊN: Tìm kiếm thông tin khoa học, quan sát mô phỏng, thu thập dữ liệu đơn giản
- NLS PHÙ HỢP: 1.1 (Tìm kiếm), 5.2 (Công cụ giải quyết vấn đề), 3.1 (Tạo nội dung)
- VÍ DỤ: Sử dụng phần mềm mô phỏng (PhET đơn giản), vẽ biểu đồ, tra cứu bách khoa trực tuyến
- CHÚ Ý: Phù hợp lứa tuổi, hướng dẫn rõ ràng từng bước`;

    case Subject.KHTN:
      return `
📚 ĐẶC THÙ MÔN KHOA HỌC TỰ NHIÊN (THCS) - HƯỚNG DẪN NLS:
- ƯU TIÊN: Mô phỏng thí nghiệm, thu thập và phân tích dữ liệu, tìm kiếm thông tin khoa học
- NLS PHÙ HỢP: 5.2 (Công cụ giải quyết vấn đề), 1.1, 1.2 (Tìm kiếm, đánh giá dữ liệu), 3.1 (Tạo nội dung)
- VÍ DỤ: Sử dụng PhET mô phỏng thí nghiệm Vật lí/Hóa học/Sinh học, vẽ biểu đồ Excel, tra cứu dữ liệu khoa học
- CHÚ Ý: Tích hợp cả 3 phân môn (Vật lí, Hóa học, Sinh học), xác minh tính chính xác nguồn dữ liệu`;

    case Subject.VAT_LI:
    case Subject.HOA_HOC:
    case Subject.SINH_HOC:
      return `
📚 ĐẶC THÙ MÔN KHTN (${subject}) - HƯỚNG DẪN NLS:
- ƯU TIÊN: Mô phỏng thí nghiệm, thu thập dữ liệu, phân tích kết quả
- NLS PHÙ HỢP: 5.2 (Công cụ giải quyết vấn đề), 1.1, 1.2 (Tìm kiếm, đánh giá dữ liệu), 3.1 (Tạo nội dung)
- VÍ DỤ: Sử dụng phần mềm mô phỏng thí nghiệm (PhET), vẽ biểu đồ bằng Excel, tra cứu dữ liệu khoa học
- CHÚ Ý: Xác minh tính chính xác của dữ liệu khoa học từ các nguồn đáng tin cậy`;

    case Subject.TIENG_ANH:
      return `
📚 ĐẶC THÙ MÔN TIẾNG ANH - HƯỚNG DẪN NLS:
- ƯU TIÊN: Công cụ học ngôn ngữ, giao tiếp trực tuyến, sáng tạo nội dung đa phương tiện
- NLS PHÙ HỢP: 2.1, 2.4 (Tương tác, hợp tác), 1.1 (Tìm kiếm), 3.1 (Sáng tạo nội dung)
- VÍ DỤ: Sử dụng từ điển trực tuyến, luyện phát âm qua app, tạo video bài thuyết trình
- CHÚ Ý: Khuyến khích sử dụng các nền tảng học tiếng Anh (Duolingo, Quizlet, Kahoot)`;

    case Subject.LS_DL_TH:
    case Subject.LS_DL_THCS:
      return `
📚 ĐẶC THÙ MÔN LỊCH SỬ VÀ ĐỊA LÍ - HƯỚNG DẪN NLS:
- ƯU TIÊN: Tìm kiếm tư liệu lịch sử/địa lí, đánh giá nguồn tin, trình bày đa phương tiện
- NLS PHÙ HỢP: 1.1, 1.2 (Tìm kiếm, đánh giá nguồn), 2.2 (Chia sẻ), 3.1 (Sáng tạo nội dung)
- VÍ DỤ: Tra cứu bản đồ trực tuyến (Google Maps/Earth), tìm hiểu tài liệu lịch sử số hóa, thuyết trình bằng PowerPoint
- CHÚ Ý: Đánh giá độ tin cậy của các nguồn tư liệu lịch sử/địa lý`;

    case Subject.LICH_SU:
    case Subject.DIA_LI:
      return `
📚 ĐẶC THÙ MÔN KHXH (${subject}) - HƯỚNG DẪN NLS:
- ƯU TIÊN: Tìm kiếm tư liệu, đánh giá nguồn tin, trình bày đa phương tiện
- NLS PHÙ HỢP: 1.1, 1.2 (Tìm kiếm, đánh giá nguồn), 2.2 (Chia sẻ), 3.1 (Sáng tạo nội dung)
- VÍ DỤ: Tra cứu bản đồ trực tuyến, tìm hiểu tài liệu lịch sử số hóa, thuyết trình bằng PowerPoint
- CHÚ Ý: Đánh giá độ tin cậy của các nguồn tư liệu`;

    case Subject.TIN_HOC:
    case Subject.TIN_CN_TH:
      return `
📚 ĐẶC THÙ MÔN TIN HỌC - HƯỚNG DẪN NLS:
- ƯU TIÊN: Lập trình, an toàn thông tin, giải quyết lỗi kỹ thuật
- NLS PHÙ HỢP: 3.4 (Lập trình), 4.1, 4.2 (An toàn, bảo mật), 5.1 (Giải quyết lỗi), 6.2 (Sử dụng AI)
- VÍ DỤ: Viết code Python/Scratch, thiết lập bảo mật tài khoản, debug chương trình
- CHÚ Ý: Môn này là trọng tâm của NLS, tích hợp tự nhiên vào mọi hoạt động`;

    case Subject.GDCD:
      return `
📚 ĐẶC THÙ MÔN GIÁO DỤC CÔNG DÂN (THCS) - HƯỚNG DẪN NLS:
- ƯU TIÊN: Tham gia công dân số, văn hóa mạng, bảo vệ quyền riêng tư
- NLS PHÙ HỢP: 2.3 (Công dân số), 2.5 (Văn hóa mạng), 4.2 (Bảo vệ dữ liệu), 1.2 (Đánh giá tin giả)
- VÍ DỤ: Nhận diện thông tin sai lệch, ứng xử văn minh trên mạng, bảo vệ thông tin cá nhân
- CHÚ Ý: Giáo dục ý thức công dân số có trách nhiệm`;

    case Subject.GD_KTPL:
      return `
📚 ĐẶC THÙ MÔN GIÁO DỤC KINH TẾ VÀ PHÁP LUẬT (THPT) - HƯỚNG DẪN NLS:
- ƯU TIÊN: Kinh tế số, thương mại điện tử, pháp luật về công nghệ thông tin
- NLS PHÙ HỢP: 2.3 (Công dân số), 4.2 (Bảo vệ dữ liệu), 1.2 (Đánh giá thông tin), 3.3 (Bản quyền số)
- VÍ DỤ: Tìm hiểu quy định pháp luật về TMĐT, bảo vệ quyền lợi người tiêu dùng online, luật an ninh mạng
- CHÚ Ý: Kết hợp kiến thức pháp luật với thực tiễn hoạt động trên không gian số`;

    case Subject.GDQP_AN:
      return `
📚 ĐẶC THÙ MÔN GDQP-AN - HƯỚNG DẪN NLS:
- ƯU TIÊN: An ninh mạng, bảo vệ thông tin quốc phòng, nhận diện thông tin xấu độc
- NLS PHÙ HỢP: 4.1, 4.2 (Bảo vệ thiết bị, dữ liệu), 2.3 (Trách nhiệm công dân), 1.2 (Đánh giá thông tin)
- VÍ DỤ: Nhận diện thông tin xấu độc trên mạng, bảo mật thông tin cá nhân và quốc phòng
- CHÚ Ý: Tích hợp giáo dục an ninh mạng, bảo vệ chủ quyền số quốc gia`;

    case Subject.GD_DIA_PHUONG:
      return `
📚 ĐẶC THÙ MÔN GIÁO DỤC ĐỊA PHƯƠNG - HƯỚNG DẪN NLS:
- ƯU TIÊN: Khai thác thông tin địa phương, sáng tạo nội dung quảng bá văn hóa
- NLS PHÙ HỢP: 1.1 (Tìm kiếm thông tin), 2.2, 2.4 (Chia sẻ, hợp tác), 3.1 (Sáng tạo nội dung)
- VÍ DỤ: Tìm hiểu di sản văn hóa địa phương qua số, tạo video giới thiệu quê hương
- CHÚ Ý: Sử dụng công nghệ số để lưu giữ và quảng bá văn hóa địa phương`;

    case Subject.CONG_NGHE:
      return `
📚 ĐẶC THÙ MÔN CÔNG NGHỆ - HƯỚNG DẪN NLS:
- ƯU TIÊN: Thiết kế kỹ thuật số, mô phỏng quy trình, giải quyết vấn đề công nghệ
- NLS PHÙ HỢP: 5.2 (Xác định giải pháp công nghệ), 3.1 (Sáng tạo nội dung), 5.3 (Sử dụng sáng tạo)
- VÍ DỤ: Vẽ thiết kế bằng phần mềm CAD, mô phỏng quy trình sản xuất
- CHÚ Ý: Kết hợp thực hành với công cụ số để nâng cao hiệu quả`;

    case Subject.GDTC:
      return `
📚 ĐẶC THÙ MÔN GIÁO DỤC THỂ CHẤT - HƯỚNG DẪN NLS:
- ƯU TIÊN: Theo dõi sức khỏe, học kỹ thuật qua video, bảo vệ sức khỏe số
- NLS PHÙ HỢP: 4.3 (Bảo vệ sức khỏe), 1.1 (Tìm kiếm thông tin), 2.2 (Chia sẻ)
- VÍ DỤ: Xem video hướng dẫn kỹ thuật, sử dụng app theo dõi sức khỏe
- CHÚ Ý: Cân bằng thời gian sử dụng thiết bị số và hoạt động thể chất`;

    case Subject.AM_NHAC:
    case Subject.MY_THUAT:
    case Subject.NGHE_THUAT:
      return `
📚 ĐẶC THÙ MÔN NGHỆ THUẬT (${subject}) - HƯỚNG DẪN NLS:
- ƯU TIÊN: Sáng tạo nghệ thuật số, chia sẻ tác phẩm, bản quyền sáng tạo
- NLS PHÙ HỢP: 3.1 (Sáng tạo nội dung), 3.3 (Bản quyền), 2.2 (Chia sẻ)
- VÍ DỤ: Vẽ tranh số, chỉnh sửa ảnh/video, tạo nhạc số, triển lãm trực tuyến
- CHÚ Ý: Giáo dục về bản quyền tác phẩm nghệ thuật`;

    case Subject.HDTN:
      return `
📚 ĐẶC THÙ MÔN HOẠT ĐỘNG TRẢI NGHIỆM - HƯỚNG DẪN NLS:
- ƯU TIÊN: Hợp tác nhóm trực tuyến, quản lý dự án, giao tiếp số
- NLS PHÙ HỢP: 2.4 (Hợp tác), 2.1 (Tương tác), 3.1 (Sáng tạo nội dung), 1.3 (Quản lý dữ liệu)
- VÍ DỤ: Lập kế hoạch dự án trên Trello, họp nhóm qua Google Meet, báo cáo bằng slide
- CHÚ Ý: Phát triển kỹ năng làm việc nhóm và quản lý dự án số`;

    default:
      return `
📚 HƯỚNG DẪN NLS CHUNG:
- Tích hợp các năng lực số phù hợp với nội dung bài học
- Ưu tiên các năng lực: Tìm kiếm thông tin, Sáng tạo nội dung, Hợp tác trực tuyến
- Chú ý bảo vệ an toàn thông tin và văn hóa mạng`;
  }
}
import {
  SYSTEM_INSTRUCTION, NLS_FRAMEWORK_DATA,
  SYSTEM_INSTRUCTION_ENGLISH, NLS_FRAMEWORK_DATA_ENGLISH,
  AI_SYSTEM_INSTRUCTION, AI_EDUCATION_FRAMEWORK_DATA,
  AI_SYSTEM_INSTRUCTION_ENGLISH, AI_EDUCATION_FRAMEWORK_DATA_ENGLISH,
  AI_INTEGRATION_SYSTEM_INSTRUCTION
} from "../constants";

// Define the hierarchy of models for fallback
const MODELS = [
  "gemini-2.5-flash",        // Priority 1: Default - Fast & Good quality
  "gemini-2.0-flash",        // Priority 2: Fallback 1
  "gemini-1.5-flash",        // Priority 3: Fallback 2
  "gemini-1.5-pro"           // Priority 4: Fallback 3
];
type RuleValidationResult = {
  valid: boolean;
  errors: string[];
};

const stripDiacritics = (input: string): string =>
  input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");

const normalizeForCheck = (input: string): string =>
  stripDiacritics(input).toLowerCase();

const extractMarkers = (text: string): string[] => {
  const matches = text.match(/===([^=\n]+)===/g) || [];
  return matches
    .map((m) => m.replace(/===/g, "").trim())
    .filter((m) => m.toUpperCase() !== "END");
};

const normalizeMarker = (marker: string): string =>
  stripDiacritics(marker)
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, "_")
    .replace(/_+/g, "_");

const hasAnyMarkerToken = (markers: string[], tokenList: string[]): boolean => {
  const normalizedMarkers = markers.map(normalizeMarker);
  return tokenList.some((token) =>
    normalizedMarkers.some((marker) => marker.includes(token))
  );
};

const countMarkersByPrefix = (markers: string[], prefixes: string[]): number =>
  markers.filter((marker) => {
    const n = normalizeMarker(marker);
    return prefixes.some((prefix) => n.startsWith(prefix));
  }).length;

const hasAnyKeyword = (text: string, keywords: string[]): boolean => {
  const normalized = normalizeForCheck(text);
  return keywords.some((kw) => normalized.includes(normalizeForCheck(kw)));
};

const hasPpctLikeCode = (text: string): boolean =>
  /(?:^|\s)[1-6]\.\d\s*(?:\.|\s*)?(?:CB1|CB2|TC1|TC2|NC1)\s*[a-z]?(?=$|\s|[;,.])/i.test(text) ||
  /(?:^|\s)[1-6]\.\d(?:CB1|CB2|TC1|TC2|NC1)[a-z]?(?=$|\s|[;,.])/i.test(text);

const isTechSubject = (subject: Subject): boolean =>
  subject === Subject.TIN_HOC ||
  subject === Subject.TIN_CN_TH ||
  subject === Subject.CONG_NGHE;

const validateNLSOutput = (
  output: string,
  info: LessonInfo,
  options: ProcessingOptions
): RuleValidationResult => {
  if (options.analyzeOnly) {
    return { valid: true, errors: [] };
  }

  const errors: string[] = [];
  const markers = extractMarkers(output);
  const nlsSectionCount = countMarkersByPrefix(markers, ["NLS_", "DC_"]);

  if (nlsSectionCount < 7) {
    errors.push("Missing minimum integration sections (need at least 7 total sections).");
  }

  const hasObjectiveMarker = hasAnyMarkerToken(markers, ["NLS_MUC_TIEU", "DC_OBJECTIVES"]);
  if (!hasObjectiveMarker) {
    errors.push("Missing required objective marker (NLS_MUC_TIEU or DC_OBJECTIVES).");
  }

  if (info.distributionContent && info.distributionContent.trim().length > 0) {
    const n = normalizeForCheck(output);
    const hasPpctClause = n.includes("khong co (theo ppct)");
    const hasCode = hasPpctLikeCode(output);
    if (!hasPpctClause && !hasCode) {
      errors.push("PPCT is provided but output does not clearly reflect extracted PPCT competencies.");
    }
  }

  if (info.grade <= 5) {
    const tooAdvanced = ["python", "machine learning", "deep learning", "huan luyen mo hinh", "thuat toan phuc tap", "lap trinh ai"];
    if (hasAnyKeyword(output, tooAdvanced)) {
      errors.push("Content is too advanced for grades 1-5.");
    }
  }

  return { valid: errors.length === 0, errors };
};

const validateAIOutput = (
  output: string,
  info: LessonInfo,
  options: ProcessingOptions,
  isEnglishSubject: boolean
): RuleValidationResult => {
  if (options.analyzeOnly) {
    return { valid: true, errors: [] };
  }

  const errors: string[] = [];
  const markers = extractMarkers(output);
  const aiSectionCount = countMarkersByPrefix(markers, ["AI_"]);

  if (isEnglishSubject) {
    if (aiSectionCount < 6) {
      errors.push("Missing minimum AI sections for English output (need at least 6).");
    }
    if (!hasAnyMarkerToken(markers, ["AI_OBJECTIVES"])) {
      errors.push("Missing AI_OBJECTIVES marker.");
    }
  } else {
    if (aiSectionCount < 10) {
      errors.push("Missing minimum AI sections for Vietnamese output (need required core markers + activity markers).");
    }
    if (!hasAnyMarkerToken(markers, ["AI_MUC_TIEU"])) errors.push("Missing AI_MUC_TIEU marker.");
    if (!hasAnyMarkerToken(markers, ["AI_NOI_DUNG_GDAI"])) errors.push("Missing AI_NOI_DUNG_GDAI marker.");
    if (!hasAnyMarkerToken(markers, ["AI_THIET_BI"])) errors.push("Missing AI_THIET_BI marker.");
    if (!hasAnyMarkerToken(markers, ["AI_VAN_DUNG"])) errors.push("Missing AI_VAN_DUNG marker.");
    if (!hasAnyMarkerToken(markers, ["AI_DANH_GIA"])) errors.push("Missing AI_DANH_GIA marker.");
  }

  const normalizedOutput = normalizeForCheck(output);
  const hasAIEthics = normalizedOutput.includes("dao duc ai") || normalizedOutput.includes("ai ethics");
  if (!hasAIEthics) {
    errors.push("Missing AI ethics content.");
  }

  if (info.grade <= 5) {
    const tooAdvanced = ["python", "machine learning", "deep learning", "huan luyen mo hinh", "xay dung he thong ai"];
    if (hasAnyKeyword(output, tooAdvanced)) {
      errors.push("AI content is too advanced for grades 1-5.");
    }
  }

  if (!isTechSubject(info.subject) && info.grade <= 9) {
    const heavyTechnical = ["xay dung mo hinh ai", "huan luyen model", "toi uu tham so", "lap trinh mo hinh", "neural network"];
    if (hasAnyKeyword(output, heavyTechnical)) {
      errors.push("AI technical depth is not suitable for this subject/grade combination.");
    }
  }

  return { valid: errors.length === 0, errors };
};

const autoRepairOutput = async (
  ai: GoogleGenAI,
  modelId: string,
  systemInstruction: string,
  originalPrompt: string,
  draftOutput: string,
  errors: string[]
): Promise<string | null> => {
  const numberedErrors = errors.map((e, idx) => `${idx + 1}. ${e}`).join("\n");
  const repairPrompt = [
    "You are a strict lesson-plan quality gate.",
    "Task: repair the draft so it fully satisfies all validation rules while preserving the source structure.",
    "Required fixes:",
    numberedErrors,
    "Hard constraints:",
    "- Return full revised lesson plan only.",
    "- Keep marker syntax required by the mode.",
    "- No JSON output.",
    "Original prompt context:",
    originalPrompt,
    "Draft to repair:",
    draftOutput,
  ].join("\n\n");

  try {
    const repaired = await ai.models.generateContent({
      model: modelId,
      config: {
        systemInstruction,
        temperature: 0.1,
      },
      contents: repairPrompt,
    });
    return repaired.text || null;
  } catch {
    return null;
  }
};

export const generateNLSLessonPlan = async (
  info: LessonInfo,
  options: ProcessingOptions
): Promise<string> => {

  // Initialize inside function to avoid top-level execution issues
  const apiKey = options.apiKey;
  if (!apiKey) {
    throw new Error("Missing API_KEY. Vui lòng nhập API Key của bạn trong phần Cấu hình API Key.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  let distributionContext = "";
  if (info.distributionContent && info.distributionContent.trim().length > 0) {
    distributionContext = `
      =========================================================
      🚨 QUY TẮC TỐI THƯỢNG (KHI CÓ PPCT - STRICT MODE):
      Người dùng ĐÃ CUNG CẤP nội dung Phân phối chương trình (PPCT).
      Đây là văn bản pháp quy, bạn phải tuân thủ TUYỆT ĐỐI các yêu cầu sau:

      BƯỚC 1: Đọc tên bài học trong "NỘI DUNG GIÁO ÁN GỐC".
      BƯỚC 2: Tìm ĐÚNG HÀNG của bài học đó trong bảng PPCT.
      BƯỚC 3: Trích xuất NGUYÊN VĂN, CHÍNH XÁC nội dung từ cột "Năng lực số phát triển" (hoặc "YCCĐ năng lực số", "Năng lực số") của hàng đó.
      BƯỚC 4: Đưa nội dung trích xuất vào phần Mục tiêu Năng lực số - GIỮ NGUYÊN MÃ SỐ VÀ NỘI DUNG.

      📋 VÍ DỤ TRÍCH XUẤT ĐÚNG:
      Nếu trong PPCT có:
      | Bài 17 | ... | 1.1NC1a: Tìm kiếm thông tin, quy tắc. 3.4NC1a: Sử dụng MTCT để giải |
      
      Thì phần Mục tiêu phải ghi NGUYÊN VĂN:
      <red>4. Năng lực số (Nội dung trích xuất nguyên văn từ PPCT):</red>
      <red>- 1.1NC1a: Tìm kiếm thông tin, quy tắc.</red>
      <red>- 3.4NC1a: Sử dụng MTCT để giải.</red>
      
      ⛔️ CÁC ĐIỀU CẤM (STRICTLY PROHIBITED):
      - CẤM TUYỆT ĐỐI việc tự ý thêm bất kỳ năng lực số nào khác không có trong PPCT của bài học này.
      - CẤM thay đổi mã số hay nội dung. VD: 1.1NC1a phải giữ nguyên, không đổi thành 1.1CB1a.
      - CẤM dùng Khung năng lực số tham chiếu để bịa thêm mục tiêu. CHỈ dùng những gì PPCT ghi.
      - Nếu cột năng lực số trong PPCT để trống, thì mục tiêu NLS ghi là: "Không có (theo PPCT)".

      NỘI DUNG PPCT:
      ${info.distributionContent}
      =========================================================
      `;
  }

  // Determine if the subject is English to use English instructions
  const isEnglishSubject = info.subject === Subject.TIENG_ANH;

  // Select appropriate framework and instructions based on subject
  const frameworkData = isEnglishSubject ? NLS_FRAMEWORK_DATA_ENGLISH : NLS_FRAMEWORK_DATA;
  const systemInstruction = isEnglishSubject ? SYSTEM_INSTRUCTION_ENGLISH : SYSTEM_INSTRUCTION;

  // Lấy hướng dẫn mức độ NLS theo cấp lớp
  const gradeLevelGuidance = getGradeLevelGuidance(info.grade);

  // Lấy hướng dẫn đặc thù môn học
  const subjectGuidance = getSubjectGuidance(info.subject);

  // User prompt - use English for English subject, Vietnamese for others
  const userPrompt = isEnglishSubject ? `
    DIGITAL COMPETENCE FRAMEWORK REFERENCE DATA (Only use when NO PPCT file is provided or to understand competence codes in PPCT):
    ${frameworkData}

    LESSON PLAN INPUT INFORMATION:
    - Subject: ${info.subject}
    - Grade: ${info.grade}
    ${gradeLevelGuidance}
    ${subjectGuidance}
    
    ${distributionContext}

    PROCESSING REQUIREMENTS:
    ${options.analyzeOnly ? "- Analyze only, do not edit in detail." : "- Edit the lesson plan and INTEGRATE DIGITAL COMPETENCE into teaching activities."}
    ${options.detailedReport ? "- Include a detailed explanation table of selected competence codes at the end." : ""}
    
    FORMAT REQUIREMENTS (MANDATORY):
    1. PRESERVE ORIGINAL FORMATTING: You must keep bold (**text**), italic (*text*) formatting from the original text.
    2. TABLES: Use standard Markdown Table.
    3. DC ADDITIONS: Use <red>...</red> tags to mark digital competence content in red.
    
    NOTE ON ACTIVITY INTEGRATION (WHEN PPCT IS PROVIDED):
    - Teaching activities (in the Procedure section) should only be designed around digital competencies extracted from PPCT. Do not design activities for competencies outside PPCT.
    
    OUTPUT FORMAT:
    - Return the entire edited lesson plan content in Markdown format.
    
    ORIGINAL LESSON PLAN CONTENT:
    ${info.content}
  ` : `
    DỮ LIỆU THAM CHIẾU KHUNG NĂNG LỰC SỐ (Chỉ sử dụng khi KHÔNG CÓ file PPCT hoặc để hiểu rõ mã năng lực trong PPCT):
    ${frameworkData}

    THÔNG TIN GIÁO ÁN ĐẦU VÀO:
    - Môn học: ${info.subject}
    - Khối lớp: ${info.grade}
    ${gradeLevelGuidance}
    ${subjectGuidance}
    
    ${distributionContext}

    YÊU CẦU XỬ LÝ NỘI DUNG:
    ${options.analyzeOnly ? "- Chỉ phân tích, không chỉnh sửa chi tiết." : "- Chỉnh sửa giáo án và TÍCH HỢP NĂNG LỰC SỐ vào các hoạt động dạy học."}
    ${options.detailedReport ? "- Kèm theo bảng giải thích chi tiết mã năng lực đã chọn ở cuối bài." : ""}
    
    YÊU CẦU VỀ ĐỊNH DẠNG (BẮT BUỘC):
    1. GIỮ NGUYÊN ĐỊNH DẠNG GỐC: Bạn phải giữ nguyên các đoạn in đậm (**text**), in nghiêng (*text*) của văn bản gốc. Không được làm mất định dạng này.
    2. TOÁN HỌC: Tất cả công thức toán phải viết dạng LaTeX trong dấu $. Ví dụ: $x^2$. Không dùng unicode.
    3. BẢNG: Sử dụng Markdown Table chuẩn.
    4. NLS BỔ SUNG: Dùng thẻ <u>...</u> để gạch chân nội dung bạn thêm vào.
    
    LƯU Ý VỀ TÍCH HỢP HOẠT ĐỘNG (KHI CÓ PPCT):
    - Các hoạt động dạy học (trong phần Tiến trình) cũng chỉ được thiết kế xoay quanh các năng lực số đã trích xuất từ PPCT. Không thiết kế hoạt động cho các năng lực nằm ngoài PPCT.
    
    ĐỊNH DẠNG ĐẦU RA:
    - Trả về toàn bộ nội dung giáo án đã chỉnh sửa dưới dạng Markdown.
    
    NỘI DUNG GIÁO ÁN GỐC:
    ${info.content}
  `;

  // Fallback Logic: Try each model in sequence
  let lastError = null;

  for (let i = 0; i < MODELS.length; i++) {
    const currentModelId = MODELS[i];
    console.log(`Attempting generation with model: ${currentModelId}...`);

    try {
      const response = await ai.models.generateContent({
        model: currentModelId,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.1, // Low temperature for strict instruction adherence
        },
        contents: userPrompt,
      });

      const text = response.text;
      if (!text) {
        throw new Error("API returned empty response.");
      }

      const validation = validateNLSOutput(text, info, options);
      if (validation.valid) {
        return text;
      }

      const repairedText = await autoRepairOutput(
        ai,
        currentModelId,
        systemInstruction,
        userPrompt,
        text,
        validation.errors
      );

      if (repairedText) {
        const repairedValidation = validateNLSOutput(repairedText, info, options);
        if (repairedValidation.valid) {
          return repairedText;
        }
        throw new Error(`Rule Engine failed after auto-repair: ${repairedValidation.errors.join(" | ")}`);
      }

      throw new Error(`Rule Engine failed: ${validation.errors.join(" | ")}`);

    } catch (error: any) {
      console.error(`Error with model ${currentModelId}:`, error);

      // Extract detailed error message
      let errorMessage = error.message || "";

      // Try parsing JSON error message if applicable
      if (typeof errorMessage === 'string' && errorMessage.trim().startsWith('{')) {
        try {
          const errorObj = JSON.parse(errorMessage);
          if (errorObj.error && errorObj.error.message) {
            errorMessage = errorObj.error.message;
          }
        } catch (e) { /* ignore parse error */ }
      }

      // Update error with cleaner message
      error.message = errorMessage;
      lastError = error;

      // Check if we should retry with next model
      const isRetryable =
        errorMessage.includes("503") ||
        errorMessage.toLowerCase().includes("overloaded") ||
        errorMessage.includes("UNAVAILABLE") ||
        errorMessage.includes("429"); // Also retry on rate limits if we have other models

      if (isRetryable && i < MODELS.length - 1) {
        console.warn(`Model ${currentModelId} failed/overloaded. Switching to fallback model...`);
        continue; // Try next model
      } else if (i < MODELS.length - 1) {
        // Even for non-standard retryable errors, if it's a model-specific issue (like 404 Not Found for model), we should try next.
        // But for API Key issues (403), we should stop.
        if (errorMessage.includes("403") || errorMessage.includes("API key not valid") || errorMessage.toLowerCase().includes("quota")) {
          throw new Error("API Key KHÔNG HỢP LỆ hoặc HẾT HẠN MỨC (Quota Exceeded).\n\nCách xử lý:\n1. Dùng tài khoản Google khác để tạo API Key mới tại Google AI Studio.\n2. Kiểm tra lại dự án Google Cloud của bạn xem có bị giới hạn không.");
        }
        // For other errors, we might casually try the next model just in case, 
        // but let's stick to the rule: "If model fails -> switch".
        console.warn(`Model ${currentModelId} encountered error. Switching to fallback model...`);
        continue;
      }
    }
  }

  // If all models failed
  if (lastError) {
    const errorMsg = typeof lastError.message === 'string' ? lastError.message.toLowerCase() : "";
    if (errorMsg.includes("quota") || errorMsg.includes("429")) {
      throw new Error("API Key ĐÃ HẾT HẠN MỨC SỬ DỤNG (Quota Exceeded) hoặc quá tải lượt gọi.\n\nCách giải quyết:\n1. Sang tab 'Cài đặt' để nhập API Key của một tài khoản Google (Gmail) KHÁC.\n2. Lấy API Key mới miễn phí tại: https://aistudio.google.com/app/apikey");
    }
    if (errorMsg.includes("403") || errorMsg.includes("api key not valid")) {
      throw new Error("API Key không hợp lệ. Vui lòng cấu hình API Key khác.");
    }
    throw lastError; // Throw the last error encountered (likely contains the specific code like 429)
  }

  throw new Error("Tất cả các model đều thất bại. Vui lòng thử lại sau.");
};

// ===================== AI EDUCATION (QĐ 3439) =====================

// Hàm xác định mức độ tích hợp AI phù hợp theo cấp lớp
function getAIGradeLevelGuidance(grade: number): string {
  if (grade >= 1 && grade <= 5) {
    return `
  🤖 MỨC ĐỘ GIÁO DỤC AI PHÙ HỢP VỚI LỚP ${grade} (CẤP TIỂU HỌC):
  - Trải nghiệm các ứng dụng AI đơn giản, trực quan (nhận diện giọng nói, hình ảnh)
  - Nhận biết AI trong đời sống hàng ngày (trợ lý ảo, gợi ý video, bộ lọc ảnh)
  - Học bảo vệ dữ liệu cá nhân, tôn trọng bản quyền
  - Tham gia hoạt động mô phỏng AI qua trò chơi (unplugged activities)
  - TRÁNH: Lập trình phức tạp, khái niệm thuật toán trừu tượng
  - ƯU TIÊN: Quan sát, trải nghiệm, thảo luận đơn giản về vai trò AI`;
  } else if (grade >= 6 && grade <= 9) {
    return `
  🤖 MỨC ĐỘ GIÁO DỤC AI PHÙ HỢP VỚI LỚP ${grade} (CẤP THCS):
  - Sử dụng công cụ AI để tạo sản phẩm số (viết bài, tạo hình, dịch ngôn ngữ)
  - Hiểu nguyên lý hoạt động cơ bản của AI (dữ liệu → huấn luyện → dự đoán)
  - Nhận biết thiên vị AI, trách nhiệm công dân số
  - Thiết kế chatbot đơn giản, huấn luyện mô hình AI cơ bản (Teachable Machine)
  - CÓ THỂ: Giới thiệu khái niệm Machine Learning qua ví dụ trực quan
  - ƯU TIÊN: Sử dụng công cụ AI có sẵn, đánh giá kết quả AI`;
  } else {
    return `
  🤖 MỨC ĐỘ GIÁO DỤC AI PHÙ HỢP VỚI LỚP ${grade} (CẤP THPT):
  - Áp dụng kỹ thuật AI vào dự án học tập (NLP, Computer Vision cơ bản)
  - Thiết kế, cải tiến công cụ AI đơn giản
  - Phân tích vấn đề đạo đức AI phức tạp, đề xuất giải pháp
  - Phát triển dự án AI hoàn chỉnh, nghiên cứu khoa học
  - Liên kết kỹ năng AI với nghề nghiệp tương lai
  - KHUYẾN KHÍCH: Tư duy phản biện, sáng tạo, đổi mới với AI`;
  }
}

// Hàm phân tích đặc thù môn học và đưa ra hướng dẫn AI phù hợp
function getAISubjectGuidance(subject: Subject): string {
  switch (subject) {
    case Subject.TOAN:
      return `
📚 ĐẶC THÙ MÔN TOÁN - HƯỚNG DẪN TÍCH HỢP AI:
- ƯU TIÊN: AI phân tích dữ liệu, dự đoán xu hướng, vẽ đồ thị tự động
- MIỀN AI PHÙ HỢP: Kỹ thuật AI (dữ liệu, thuật toán), Thiết kế hệ thống AI
- VÍ DỤ: Dùng AI phân tích dữ liệu thống kê, ChatGPT giải thích bài toán, AI vẽ đồ thị hàm số
- CHÚ Ý: Kết hợp AI với MTCT, GeoGebra; so sánh kết quả AI và tính toán truyền thống`;

    case Subject.TIENG_VIET:
      return `
📚 ĐẶC THÙ MÔN TIẾNG VIỆT (TIỂU HỌC) - HƯỚNG DẪN TÍCH HỢP AI:
- ƯU TIÊN: AI đọc truyện, nhận diện chữ viết, hỗ trợ học phát âm
- MIỀN AI PHÙ HỢP: Tư duy con người là trung tâm (nhận biết AI), Kỹ thuật AI (NLP đơn giản)
- VÍ DỤ: AI đọc truyện (Text-to-Speech), nhận diện chữ viết tay, AI gợi ý từ vựng
- CHÚ Ý: Phù hợp lứa tuổi, thao tác đơn giản, trải nghiệm AI là chính`;

    case Subject.NGU_VAN:
      return `
📚 ĐẶC THÙ MÔN NGỮ VĂN - HƯỚNG DẪN TÍCH HỢP AI:
- ƯU TIÊN: AI xử lý ngôn ngữ tự nhiên, sáng tạo viết, phân tích văn bản
- MIỀN AI PHÙ HỢP: Kỹ thuật AI (NLP), Đạo đức AI (bản quyền nội dung)
- VÍ DỤ: Dùng AI hỗ trợ viết bài văn sáng tạo, phân tích phong cách tác giả, so sánh bản dịch AI
- CHÚ Ý: Thảo luận về bản quyền nội dung AI tạo ra, nhận biết văn bản do AI viết`;

    case Subject.DAO_DUC:
      return `
📚 ĐẶC THÙ MÔN ĐẠO ĐỨC (TIỂU HỌC) - HƯỚNG DẪN TÍCH HỢP AI:
- ƯU TIÊN: Nhận biết AI trong đời sống, ứng xử an toàn với công nghệ AI
- MIỀN AI PHÙ HỢP: Đạo đức AI (nhận biết cơ bản), Tư duy con người là trung tâm
- VÍ DỤ: Thảo luận AI tốt/xấu, hỏi trợ lý ảo có phải người thật không, bảo vệ thông tin cá nhân
- CHÚ Ý: Nội dung cực đơn giản, ví dụ trực quan, phù hợp tiểu học`;

    case Subject.TN_XH:
      return `
📚 ĐẶC THÙ MÔN TỰ NHIÊN VÀ XÃ HỘI (LỚP 1-3) - HƯỚNG DẪN TÍCH HỢP AI:
- ƯU TIÊN: AI nhận diện hình ảnh động/thực vật, trò chơi AI đơn giản
- MIỀN AI PHÙ HỢP: Tư duy con người là trung tâm, Kỹ thuật AI (nhận diện hình ảnh)
- VÍ DỤ: Dùng AI nhận diện loài cây/con vật từ ảnh chụp, trò chơi phân loại với AI
- CHÚ Ý: Trải nghiệm trực tiếp, hoạt động vui nhộn, không yêu cầu lý thuyết`;

    case Subject.KHOA_HOC:
      return `
📚 ĐẶC THÙ MÔN KHOA HỌC (LỚP 4-5) - HƯỚNG DẪN TÍCH HỢP AI:
- ƯU TIÊN: AI hỗ trợ khám phá khoa học, nhận diện hình ảnh, phân loại dữ liệu đơn giản
- MIỀN AI PHÙ HỢP: Kỹ thuật AI (dữ liệu, nhận diện), Tư duy con người là trung tâm
- VÍ DỤ: AI nhận diện mẫu sinh vật, phần mềm mô phỏng khoa học đơn giản, chatbot hỏi đáp khoa học
- CHÚ Ý: Phù hợp lứa tuổi, kết hợp thực hành thí nghiệm với công cụ AI`;

    case Subject.KHTN:
      return `
📚 ĐẶC THÙ MÔN KHOA HỌC TỰ NHIÊN (THCS) - HƯỚNG DẪN TÍCH HỢP AI:
- ƯU TIÊN: AI mô phỏng thí nghiệm, phân tích dữ liệu, dự đoán kết quả, nhận diện mẫu vật
- MIỀN AI PHÙ HỢP: Kỹ thuật AI (phân tích dữ liệu, Computer Vision), Tư duy con người là trung tâm
- VÍ DỤ: AI dự đoán kết quả thí nghiệm, phân tích ảnh hiển vi, Teachable Machine phân loại mẫu vật
- CHÚ Ý: Tích hợp cả 3 phân môn (Vật lí, Hóa học, Sinh học), so sánh kết quả AI và thực nghiệm`;

    case Subject.VAT_LI:
    case Subject.HOA_HOC:
    case Subject.SINH_HOC:
      return `
📚 ĐẶC THÙ MÔN KHTN (${subject}) - HƯỚNG DẪN TÍCH HỢP AI:
- ƯU TIÊN: AI mô phỏng thí nghiệm, phân tích dữ liệu khoa học, dự đoán kết quả
- MIỀN AI PHÙ HỢP: Kỹ thuật AI (phân tích dữ liệu), Tư duy con người là trung tâm
- VÍ DỤ: AI dự đoán kết quả thí nghiệm, phân tích ảnh hiển vi, nhận diện loài sinh vật
- CHÚ Ý: So sánh dự đoán AI với kết quả thực nghiệm, đánh giá độ tin cậy AI`;

    case Subject.TIENG_ANH:
      return `
📚 ĐẶC THÙ MÔN TIẾNG ANH - HƯỚNG DẪN TÍCH HỢP AI:
- ƯU TIÊN: AI dịch thuật, luyện phát âm, tạo bài tập ngữ pháp, chatbot hội thoại
- MIỀN AI PHÙ HỢP: Kỹ thuật AI (NLP, Speech-to-Text), Đạo đức AI
- VÍ DỤ: Dùng AI chatbot luyện hội thoại, AI chấm bài viết, AI phân tích ngữ pháp
- CHÚ Ý: Đánh giá chất lượng dịch AI, không phụ thuộc hoàn toàn vào AI`;

    case Subject.LS_DL_TH:
    case Subject.LS_DL_THCS:
      return `
📚 ĐẶC THÙ MÔN LỊCH SỬ VÀ ĐỊA LÍ - HƯỚNG DẪN TÍCH HỢP AI:
- ƯU TIÊN: AI phân tích tư liệu, nhận diện bản đồ, tổng hợp sự kiện
- MIỀN AI PHÙ HỢP: Tư duy con người là trung tâm, Đạo đức AI
- VÍ DỤ: AI phân tích bản đồ vệ tinh, tổng hợp tài liệu lịch sử, chatbot thảo luận sự kiện
- CHÚ Ý: Đánh giá độ thiên vị của AI khi phân tích sự kiện lịch sử`;

    case Subject.LICH_SU:
    case Subject.DIA_LI:
      return `
📚 ĐẶC THÙ MÔN KHXH (${subject}) - HƯỚNG DẪN TÍCH HỢP AI:
- ƯU TIÊN: AI phân tích tài liệu lịch sử, dự đoán xu hướng, nhận diện hình ảnh
- MIỀN AI PHÙ HỢP: Tư duy con người là trung tâm, Đạo đức AI
- VÍ DỤ: AI phân tích bản đồ vệ tinh, tổng hợp tài liệu lịch sử, chatbot thảo luận sự kiện
- CHÚ Ý: Đánh giá độ thiên vị của AI khi phân tích sự kiện lịch sử`;

    case Subject.TIN_HOC:
    case Subject.TIN_CN_TH:
      return `
📚 ĐẶC THÙ MÔN TIN HỌC - HƯỚNG DẪN TÍCH HỢP AI:
- ƯU TIÊN: Lập trình AI, huấn luyện mô hình, thiết kế hệ thống AI
- MIỀN AI PHÙ HỢP: Kỹ thuật AI (toàn diện), Thiết kế hệ thống AI
- VÍ DỤ: Lập trình chatbot, huấn luyện model với Teachable Machine, tạo app AI đơn giản
- CHÚ Ý: Đây là môn trọng tâm cho giáo dục AI, tích hợp tự nhiên vào mọi hoạt động`;

    case Subject.GDCD:
      return `
📚 ĐẶC THÙ MÔN GIÁO DỤC CÔNG DÂN (THCS) - HƯỚNG DẪN TÍCH HỢP AI:
- ƯU TIÊN: Đạo đức AI, trách nhiệm công dân số, quyền riêng tư
- MIỀN AI PHÙ HỢP: Đạo đức AI (trọng tâm), Tư duy con người là trung tâm
- VÍ DỤ: Phân tích tình huống đạo đức AI, thảo luận thiên vị thuật toán, bảo vệ dữ liệu cá nhân
- CHÚ Ý: Giáo dục ý thức sử dụng AI có trách nhiệm, không lạm dụng AI`;

    case Subject.GD_KTPL:
      return `
📚 ĐẶC THÙ MÔN GIÁO DỤC KINH TẾ VÀ PHÁP LUẬT (THPT) - HƯỚNG DẪN TÍCH HỢP AI:
- ƯU TIÊN: AI trong kinh tế số, pháp luật về AI, quyền sở hữu trí tuệ AI
- MIỀN AI PHÙ HỢP: Đạo đức AI, Tư duy con người là trung tâm
- VÍ DỤ: Phân tích tác động AI lên thị trường lao động, pháp luật về dữ liệu cá nhân, bản quyền sản phẩm AI
- CHÚ Ý: Kết hợp kiến thức kinh tế-pháp luật với thực tiễn phát triển AI`;

    case Subject.CONG_NGHE:
      return `
📚 ĐẶC THÙ MÔN CÔNG NGHỆ - HƯỚNG DẪN TÍCH HỢP AI:
- ƯU TIÊN: AI trong sản xuất, IoT và AI, thiết kế sản phẩm thông minh
- MIỀN AI PHÙ HỢP: Kỹ thuật AI, Thiết kế hệ thống AI
- VÍ DỤ: AI điều khiển robot, hệ thống nhà thông minh, AI tối ưu quy trình
- CHÚ Ý: Kết hợp AI với công cụ thiết kế kỹ thuật số`;

    case Subject.GDQP_AN:
      return `
📚 ĐẶC THÙ MÔN GDQP-AN - HƯỚNG DẪN TÍCH HỢP AI:
- ƯU TIÊN: AI trong an ninh mạng, nhận diện deepfake, bảo vệ thông tin quốc phòng
- MIỀN AI PHÙ HỢP: Đạo đức AI, Kỹ thuật AI (an ninh mạng)
- VÍ DỤ: AI nhận diện video/ảnh giả, phòng chống tấn công mạng bằng AI, AI phân tích thông tin
- CHÚ Ý: Bảo vệ chủ quyền số quốc gia, nhận diện thông tin xuyên tạc qua AI`;

    case Subject.GDTC:
      return `
📚 ĐẶC THÙ MÔN GIÁO DỤC THỂ CHẤT - HƯỚNG DẪN TÍCH HỢP AI:
- ƯU TIÊN: AI theo dõi sức khỏe, phân tích động tác thể thao, lập kế hoạch tập luyện
- MIỀN AI PHÙ HỢP: Kỹ thuật AI (Computer Vision, dữ liệu sức khỏe)
- VÍ DỤ: AI phân tích tư thế tập luyện, app AI theo dõi sức khỏe, AI lập kế hoạch dinh dưỡng
- CHÚ Ý: Cân bằng sử dụng công nghệ và hoạt động thể chất`;

    case Subject.AM_NHAC:
    case Subject.MY_THUAT:
    case Subject.NGHE_THUAT:
      return `
📚 ĐẶC THÙ MÔN NGHỆ THUẬT (${subject}) - HƯỚNG DẪN TÍCH HỢP AI:
- ƯU TIÊN: AI sáng tạo nghệ thuật, tạo nhạc/hình ảnh, đạo đức sáng tạo AI
- MIỀN AI PHÙ HỢP: Kỹ thuật AI (Generative AI), Đạo đức AI (bản quyền)
- VÍ DỤ: AI tạo hình ảnh (DALL-E, Midjourney), AI sáng tác nhạc, AI hỗ trợ thiết kế
- CHÚ Ý: Thảo luận bản quyền nghệ thuật AI, vai trò con người trong sáng tạo`;

    case Subject.HDTN:
      return `
📚 ĐẶC THÙ MÔN HOẠT ĐỘNG TRẢI NGHIỆM - HƯỚNG DẪN TÍCH HỢP AI:
- ƯU TIÊN: Dự án AI thực tế, trải nghiệm ứng dụng AI, hợp tác nhóm với AI
- MIỀN AI PHÙ HỢP: Thiết kế hệ thống AI, Tư duy con người là trung tâm
- VÍ DỤ: Dự án nhóm phát triển sản phẩm AI đơn giản, cuộc thi ý tưởng AI, trải nghiệm nghề AI
- CHÚ Ý: Kết hợp trải nghiệm thực tế với công nghệ AI`;

    case Subject.GD_DIA_PHUONG:
      return `
📚 ĐẶC THÙ MÔN GIÁO DỤC ĐỊA PHƯƠNG - HƯỚNG DẪN TÍCH HỢP AI:
- ƯU TIÊN: AI phân tích dữ liệu địa phương, nhận diện di sản, chatbot giới thiệu văn hóa
- MIỀN AI PHÙ HỢP: Kỹ thuật AI, Tư duy con người là trung tâm
- VÍ DỤ: AI nhận diện di tích lịch sử từ ảnh, chatbot giới thiệu văn hóa địa phương
- CHÚ Ý: Kết hợp AI với bảo tồn và phát triển giá trị địa phương`;

    default:
      return `
📚 HƯỚNG DẪN TÍCH HỢP AI CHUNG:
- Tích hợp các nội dung giáo dục AI phù hợp với nội dung bài học
- Ưu tiên: Sử dụng công cụ AI, Đạo đức AI, Tư duy con người là trung tâm
- Chú ý nội dung phải THỰC TẾ, KHẢ THI trong điều kiện dạy học`;
  }
}

export const generateAILessonPlan = async (
  info: LessonInfo,
  options: ProcessingOptions
): Promise<string> => {

  const apiKey = options.apiKey;
  if (!apiKey) {
    throw new Error("Missing API_KEY. Vui lòng nhập API Key của bạn trong phần Cấu hình API Key.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  // Determine if the subject is English
  const isEnglishSubject = info.subject === Subject.TIENG_ANH;

  // Select appropriate framework and instructions
  const frameworkData = isEnglishSubject ? AI_EDUCATION_FRAMEWORK_DATA_ENGLISH : AI_EDUCATION_FRAMEWORK_DATA;
  const systemInstruction = isEnglishSubject ? AI_SYSTEM_INSTRUCTION_ENGLISH : AI_SYSTEM_INSTRUCTION;

  // Hướng dẫn mức độ AI theo cấp lớp
  const gradeLevelGuidance = getAIGradeLevelGuidance(info.grade);

  // Hướng dẫn đặc thù môn học
  const subjectGuidance = getAISubjectGuidance(info.subject);

  const userPrompt = isEnglishSubject ? `
    AI EDUCATION FRAMEWORK REFERENCE DATA (Decision 3439/QĐ-BGDĐT):
    ${frameworkData}

    LESSON PLAN INPUT INFORMATION:
    - Subject: ${info.subject}
    - Grade: ${info.grade}
    ${gradeLevelGuidance}
    ${subjectGuidance}

    PROCESSING REQUIREMENTS:
    ${options.analyzeOnly ? "- Analyze only, do not edit in detail." : "- Edit the lesson plan and INTEGRATE AI EDUCATION into teaching activities."}
    ${options.detailedReport ? "- Include a detailed explanation table of AI competency domains addressed at the end." : ""}
    
    FORMAT REQUIREMENTS (MANDATORY):
    1. PRESERVE ORIGINAL FORMATTING.
    2. TABLES: Use standard Markdown Table.
    3. AI ADDITIONS: Use <blue>...</blue> tags to mark AI education content in blue.
    
    OUTPUT FORMAT:
    - Return the entire edited lesson plan content in Markdown format.
    
    ORIGINAL LESSON PLAN CONTENT:
    ${info.content}
  ` : `
    DỮ LIỆU THAM CHIẾU KHUNG GIÁO DỤC AI (QĐ 3439/QĐ-BGDĐT):
    ${frameworkData}

    THÔNG TIN GIÁO ÁN ĐẦU VÀO:
    - Môn học: ${info.subject}
    - Khối lớp: ${info.grade}
    ${gradeLevelGuidance}
    ${subjectGuidance}

    YÊU CẦU XỬ LÝ NỘI DUNG:
    ${options.analyzeOnly ? "- Chỉ phân tích, không chỉnh sửa chi tiết." : "- Chỉnh sửa giáo án và TÍCH HỢP GIÁO DỤC AI vào các hoạt động dạy học."}
    ${options.detailedReport ? "- Kèm theo bảng giải thích chi tiết các miền năng lực AI đã tích hợp ở cuối bài." : ""}
    
    YÊU CẦU VỀ ĐỊNH DẠNG (BẮT BUỘC):
    1. GIỮ NGUYÊN ĐỊNH DẠNG GỐC.
    2. TOÁN HỌC: Tất cả công thức toán phải viết dạng LaTeX trong dấu $. 
    3. BẢNG: Sử dụng Markdown Table chuẩn.
    4. AI BỔ SUNG: Dùng thẻ <blue>...</blue> để đánh dấu nội dung AI bổ sung bằng màu xanh.
    
    ĐỊNH DẠNG ĐẦU RA:
    - Trả về toàn bộ nội dung giáo án đã chỉnh sửa dưới dạng Markdown.
    
    NỘI DUNG GIÁO ÁN GỐC:
    ${info.content}
  `;

  // Fallback Logic: Try each model in sequence
  let lastError = null;

  for (let i = 0; i < MODELS.length; i++) {
    const currentModelId = MODELS[i];
    console.log(`[AI_EDU] Attempting generation with model: ${currentModelId}...`);

    try {
      const response = await ai.models.generateContent({
        model: currentModelId,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.1,
        },
        contents: userPrompt,
      });

      const text = response.text;
      if (!text) {
        throw new Error("API returned empty response.");
      }

      const validation = validateAIOutput(text, info, options, isEnglishSubject);
      if (validation.valid) {
        return text;
      }

      const repairedText = await autoRepairOutput(
        ai,
        currentModelId,
        systemInstruction,
        userPrompt,
        text,
        validation.errors
      );

      if (repairedText) {
        const repairedValidation = validateAIOutput(repairedText, info, options, isEnglishSubject);
        if (repairedValidation.valid) {
          return repairedText;
        }
        throw new Error(`[AI_EDU] Rule Engine failed after auto-repair: ${repairedValidation.errors.join(" | ")}`);
      }

      throw new Error(`[AI_EDU] Rule Engine failed: ${validation.errors.join(" | ")}`);

    } catch (error: any) {
      console.error(`[AI_EDU] Error with model ${currentModelId}:`, error);

      let errorMessage = error.message || "";
      if (typeof errorMessage === 'string' && errorMessage.trim().startsWith('{')) {
        try {
          const errorObj = JSON.parse(errorMessage);
          if (errorObj.error && errorObj.error.message) {
            errorMessage = errorObj.error.message;
          }
        } catch (e) { /* ignore parse error */ }
      }

      error.message = errorMessage;
      lastError = error;

      const isRetryable =
        errorMessage.includes("503") ||
        errorMessage.toLowerCase().includes("overloaded") ||
        errorMessage.includes("UNAVAILABLE") ||
        errorMessage.includes("429");

      if (isRetryable && i < MODELS.length - 1) {
        console.warn(`[AI_EDU] Model ${currentModelId} failed/overloaded. Switching to fallback model...`);
        continue;
      } else if (i < MODELS.length - 1) {
        if (errorMessage.includes("403") || errorMessage.includes("API key not valid") || errorMessage.toLowerCase().includes("quota")) {
          throw new Error("API Key KHÔNG HỢP LỆ hoặc HẾT HẠN MỨC (Quota Exceeded).\n\nCách xử lý:\n1. Dùng tài khoản Google khác để tạo API Key mới tại Google AI Studio.\n2. Kiểm tra lại dự án Google Cloud của bạn xem có bị giới hạn không.");
        }
        console.warn(`[AI_EDU] Model ${currentModelId} encountered error. Switching to fallback model...`);
        continue;
      }
    }
  }

  if (lastError) {
    const errorMsg = typeof lastError.message === 'string' ? lastError.message.toLowerCase() : "";
    if (errorMsg.includes("quota") || errorMsg.includes("429")) {
      throw new Error("API Key ĐÃ HẾT HẠN MỨC SỬ DỤNG (Quota Exceeded) hoặc quá tải lượt gọi.\n\nCách giải quyết:\n1. Sang tab 'Cài đặt' để nhập API Key của một tài khoản Google (Gmail) KHÁC.\n2. Lấy API Key mới miễn phí tại: https://aistudio.google.com/app/apikey");
    }
    if (errorMsg.includes("403") || errorMsg.includes("api key not valid")) {
      throw new Error("API Key không hợp lệ. Vui lòng cấu hình API Key khác.");
    }
    throw lastError;
  }

  throw new Error("Tất cả các model đều thất bại. Vui lòng thử lại sau.");
};

// ===================== AI INTEGRATION TABLE (Tích hợp AI vào môn học) =====================

export const generateAIIntegrationTable = async (
  info: LessonInfo,
  options: ProcessingOptions
): Promise<IntegrationRow[]> => {

  const apiKey = options.apiKey || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Missing API_KEY. Vui lòng nhập API Key trong phần cài đặt.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  const userPrompt = `
    THÔNG TIN ĐẦU VÀO:
    - Môn học: ${info.subject}
    - Khối lớp: ${info.grade}

    NỘI DUNG SÁCH GIÁO KHOA (trích xuất từ file):
    ${info.content.substring(0, 80000)}

    YÊU CẦU: Phân tích nội dung SGK trên và gợi ý các ĐỊA CHỈ TÍCH HỢP GIÁO DỤC AI phù hợp.
    Trả về ĐÚNG định dạng JSON array như đã hướng dẫn trong system instruction.
    Chỉ chọn 5-15 bài học có tiềm năng tích hợp cao nhất.
  `;

  let lastError = null;

  for (let i = 0; i < MODELS.length; i++) {
    const currentModelId = MODELS[i];
    console.log(`[AI_INTEGRATION] Attempting generation with model: ${currentModelId}...`);

    try {
      const response = await ai.models.generateContent({
        model: currentModelId,
        config: {
          systemInstruction: AI_INTEGRATION_SYSTEM_INSTRUCTION,
          temperature: 0.2,
        },
        contents: userPrompt,
      });

      const text = response.text;
      if (!text) {
        throw new Error("API trả về kết quả rỗng.");
      }

      // Parse JSON from response - handle potential markdown wrapping
      let jsonText = text.trim();
      // Remove markdown code block if present
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
      }

      try {
        const parsed = JSON.parse(jsonText) as IntegrationRow[];
        if (!Array.isArray(parsed)) {
          throw new Error("Response is not an array");
        }
        return parsed;
      } catch (parseErr) {
        console.error('[AI_INTEGRATION] JSON parse error, attempting to extract array...', parseErr);
        // Try to extract JSON array from text
        const match = jsonText.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (match) {
          return JSON.parse(match[0]) as IntegrationRow[];
        }
        throw new Error("Không thể phân tích phản hồi từ AI. Vui lòng thử lại.");
      }

    } catch (error: any) {
      console.error(`[AI_INTEGRATION] Error with model ${currentModelId}:`, error);

      let errorMessage = error.message || "";
      if (typeof errorMessage === 'string' && errorMessage.trim().startsWith('{')) {
        try {
          const errorObj = JSON.parse(errorMessage);
          if (errorObj.error && errorObj.error.message) {
            errorMessage = errorObj.error.message;
          }
        } catch (e) { /* ignore parse error */ }
      }

      error.message = errorMessage;
      lastError = error;

      const isRetryable =
        errorMessage.includes("503") ||
        errorMessage.toLowerCase().includes("overloaded") ||
        errorMessage.includes("UNAVAILABLE") ||
        errorMessage.includes("429");

      if (isRetryable && i < MODELS.length - 1) {
        console.warn(`[AI_INTEGRATION] Model ${currentModelId} failed. Switching to fallback...`);
        continue;
      } else if (i < MODELS.length - 1) {
        if (errorMessage.includes("403") || errorMessage.includes("API key not valid") || errorMessage.toLowerCase().includes("quota")) {
          throw new Error("API Key KHÔNG HỢP LỆ hoặc HẾT HẠN MỨC (Quota Exceeded).\n\nCách xử lý:\n1. Dùng tài khoản Google khác để tạo API Key mới tại Google AI Studio.\n2. Kiểm tra lại dự án Google Cloud của bạn xem có bị giới hạn không.");
        }
        continue;
      }
    }
  }

  if (lastError) {
    const errorMsg = typeof lastError.message === 'string' ? lastError.message.toLowerCase() : "";
    if (errorMsg.includes("quota") || errorMsg.includes("429")) {
      throw new Error("API Key ĐÃ HẾT HẠN MỨC SỬ DỤNG (Quota Exceeded) hoặc quá tải lượt gọi.\n\nCách giải quyết:\n1. Sang tab 'Cài đặt' để nhập API Key của một tài khoản Google (Gmail) KHÁC.\n2. Lấy API Key mới miễn phí tại: https://aistudio.google.com/app/apikey");
    }
    if (errorMsg.includes("403") || errorMsg.includes("api key not valid")) {
      throw new Error("API Key không hợp lệ. Vui lòng cấu hình API Key khác.");
    }
    throw lastError;
  }

  throw new Error("Tất cả các model đều thất bại. Vui lòng thử lại sau.");
};
