export interface AcademicDegree {
  id: string;
  bac: string; // e.g., 'Cử nhân', 'Thạc sĩ', 'Tiến sĩ'
  truong: string; // e.g., 'Đại học Sư phạm Hà Nội'
  chuyenNganh: string; // e.g., 'Toán học'
  trangThai: string; // e.g., 'Hoàn thành', 'Đang học'
  totNghiep: string; // e.g., '2020' or 'N/A'
}

export interface Teacher {
  id: string;
  ma: string; // unique code, e.g., phone number or CCCD
  hoTen: string;
  ngaySinh: string;
  soDienThoai: string;
  email: string;
  soCCCD: string;
  diaChi: string;
  viTriCongTac: string[]; // List of position codes, e.g., ['GVBM'] or ['CBYT']
  hocVi: AcademicDegree[];
  boMon: string; // e.g., 'Toán học', 'Tiếng Anh', 'N/A'
  trangThai: 'Đang công tác' | 'Ngừng công tác';
  avatar: string; // base64 string or image URL
}

export interface WorkPosition {
  id: string;
  ma: string; // unique, e.g., TTS, GVBM, TBM, HT, HP, CBYT
  ten: string; // e.g., Thực tập sinh, Giáo viên bộ môn
  moTa: string; // description
  trangThai: 'Hoạt động' | 'Ngừng';
}
