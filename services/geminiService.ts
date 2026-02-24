import { GoogleGenAI } from "@google/genai";
import { LessonInfo, ProcessingOptions, Subject } from "../types";

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

    case Subject.VAN:
      return `
📚 ĐẶC THÙ MÔN NGỮ VĂN - HƯỚNG DẪN NLS:
- ƯU TIÊN: Khai thác thông tin, sáng tạo nội dung, giao tiếp hợp tác
- NLS PHÙ HỢP: 1.1, 1.2 (Tìm kiếm, đánh giá thông tin), 2.2, 2.4 (Chia sẻ, hợp tác), 3.1 (Sáng tạo nội dung)
- VÍ DỤ: Tìm kiếm tài liệu văn học trực tuyến, viết bài trên Google Docs, thảo luận nhóm qua Padlet
- CHÚ Ý: Đánh giá độ tin cậy nguồn tư liệu văn học, tránh thông tin sai lệch`;

    case Subject.LY:
    case Subject.HOA:
    case Subject.SINH:
      return `
📚 ĐẶC THÙ MÔN KHTN (${subject}) - HƯỚNG DẪN NLS:
- ƯU TIÊN: Mô phỏng thí nghiệm, thu thập dữ liệu, phân tích kết quả
- NLS PHÙ HỢP: 5.2 (Công cụ giải quyết vấn đề), 1.1, 1.2 (Tìm kiếm, đánh giá dữ liệu), 3.1 (Tạo nội dung)
- VÍ DỤ: Sử dụng phần mềm mô phỏng thí nghiệm (PhET), vẽ biểu đồ bằng Excel, tra cứu dữ liệu khoa học
- CHÚ Ý: Xác minh tính chính xác của dữ liệu khoa học từ các nguồn đáng tin cậy`;

    case Subject.ANH:
      return `
📚 ĐẶC THÙ MÔN TIẾNG ANH - HƯỚNG DẪN NLS:
- ƯU TIÊN: Công cụ học ngôn ngữ, giao tiếp trực tuyến, sáng tạo nội dung đa phương tiện
- NLS PHÙ HỢP: 2.1, 2.4 (Tương tác, hợp tác), 1.1 (Tìm kiếm), 3.1 (Sáng tạo nội dung)
- VÍ DỤ: Sử dụng từ điển trực tuyến, luyện phát âm qua app, tạo video bài thuyết trình
- CHÚ Ý: Khuyến khích sử dụng các nền tảng học tiếng Anh (Duolingo, Quizlet, Kahoot)`;

    case Subject.SU:
    case Subject.DIA:
      return `
📚 ĐẶC THÙ MÔN KHXH (${subject}) - HƯỚNG DẪN NLS:
- ƯU TIÊN: Tìm kiếm tư liệu, đánh giá nguồn tin, trình bày đa phương tiện
- NLS PHÙ HỢP: 1.1, 1.2 (Tìm kiếm, đánh giá nguồn), 2.2 (Chia sẻ), 3.1 (Sáng tạo nội dung)
- VÍ DỤ: Tra cứu bản đồ trực tuyến, tìm hiểu tài liệu lịch sử số hóa, thuyết trình bằng PowerPoint
- CHÚ Ý: Đánh giá độ tin cậy của các nguồn tư liệu lịch sử/địa lý`;

    case Subject.TIN:
      return `
📚 ĐẶC THÙ MÔN TIN HỌC - HƯỚNG DẪN NLS:
- ƯU TIÊN: Lập trình, an toàn thông tin, giải quyết lỗi kỹ thuật
- NLS PHÙ HỢP: 3.4 (Lập trình), 4.1, 4.2 (An toàn, bảo mật), 5.1 (Giải quyết lỗi), 6.2 (Sử dụng AI)
- VÍ DỤ: Viết code Python/Scratch, thiết lập bảo mật tài khoản, debug chương trình
- CHÚ Ý: Môn này là trọng tâm của NLS, tích hợp tự nhiên vào mọi hoạt động`;

    case Subject.GDCD:
      return `
📚 ĐẶC THÙ MÔN GDCD - HƯỚNG DẪN NLS:
- ƯU TIÊN: Tham gia công dân số, văn hóa mạng, bảo vệ quyền riêng tư
- NLS PHÙ HỢP: 2.3 (Công dân số), 2.5 (Văn hóa mạng), 4.2 (Bảo vệ dữ liệu), 1.2 (Đánh giá tin giả)
- VÍ DỤ: Nhận diện thông tin sai lệch, ứng xử văn minh trên mạng, bảo vệ thông tin cá nhân
- CHÚ Ý: Giáo dục ý thức công dân số có trách nhiệm`;

    case Subject.GDQPAN:
      return `
📚 ĐẶC THÙ MÔN GDQP-AN - HƯỚNG DẪN NLS:
- ƯU TIÊN: An ninh mạng, bảo vệ thông tin quốc phòng, nhận diện thông tin xấu độc
- NLS PHÙ HỢP: 4.1, 4.2 (Bảo vệ thiết bị, dữ liệu), 2.3 (Trách nhiệm công dân), 1.2 (Đánh giá thông tin)
- VÍ DỤ: Nhận diện và phòng chống thông tin xấu độc trên mạng, bảo mật thông tin cá nhân và quốc phòng
- CHÚ Ý ĐẶC BIỆT: 
  + Tích hợp giáo dục an ninh mạng, phòng chống tội phạm công nghệ cao
  + Nhận biết các thủ đoạn lừa đảo, tuyên truyền xuyên tạc trên không gian mạng
  + Bảo vệ bí mật quốc gia, thông tin nhạy cảm về quốc phòng an ninh
  + Ý thức trách nhiệm bảo vệ chủ quyền số quốc gia`;

    case Subject.GDDP:
      return `
📚 ĐẶC THÙ MÔN GIÁO DỤC ĐỊA PHƯƠNG - HƯỚNG DẪN NLS:
- ƯU TIÊN: Khai thác thông tin địa phương, sáng tạo nội dung quảng bá văn hóa, hợp tác cộng đồng
- NLS PHÙ HỢP: 1.1 (Tìm kiếm thông tin), 2.2, 2.4 (Chia sẻ, hợp tác), 3.1 (Sáng tạo nội dung)
- VÍ DỤ: Tìm hiểu di sản văn hóa địa phương qua các nguồn số, tạo video giới thiệu quê hương
- CHÚ Ý ĐẶC BIỆT:
  + Sử dụng công nghệ số để tìm hiểu, lưu giữ và quảng bá văn hóa địa phương
  + Tạo bản đồ số về các địa điểm du lịch, di tích lịch sử địa phương
  + Sưu tầm và số hóa các tài liệu về lịch sử, văn hóa, con người địa phương
  + Kết nối cộng đồng qua các nền tảng số để bảo tồn và phát triển giá trị địa phương`;

    case Subject.CONG_NGHE:
      return `
📚 ĐẶC THÙ MÔN CÔNG NGHỆ - HƯỚNG DẪN NLS:
- ƯU TIÊN: Thiết kế kỹ thuật số, mô phỏng quy trình, giải quyết vấn đề công nghệ
- NLS PHÙ HỢP: 5.2 (Xác định giải pháp công nghệ), 3.1 (Sáng tạo nội dung), 5.3 (Sử dụng sáng tạo)
- VÍ DỤ: Vẽ thiết kế bằng phần mềm CAD, mô phỏng quy trình sản xuất, tìm hiểu công nghệ mới
- CHÚ Ý: Kết hợp thực hành với công cụ số để nâng cao hiệu quả`;

    case Subject.THE_DUC:
      return `
📚 ĐẶC THÙ MÔN THỂ DỤC - HƯỚNG DẪN NLS:
- ƯU TIÊN: Theo dõi sức khỏe, học kỹ thuật qua video, bảo vệ sức khỏe số
- NLS PHÙ HỢP: 4.3 (Bảo vệ sức khỏe), 1.1 (Tìm kiếm thông tin), 2.2 (Chia sẻ)
- VÍ DỤ: Xem video hướng dẫn kỹ thuật, sử dụng app theo dõi sức khỏe, chia sẻ thành tích
- CHÚ Ý: Cân bằng thời gian sử dụng thiết bị số và hoạt động thể chất`;

    case Subject.NQTN:
      return `
📚 ĐẶC THÙ MÔN NGHỆ THUẬT - HƯỚNG DẪN NLS:
- ƯU TIÊN: Sáng tạo nghệ thuật số, chia sẻ tác phẩm, bản quyền sáng tạo
- NLS PHÙ HỢP: 3.1 (Sáng tạo nội dung), 3.3 (Bản quyền), 2.2 (Chia sẻ)
- VÍ DỤ: Vẽ tranh số, chỉnh sửa ảnh/video, tạo nhạc số, triển lãm trực tuyến
- CHÚ Ý: Giáo dục về bản quyền tác phẩm nghệ thuật`;

    case Subject.HDKH:
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
  AI_SYSTEM_INSTRUCTION_ENGLISH, AI_EDUCATION_FRAMEWORK_DATA_ENGLISH
} from "../constants";

