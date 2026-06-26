import { useState, useMemo } from "react";
import { Plus, RotateCw, Settings, Search, ShieldAlert } from "lucide-react";
import { WorkPosition } from "../types";

interface PositionListProps {
  positions: WorkPosition[];
  onRefresh: () => void;
  onEditPosition: (position: WorkPosition) => void;
  onCreatePosition: () => void;
}

export default function PositionList({
  positions,
  onRefresh,
  onEditPosition,
  onCreatePosition,
}: PositionListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPositions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return positions;

    return positions.filter(
      (p) =>
        p.ma.toLowerCase().includes(term) ||
        p.ten.toLowerCase().includes(term) ||
        p.moTa.toLowerCase().includes(term)
    );
  }, [positions, searchTerm]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Top Filter Controls */}
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <Search className="h-4.5 w-4.5 text-gray-400" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm vị trí công tác (mã, tên, mô tả)..."
            className="w-full text-sm border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-white text-gray-900"
          />
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={onCreatePosition}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4.5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Tạo
          </button>
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 border border-gray-200 hover:bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-3xs"
            title="Tải lại danh sách"
          >
            Làm mới
          </button>
        </div>
      </div>

      {/* Main Table View */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-semibold tracking-wider text-[11px] uppercase">
              <th className="py-4 px-6 w-16 text-center">STT</th>
              <th className="py-4 px-6 w-32">Mã</th>
              <th className="py-4 px-6">Tên</th>
              <th className="py-4 px-6 text-center w-36">Trạng thái</th>
              <th className="py-4 px-6">Mô tả</th>
              <th className="py-4 px-6 text-center w-24">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredPositions.map((pos, index) => (
              <tr key={pos.id} className="hover:bg-gray-50/50 transition-colors">
                {/* Số thứ tự */}
                <td className="py-4 px-6 text-center font-semibold text-gray-500 text-xs">
                  {index + 1}
                </td>

                {/* Mã */}
                <td className="py-4 px-6">
                  <span className="font-mono bg-indigo-50 text-indigo-700 font-bold px-2 py-1 rounded-md text-xs border border-indigo-100">
                    {pos.ma}
                  </span>
                </td>

                {/* Tên */}
                <td className="py-4 px-6 font-semibold text-gray-900 text-sm">
                  {pos.ten}
                </td>

                {/* Trạng thái */}
                <td className="py-4 px-6 text-center">
                  <span
                    className={`inline-block px-3 py-1 rounded-md text-[11px] font-bold ${
                      pos.trangThai === "Hoạt động"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {pos.trangThai === "Hoạt động" ? "Hoạt động" : "Ngừng hoạt động"}
                  </span>
                </td>

                {/* Mô tả */}
                <td className="py-4 px-6 text-xs text-gray-600 leading-relaxed max-w-sm truncate" title={pos.moTa}>
                  {pos.moTa}
                </td>

                {/* Hành động */}
                <td className="py-4 px-6 text-center">
                  <button
                    onClick={() => onEditPosition(pos)}
                    className="p-2 border border-gray-150 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-150 text-gray-500 rounded-lg transition-all cursor-pointer shadow-3xs"
                    title="Chỉnh sửa vị trí"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}

            {filteredPositions.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <ShieldAlert className="w-10 h-10 text-gray-300" />
                    <p className="text-sm font-medium">Không tìm thấy vị trí công tác nào</p>
                    <p className="text-xs text-gray-400">Hãy thử nhập lại từ khóa tìm kiếm khác</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
