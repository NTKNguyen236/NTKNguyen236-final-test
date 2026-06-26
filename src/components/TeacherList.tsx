import { useState, useMemo, useEffect } from "react";
import { Search, RotateCw, UserPlus, Eye, BookOpen, GraduationCap } from "lucide-react";
import { Teacher, WorkPosition } from "../types";

interface TeacherListProps {
  teachers: Teacher[];
  positions: WorkPosition[];
  onRefresh: () => void;
  onEditTeacher: (teacher: Teacher) => void;
  onCreateTeacher: () => void;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function TeacherList({
  teachers,
  positions,
  onRefresh,
  onEditTeacher,
  onCreateTeacher,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  searchTerm,
  onSearchChange,
}: TeacherListProps) {
  // Local state for debounced search
  const [localSearch, setLocalSearch] = useState(searchTerm);

  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch, onSearchChange]);

  // Position map for fast lookups
  const positionMap = useMemo(() => {
    const map = new Map<string, string>();
    positions.forEach((pos) => {
      map.set(pos.ma, pos.ten);
    });
    return map;
  }, [positions]);

  // Helper to find highest degree text
  const getHighestDegreeInfo = (teacher: Teacher) => {
    if (!teacher.hocVi || teacher.hocVi.length === 0) {
      return { bac: "Chưa cập nhật", chuyenNganh: "" };
    }

    // Rank degrees: Tiến sĩ / Phó Giáo sư / Giáo sư > Thạc sĩ > Cử nhân
    const rank = (bac: string) => {
      const b = bac.toLowerCase();
      if (b.includes("giáo sư") || b.includes("phó giáo sư")) return 4;
      if (b.includes("tiến sĩ")) return 3;
      if (b.includes("thạc sĩ")) return 2;
      if (b.includes("cử nhân")) return 1;
      return 0;
    };

    const highest = [...teacher.hocVi].sort((a, b) => rank(b.bac) - rank(a.bac))[0];
    return {
      bac: highest.bac,
      chuyenNganh: highest.chuyenNganh,
    };
  };

  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Default avatars list based on initials or general SVG fallback
  const getAvatarUrl = (teacher: Teacher) => {
    if (teacher.avatar) return teacher.avatar;
    // Generate lovely colored avatar placeholder
    const colors = ["bg-indigo-500", "bg-emerald-500", "bg-blue-500", "bg-pink-500", "bg-amber-500", "bg-purple-500"];
    const hash = teacher.hoTen.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const color = colors[hash % colors.length];
    const initials = teacher.hoTen
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(-2)
      .toUpperCase();

    return { isPlaceholder: true, color, initials };
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Top Filters & Controls */}
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <Search className="h-4.5 w-4.5 text-gray-400" />
          </span>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value);
            }}
            placeholder="Tìm kiếm thông tin giáo viên, SĐT, email..."
            className="w-full text-sm border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-white text-gray-900"
          />
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 border border-gray-200 hover:bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-3xs"
            title="Làm mới danh sách"
          >
            Tải lại
          </button>
          <button
            onClick={onCreateTeacher}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4.5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Tạo mới
          </button>
        </div>
      </div>

      {/* Main Table View */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-semibold tracking-wider text-[11px] uppercase">
              <th className="py-4 px-6">Mã</th>
              <th className="py-4 px-6">Giáo viên</th>
              <th className="py-4 px-6">Trình độ (cao nhất)</th>
              <th className="py-4 px-6">Bộ môn</th>
              <th className="py-4 px-6">TT Công tác</th>
              <th className="py-4 px-6">Địa chỉ</th>
              <th className="py-4 px-6 text-center">Trạng thái</th>
              <th className="py-4 px-6 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {teachers.map((t) => {
              const degInfo = getHighestDegreeInfo(t);
              const avatarInfo = getAvatarUrl(t);

              return (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  {/* Mã giáo viên */}
                  <td className="py-4 px-6 text-xs font-mono text-gray-500 font-medium">
                    {t.ma}
                  </td>

                  {/* Thông tin giáo viên */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3.5">
                       {typeof avatarInfo === "string" ? (
                        <img
                          src={avatarInfo}
                          alt={t.hoTen}
                          className="w-11 h-11 rounded-full object-cover border border-gray-100 bg-gray-50 shadow-2xs"
                        />
                      ) : (
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-2xs ${avatarInfo.color}`}
                        >
                          {avatarInfo.initials}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900 text-sm leading-snug">
                          {t.hoTen}
                        </div>
                        <div className="text-xs text-gray-400 italic mt-0.5">{t.email}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{t.soDienThoai}</div>
                      </div>
                    </div>
                  </td>

                  {/* Trình độ (cao nhất) */}
                  <td className="py-4 px-6 text-xs text-gray-700">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 font-medium">
                        <span>Bậc: {degInfo.bac}</span>
                      </div>
                      {degInfo.chuyenNganh && (
                        <div className="text-gray-400 pl-4.5">Chuyên ngành: {degInfo.chuyenNganh}</div>
                      )}
                    </div>
                  </td>

                  {/* Bộ môn */}
                  <td className="py-4 px-6 text-xs">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium ${
                        t.boMon === "N/A"
                          ? "bg-gray-50 text-gray-400 border border-gray-150"
                          : "bg-indigo-50 text-indigo-700 border border-indigo-150"
                      }`}
                    >
                      {t.boMon}
                    </span>
                  </td>

                  {/* TT Công tác */}
                  <td className="py-4 px-6 text-xs text-gray-700">
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      {t.viTriCongTac.map((pMa) => {
                        const fullName = positionMap.get(pMa) || pMa;
                        return (
                          <span
                            key={pMa}
                            className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-150 rounded-sm text-[11px]"
                            title={fullName}
                          >
                            {fullName}
                          </span>
                        );
                      })}
                      {t.viTriCongTac.length === 0 && (
                        <span className="text-gray-400 italic">Chưa phân công</span>
                      )}
                    </div>
                  </td>

                  {/* Địa chỉ */}
                  <td className="py-4 px-6 text-xs text-gray-600 font-medium">
                    {t.diaChi}
                  </td>

                  {/* Trạng thái */}
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        t.trangThai === "Đang công tác"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-red-100 text-red-700 border border-red-200"
                      }`}
                    >
                      {t.trangThai}
                    </span>

                  </td>

                  {/* Hành động */}
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => onEditTeacher(t)}
                      className="inline-flex items-center gap-1.5 border border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-gray-700 text-xs font-medium px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-3xs"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              );
            })}

            {teachers.length === 0 && (
              <tr>
                <td colSpan={8} className="py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <BookOpen className="w-10 h-10 text-gray-300" />
                    <p className="text-sm font-medium">Không tìm thấy giáo viên phù hợp</p>
                    <p className="text-xs text-gray-400">Hãy thử nhập lại từ khóa tìm kiếm khác</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs font-semibold text-indigo-700">
          Tổng: {totalItems} kết quả
        </div>

        <div className="flex items-center gap-6">
          {/* Page size controller */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>Hiển thị:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
              }}
              className="border border-gray-200 rounded-lg bg-white px-2.5 py-1 outline-none text-xs font-medium text-gray-700 focus:border-indigo-500"
            >
              <option value={5}>5 / trang</option>
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
            </select>
          </div>

          {/* Page buttons */}
          <div className="flex items-center gap-1.5">
            <button
              disabled={safeCurrentPage === 1}
              onClick={() => onPageChange(safeCurrentPage - 1)}
              className="p-1.5 border border-gray-200 hover:bg-gray-150 rounded-lg text-gray-600 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  safeCurrentPage === p
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "border border-gray-200 hover:bg-gray-150 text-gray-600 bg-white"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              disabled={safeCurrentPage === totalPages}
              onClick={() => onPageChange(safeCurrentPage + 1)}
              className="p-1.5 border border-gray-200 hover:bg-gray-150 rounded-lg text-gray-600 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