// Define the hierarchy of models for fallback
const MODELS = [
  "gemini-3-flash-preview",  // Priority 1: Default - Fast & Good quality
  "gemini-3-pro-preview",    // Priority 2: Deep thinking / Best quality
  "gemini-2.5-flash"         // Priority 3: Fallback stable
];

export const generateNLSLessonPlan = async (
  info: LessonInfo,
  options: ProcessingOptions
): Promise<string> => {

  // Initialize inside function to avoid top-level execution issues
  // Prioritize API Key from options (user input), then environment variable
  const apiKey = options.apiKey || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Missing API_KEY. Vui lòng nhập API Key trong phần cài đặt.");
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
  const isEnglishSubject = info.subject === Subject.ANH;

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
        throw new Error("API trả về kết quả rỗng (Empty Response).");
      }
      return text; // Success!

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
        if (errorMessage.includes("403") || errorMessage.includes("API key not valid")) {
          throw error; // Stop immediately, key is wrong
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

    case Subject.VAN:
      return `
📚 ĐẶC THÙ MÔN NGỮ VĂN - HƯỚNG DẪN TÍCH HỢP AI:
- ƯU TIÊN: AI xử lý ngôn ngữ tự nhiên, sáng tạo viết, phân tích văn bản
- MIỀN AI PHÙ HỢP: Kỹ thuật AI (NLP), Đạo đức AI (bản quyền nội dung)
- VÍ DỤ: Dùng AI hỗ trợ viết bài văn sáng tạo, phân tích phong cách tác giả, so sánh bản dịch AI
- CHÚ Ý: Thảo luận về bản quyền nội dung AI tạo ra, nhận biết văn bản do AI viết`;

    case Subject.LY:
    case Subject.HOA:
    case Subject.SINH:
      return `
📚 ĐẶC THÙ MÔN KHTN (${subject}) - HƯỚNG DẪN TÍCH HỢP AI:
- ƯU TIÊN: AI mô phỏng thí nghiệm, phân tích dữ liệu khoa học, dự đoán kết quả
- MIỀN AI PHÙ HỢP: Kỹ thuật AI (phân tích dữ liệu), Tư duy con người là trung tâm
- VÍ DỤ: AI dự đoán kết quả thí nghiệm, phân tích ảnh hiển vi, nhận diện loài sinh vật
- CHÚ Ý: So sánh dự đoán AI với kết quả thực nghiệm, đánh giá độ tin cậy AI`;

    case Subject.ANH:
      return `
📚 ĐẶC THÙ MÔN TIẾNG ANH - HƯỚNG DẪN TÍCH HỢP AI:
- ƯU TIÊN: AI dịch thuật, luyện phát âm, tạo bài tập ngữ pháp, chatbot hội thoại
- MIỀN AI PHÙ HỢP: Kỹ thuật AI (NLP, Speech-to-Text), Đạo đức AI
- VÍ DỤ: Dùng AI chatbot luyện hội thoại, AI chấm bài viết, AI phân tích ngữ pháp
- CHÚ Ý: Đánh giá chất lượng dịch AI, không phụ thuộc hoàn toàn vào AI`;

    case Subject.SU:
    case Subject.DIA:
      return `
📚 ĐẶC THÙ MÔN KHXH (${subject}) - HƯỚNG DẪN TÍCH HỢP AI:
- ƯU TIÊN: AI phân tích tài liệu lịch sử, dự đoán xu hướng, nhận diện hình ảnh
- MIỀN AI PHÙ HỢP: Tư duy con người là trung tâm, Đạo đức AI
- VÍ DỤ: AI phân tích bản đồ vệ tinh, tổng hợp tài liệu lịch sử, chatbot thảo luận sự kiện
- CHÚ Ý: Đánh giá độ thiên vị của AI khi phân tích sự kiện lịch sử`;

    case Subject.TIN:
      return `
📚 ĐẶC THÙ MÔN TIN HỌC - HƯỚNG DẪN TÍCH HỢP AI:
- ƯU TIÊN: Lập trình AI, huấn luyện mô hình, thiết kế hệ thống AI
- MIỀN AI PHÙ HỢP: Kỹ thuật AI (toàn diện), Thiết kế hệ thống AI
- VÍ DỤ: Lập trình chatbot, huấn luyện model với Teachable Machine, tạo app AI đơn giản
- CHÚ Ý: Đây là môn trọng tâm cho giáo dục AI, tích hợp tự nhiên vào mọi hoạt động`;

    case Subject.GDCD:
      return `
📚 ĐẶC THÙ MÔN GDCD - HƯỚNG DẪN TÍCH HỢP AI:
- ƯU TIÊN: Đạo đức AI, trách nhiệm công dân số, quyền riêng tư
- MIỀN AI PHÙ HỢP: Đạo đức AI (trọng tâm), Tư duy con người là trung tâm
- VÍ DỤ: Phân tích tình huống đạo đức AI, thảo luận thiên vị thuật toán, bảo vệ dữ liệu cá nhân
- CHÚ Ý: Giáo dục ý thức sử dụng AI có trách nhiệm, không lạm dụng AI`;

    case Subject.CONG_NGHE:
      return `
📚 ĐẶC THÙ MÔN CÔNG NGHỆ - HƯỚNG DẪN TÍCH HỢP AI:
- ƯU TIÊN: AI trong sản xuất, IoT và AI, thiết kế sản phẩm thông minh
- MIỀN AI PHÙ HỢP: Kỹ thuật AI, Thiết kế hệ thống AI
- VÍ DỤ: AI điều khiển robot, hệ thống nhà thông minh, AI tối ưu quy trình
- CHÚ Ý: Kết hợp AI với công cụ thiết kế kỹ thuật số`;

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

  const apiKey = options.apiKey || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Missing API_KEY. Vui lòng nhập API Key trong phần cài đặt.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  // Determine if the subject is English
  const isEnglishSubject = info.subject === Subject.ANH;

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
        throw new Error("API trả về kết quả rỗng (Empty Response).");
      }
      return text;

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
        if (errorMessage.includes("403") || errorMessage.includes("API key not valid")) {
          throw error;
        }
        console.warn(`[AI_EDU] Model ${currentModelId} encountered error. Switching to fallback model...`);
        continue;
      }
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error("Tất cả các model đều thất bại. Vui lòng thử lại sau.");
};

