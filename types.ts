
export enum AppMode {
  NLS = "NLS",       // Năng lực số (hiện tại)
  AI_EDU = "AI_EDU"  // Giáo dục AI (QĐ 3439)
}

// Danh sách môn học theo Chương trình GDPT 2018
export enum Subject {
  // === MÔN CHUNG (nhiều cấp) ===
  TOAN = "Toán",
  TIENG_ANH = "Tiếng Anh",
  GDTC = "Giáo dục thể chất",
  TIN_HOC = "Tin học",
  HDTN = "Hoạt động trải nghiệm",
  GD_DIA_PHUONG = "Giáo dục địa phương",

  // === TIỂU HỌC (1-5) ===
  TIENG_VIET = "Tiếng Việt",        // Lớp 1-5
  DAO_DUC = "Đạo đức",              // Lớp 1-5
  TN_XH = "Tự nhiên và Xã hội",    // Lớp 1-3
  KHOA_HOC = "Khoa học",            // Lớp 4-5
  LS_DL_TH = "Lịch sử và Địa lí",  // Lớp 4-5 (Tiểu học)
  TIN_CN_TH = "Tin học và Công nghệ", // Lớp 3-5
  AM_NHAC = "Âm nhạc",
  MY_THUAT = "Mỹ thuật",

  // === THCS (6-9) ===
  NGU_VAN = "Ngữ văn",              // Lớp 6-12
  KHTN = "Khoa học tự nhiên",       // Lớp 6-9
  LS_DL_THCS = "Lịch sử và Địa lí (THCS)", // Lớp 6-9
  GDCD = "Giáo dục công dân",       // Lớp 6-9
  CONG_NGHE = "Công nghệ",          // Lớp 6-12

  // === THPT (10-12) ===
  VAT_LI = "Vật lí",                // Lớp 10-12
  HOA_HOC = "Hóa học",              // Lớp 10-12
  SINH_HOC = "Sinh học",            // Lớp 10-12
  LICH_SU = "Lịch sử",             // Lớp 10-12
  DIA_LI = "Địa lí",               // Lớp 10-12
  GD_KTPL = "Giáo dục kinh tế và pháp luật", // Lớp 10-12
  NGHE_THUAT = "Nghệ thuật",        // Lớp 10-12
  GDQP_AN = "Giáo dục quốc phòng và an ninh", // Lớp 10-12
}

// Hàm lấy danh sách môn học phù hợp theo khối lớp (GDPT 2018)
export function getSubjectsByGrade(grade: number): Subject[] {
  if (grade >= 1 && grade <= 3) {
    // Tiểu học lớp 1-3
    return [
      Subject.TIENG_VIET,
      Subject.TOAN,
      Subject.DAO_DUC,
      Subject.TN_XH,
      Subject.GDTC,
      Subject.AM_NHAC,
      Subject.MY_THUAT,
      Subject.HDTN,
      ...(grade >= 3 ? [Subject.TIENG_ANH, Subject.TIN_CN_TH] : []),
    ];
  }

  if (grade >= 4 && grade <= 5) {
    // Tiểu học lớp 4-5
    return [
      Subject.TIENG_VIET,
      Subject.TOAN,
      Subject.DAO_DUC,
      Subject.KHOA_HOC,
      Subject.LS_DL_TH,
      Subject.TIENG_ANH,
      Subject.TIN_CN_TH,
      Subject.GDTC,
      Subject.AM_NHAC,
      Subject.MY_THUAT,
      Subject.HDTN,
    ];
  }

  if (grade >= 6 && grade <= 9) {
    // THCS
    return [
      Subject.NGU_VAN,
      Subject.TOAN,
      Subject.TIENG_ANH,
      Subject.KHTN,
      Subject.LS_DL_THCS,
      Subject.GDCD,
      Subject.TIN_HOC,
      Subject.CONG_NGHE,
      Subject.GDTC,
      Subject.AM_NHAC,
      Subject.MY_THUAT,
      Subject.HDTN,
      Subject.GD_DIA_PHUONG,
    ];
  }

  // THPT (10-12)
  return [
    Subject.NGU_VAN,
    Subject.TOAN,
    Subject.TIENG_ANH,
    Subject.LICH_SU,
    Subject.DIA_LI,
    Subject.GD_KTPL,
    Subject.VAT_LI,
    Subject.HOA_HOC,
    Subject.SINH_HOC,
    Subject.TIN_HOC,
    Subject.CONG_NGHE,
    Subject.GDTC,
    Subject.NGHE_THUAT,
    Subject.GDQP_AN,
    Subject.HDTN,
    Subject.GD_DIA_PHUONG,
  ];
}

export interface LessonInfo {
  subject: Subject;
  grade: number;
  content: string;
  distributionContent?: string;
}

export interface OriginalDocxFile {
  arrayBuffer: ArrayBuffer;
  fileName: string;
}

export interface ProcessingOptions {
  analyzeOnly: boolean;
  detailedReport: boolean;
  comparisonExport: boolean;
  apiKey: string;
}

export interface GeminiResponse {
  text: string;
}
