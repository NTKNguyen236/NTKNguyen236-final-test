import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { WorkPosition } from "../types";

interface PositionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position: WorkPosition | null; // null if creating new
  onSave: (positionData: Partial<WorkPosition>) => void;
}

export default function PositionDrawer({
  isOpen,
  onClose,
  position,
  onSave,
}: PositionDrawerProps) {
  const [ma, setMa] = useState("");
  const [ten, setTen] = useState("");
  const [moTa, setMoTa] = useState("");
  const [trangThai, setTrangThai] = useState<"Hoạt động" | "Ngừng">("Hoạt động");
  const [error, setError] = useState("");

  // Sync state when drawer opens or changes position
  useEffect(() => {
    if (position) {
      setMa(position.ma || "");
      setTen(position.ten || "");
      setMoTa(position.moTa || "");
      setTrangThai(position.trangThai || "Hoạt động");
    } else {
      setMa("");
      setTen("");
      setMoTa("");
      setTrangThai("Hoạt động");
    }
    setError("");
  }, [position, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!ma.trim()) {
      setError("Mã vị trí không được để trống!");
      return;
    }
    if (!ten.trim()) {
      setError("Tên vị trí không được để trống!");
      return;
    }
    if (!moTa.trim()) {
      setError("Mô tả không được để trống!");
      return;
    }

    onSave({
      ma: ma.trim().toUpperCase(),
      ten: ten.trim(),
      moTa: moTa.trim(),
      trangThai,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      {/* Overlay click */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Drawer Container */}
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl relative animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="text-base font-bold text-gray-950">
              {position ? "Chỉnh sửa vị trí công tác" : "Vị trí công tác mới"}
            </h2>
          </div>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            Lưu
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Mã */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Mã <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={ma}
              onChange={(e) => setMa(e.target.value)}
              placeholder="VD: TTS, GVBM, TBM"
              disabled={!!position} // Disable editing the code key once created for integrity
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 bg-white text-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
            />
            {position && (
              <span className="text-[10px] text-gray-400 mt-1 block">
                Không thể sửa mã vị trí đã tạo.
              </span>
            )}
          </div>

          {/* Tên */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Tên vị trí <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={ten}
              onChange={(e) => setTen(e.target.value)}
              placeholder="VD: Giáo viên bộ môn"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 bg-white text-gray-900"
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Mô tả chi tiết <span className="text-red-500">*</span>
            </label>
            <textarea
              value={moTa}
              onChange={(e) => setMoTa(e.target.value)}
              placeholder="Nhập mô tả chi tiết vị trí làm việc..."
              rows={4}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 bg-white text-gray-900 resize-none"
            />
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Trạng thái <span className="text-red-500">*</span>
            </label>
            <div className="flex border border-gray-200 rounded-lg overflow-hidden p-0.5 bg-gray-50 w-full">
              <button
                type="button"
                onClick={() => setTrangThai("Hoạt động")}
                className={`flex-1 text-xs py-2 rounded-md font-semibold transition-all cursor-pointer ${
                  trangThai === "Hoạt động"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Hoạt động
              </button>
              <button
                type="button"
                onClick={() => setTrangThai("Ngừng")}
                className={`flex-1 text-xs py-2 rounded-md font-semibold transition-all cursor-pointer ${
                  trangThai === "Ngừng"
                    ? "bg-gray-200 text-gray-700 shadow-xs"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Ngừng
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3.5">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5 py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
