import React, { useState, useEffect } from "react";
import { X, Upload, Plus, Trash2, Save, Sparkles } from "lucide-react";
import { Teacher, WorkPosition, AcademicDegree } from "../types";

interface TeacherDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null; // null if creating new
  positions: WorkPosition[];
  onSave: (teacherData: Partial<Teacher>) => void;
}

export default function TeacherDrawer({
  isOpen,
  onClose,
  teacher,
  positions,
  onSave,
}: TeacherDrawerProps) {
  // Personal Info State
  const [hoTen, setHoTen] = useState("");
  const [ngaySinh, setNgaySinh] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [email, setEmail] = useState("");
  const [soCCCD, setSoCCCD] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [viTriCongTac, setViTriCongTac] = useState<string[]>([]);
  const [hocVi, setHocVi] = useState<AcademicDegree[]>([]);
  const [boMon, setBoMon] = useState("N/A");
  const [trangThai, setTrangThai] = useState<"Đang công tác" | "Ngừng công tác">("Đang công tác");
  const [avatar, setAvatar] = useState("");

  // UI state for adding a degree
  const [showAddDegree, setShowAddDegree] = useState(false);
  const [degreeBac, setDegreeBac] = useState("Cử nhân");
  const [degreeTruong, setDegreeTruong] = useState("");
  const [degreeChuyenNganh, setDegreeChuyenNganh] = useState("");
  const [degreeTrangThai, setDegreeTrangThai] = useState("Hoàn thành");
  const [degreeTotNghiep, setDegreeTotNghiep] = useState("");

  // Error state
  const [error, setError] = useState("");

  // Sync state when drawer opens or changes teacher
  useEffect(() => {
    if (teacher) {
      setHoTen(teacher.hoTen || "");
      setNgaySinh(teacher.ngaySinh || "");
      setSoDienThoai(teacher.soDienThoai || "");
      setEmail(teacher.email || "");
      setSoCCCD(teacher.soCCCD || "");
      setDiaChi(teacher.diaChi || "");
      setViTriCongTac(teacher.viTriCongTac || []);
      setHocVi(teacher.hocVi || []);
      setBoMon(teacher.boMon || "N/A");
      setTrangThai(teacher.trangThai || "Đang công tác");
      setAvatar(teacher.avatar || "");
    } else {
      // Clear all for creating new
      setHoTen("");
      setNgaySinh("");
      setSoDienThoai("");
      setEmail("");
      setSoCCCD("");
      setDiaChi("");
      setViTriCongTac([]);
      setHocVi([]);
      setBoMon("N/A");
      setTrangThai("Đang công tác");
      setAvatar("");
    }
    setError("");
    setShowAddDegree(false);
  }, [teacher, isOpen]);

  if (!isOpen) return null;

  // Handle image upload & convert to base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add academic degree to the list
  const handleAddDegreeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!degreeTruong || !degreeChuyenNganh) {
      alert("Vui lòng nhập đầy đủ Trường và Chuyên ngành!");
      return;
    }

    const newDegree: AcademicDegree = {
      id: "deg-" + Date.now(),
      bac: degreeBac,
      truong: degreeTruong,
      chuyenNganh: degreeChuyenNganh,
      trangThai: degreeTrangThai,
      totNghiep: degreeTrangThai === "Đang học" ? "N/A" : degreeTotNghiep || "N/A",
    };

    setHocVi([...hocVi, newDegree]);

    // Reset degree input
    setDegreeTruong("");
    setDegreeChuyenNganh("");
    setDegreeTotNghiep("");
    setShowAddDegree(false);
  };

  const handleDeleteDegree = (id: string) => {
    setHocVi(hocVi.filter((d) => d.id !== id));
  };

  // Submit all teacher info
  const handleSubmit = () => {
    if (!hoTen.trim()) {
      setError("Họ và tên không được để trống!");
      return;
    }
    if (!ngaySinh) {
      setError("Ngày sinh không được để trống!");
      return;
    }
    if (!soDienThoai.trim()) {
      setError("Số điện thoại không được để trống!");
      return;
    }
    if (!email.trim()) {
      setError("Email không được để trống!");
      return;
    }
    if (!soCCCD.trim()) {
      setError("Số CCCD không được để trống!");
      return;
    }
    if (!diaChi.trim()) {
      setError("Địa chỉ không được để trống!");
      return;
    }
    if (viTriCongTac.length === 0) {
      setError("Vui lòng chọn ít nhất một Vị trí công tác!");
      return;
    }

    // Generate teacher code (ma) automatically from phone or CCCD if creating new
    const ma = teacher?.ma || soDienThoai.trim();

    onSave({
      ma,
      hoTen,
      ngaySinh,
      soDienThoai,
      email,
      soCCCD,
      diaChi,
      viTriCongTac,
      hocVi,
      boMon,
      trangThai,
      avatar,
    });
  };

  // Toggle position selection
  const handlePositionToggle = (posMa: string) => {
    if (viTriCongTac.includes(posMa)) {
      setViTriCongTac(viTriCongTac.filter((m) => m !== posMa));
    } else {
      setViTriCongTac([...viTriCongTac, posMa]);
    }
  };

  // Default cartoon profile avatar if none provided
  const defaultAvatar = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="120" height="120"><rect width="100%" height="100%" fill="%23F3F4F6"/><circle cx="50" cy="35" r="20" fill="%234F46E5"/><path d="M20,80 C20,60 30,55 50,55 C70,55 80,60 80,80 Z" fill="%234F46E5"/><circle cx="45" cy="35" r="2" fill="white"/><circle cx="55" cy="35" r="2" fill="white"/><path d="M47,40 Q50,43 53,40" stroke="white" stroke-width="2" fill="none"/></svg>`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      {/* Overlay click */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Drawer Container */}
      <div className="w-full max-w-4xl bg-white h-full flex flex-col shadow-2xl relative animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              {teacher ? "Chỉnh sửa thông tin giáo viên" : "Tạo thông tin giáo viên"}
            </h2>
          </div>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-xs"
          >
            Lưu thông tin
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3.5 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Grid Layout containing Avatar and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Left Column: Avatar upload */}
            <div className="flex flex-col items-center justify-center space-y-4 p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
              <div className="relative group">
                <img
                  src={avatar || defaultAvatar}
                  alt="Teacher Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md bg-gray-200"
                />
                <label className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs">
                  <Upload className="w-5 h-5 mb-1" />
                  Tải ảnh lên
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Hỗ trợ JPG, PNG</p>
                <button
                  type="button"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e: any) => handleImageChange(e);
                    input.click();
                  }}
                  className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 mx-auto"
                >
                  Chọn ảnh đại diện
                </button>
              </div>
            </div>

            {/* Right Column: Personal Information (Thông tin cá nhân) */}
            <div className="md:col-span-3 space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <div className="w-1.5 h-4 bg-indigo-600 rounded-sm"></div>
                <h3 className="font-medium text-gray-900 text-sm uppercase tracking-wider">
                  Thông tin cá nhân
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Họ và tên */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={hoTen}
                    onChange={(e) => setHoTen(e.target.value)}
                    placeholder="VD: Nguyễn Văn A"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-white text-gray-900"
                  />
                </div>

                {/* Ngày sinh */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={ngaySinh}
                    onChange={(e) => setNgaySinh(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-white text-gray-900"
                  />
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={soDienThoai}
                    onChange={(e) => setSoDienThoai(e.target.value)}
                    placeholder="Nhập số điện thoại"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-white text-gray-900"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@school.edu.vn"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-white text-gray-900"
                  />
                </div>

                {/* Số CCCD */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Số CCCD <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={soCCCD}
                    onChange={(e) => setSoCCCD(e.target.value)}
                    placeholder="Nhập số CCCD"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-white text-gray-900"
                  />
                </div>

                {/* Địa chỉ */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Địa chỉ thường trú <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={diaChi}
                    onChange={(e) => setDiaChi(e.target.value)}
                    placeholder="Địa chỉ thường trú"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-white text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Work positions & status (Thông tin công tác) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <div className="w-1.5 h-4 bg-indigo-600 rounded-sm"></div>
              <h3 className="font-medium text-gray-900 text-sm uppercase tracking-wider">
                Thông tin công tác
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Positions Selection */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Vị trí công tác <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {positions.map((p) => {
                    const isSelected = viTriCongTac.includes(p.ma);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handlePositionToggle(p.ma)}
                        className={`text-xs px-3.5 py-2 rounded-lg border font-medium transition-all cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {p.ten} ({p.ma})
                      </button>
                    );
                  })}
                  {positions.length === 0 && (
                    <span className="text-xs text-gray-400 italic">
                      Chưa có vị trí công tác nào được cấu hình
                    </span>
                  )}
                </div>
              </div>

              {/* Department & Status */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Bộ môn chính
                  </label>
                  <select
                    value={boMon}
                    onChange={(e) => setBoMon(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 bg-white text-gray-900"
                  >
                    <option value="N/A">N/A</option>
                    <option value="Toán học">Toán học</option>
                    <option value="Ngữ văn">Ngữ văn</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Vật lý">Vật lý</option>
                    <option value="Hóa học">Hóa học</option>
                    <option value="Sinh học">Sinh học</option>
                    <option value="Lịch sử">Lịch sử</option>
                    <option value="Địa lý">Địa lý</option>
                    <option value="Tin học">Tin học</option>
                    <option value="Thể dục">Thể dục</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Trạng thái công tác
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTrangThai("Đang công tác")}
                      className={`flex-1 text-xs py-2 rounded-lg border font-medium transition-all ${
                        trangThai === "Đang công tác"
                          ? "bg-green-600 border-green-600 text-white shadow-xs"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Đang công tác
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrangThai("Ngừng công tác")}
                      className={`flex-1 text-xs py-2 rounded-lg border font-medium transition-all ${
                        trangThai === "Ngừng công tác"
                          ? "bg-red-600 border-red-600 text-white shadow-xs"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Ngừng công tác
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Academic Degrees (Học vị) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-indigo-600 rounded-sm"></div>
                <h3 className="font-medium text-gray-900 text-sm uppercase tracking-wider">
                  Học vị
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddDegree(!showAddDegree)}
                className="flex items-center gap-1 bg-white hover:bg-gray-50 text-indigo-600 border border-indigo-200 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
              >
                Thêm học vị
              </button>
            </div>

            {/* Inline degree adding form */}
            {showAddDegree && (
              <form
                onSubmit={handleAddDegreeSubmit}
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4 animate-fade-in"
              >
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    Khai báo học vị mới
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddDegree(false)}
                    className="text-gray-400 hover:text-gray-600 text-xs"
                  >
                    Hủy
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-gray-500 mb-1">
                      Bậc đào tạo
                    </label>
                    <select
                      value={degreeBac}
                      onChange={(e) => setDegreeBac(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-md p-1.5 bg-white text-gray-900"
                    >
                      <option value="Cử nhân">Cử nhân</option>
                      <option value="Thạc sĩ">Thạc sĩ</option>
                      <option value="Tiến sĩ">Tiến sĩ</option>
                      <option value="Phó Giáo sư">Phó Giáo sư</option>
                      <option value="Giáo sư">Giáo sư</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] uppercase font-semibold text-gray-500 mb-1">
                      Trường đào tạo
                    </label>
                    <input
                      type="text"
                      value={degreeTruong}
                      onChange={(e) => setDegreeTruong(e.target.value)}
                      placeholder="VD: ĐH Sư phạm Hà Nội"
                      className="w-full text-xs border border-gray-200 rounded-md p-1.5 bg-white text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-gray-500 mb-1">
                      Chuyên ngành
                    </label>
                    <input
                      type="text"
                      value={degreeChuyenNganh}
                      onChange={(e) => setDegreeChuyenNganh(e.target.value)}
                      placeholder="VD: Toán tin"
                      className="w-full text-xs border border-gray-200 rounded-md p-1.5 bg-white text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-gray-500 mb-1">
                      Trạng thái
                    </label>
                    <select
                      value={degreeTrangThai}
                      onChange={(e) => setDegreeTrangThai(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-md p-1.5 bg-white text-gray-900"
                    >
                      <option value="Hoàn thành">Hoàn thành</option>
                      <option value="Đang học">Đang học</option>
                    </select>
                  </div>

                  {degreeTrangThai === "Hoàn thành" && (
                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-gray-500 mb-1">
                        Năm tốt nghiệp
                      </label>
                      <input
                        type="text"
                        value={degreeTotNghiep}
                        onChange={(e) => setDegreeTotNghiep(e.target.value)}
                        placeholder="VD: 2020"
                        className="w-full text-xs border border-gray-200 rounded-md p-1.5 bg-white text-gray-900"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2 border-t border-gray-150">
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-2xs transition-colors"
                  >
                    Thêm vào danh sách
                  </button>
                </div>
              </form>
            )}

            {/* Degree List table */}
            <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Bậc</th>
                    <th className="py-3 px-4">Trường</th>
                    <th className="py-3 px-4">Chuyên ngành</th>
                    <th className="py-3 px-4 text-center">Trạng thái</th>
                    <th className="py-3 px-4 text-center">Tốt nghiệp</th>
                    <th className="py-3 px-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {hocVi.map((deg) => (
                    <tr
                      key={deg.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-gray-800"
                    >
                      <td className="py-3 px-4 font-medium">{deg.bac}</td>
                      <td className="py-3 px-4">{deg.truong}</td>
                      <td className="py-3 px-4">{deg.chuyenNganh}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            deg.trangThai === "Hoàn thành"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {deg.trangThai}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-500 font-mono">
                        {deg.totNghiep}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteDegree(deg.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Xóa học vị"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {hocVi.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <svg
                            className="w-10 h-10 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4a2 2 0 012-2m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                          </svg>
                          <span className="text-sm">Trống</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3.5">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-700 text-sm font-medium transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
