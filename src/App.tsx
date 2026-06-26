import { useState, useEffect } from "react";
import { GraduationCap, Briefcase, RefreshCw, AlertCircle, Sparkles, Building2, BookOpen } from "lucide-react";
import TeacherList from "./components/TeacherList";
import TeacherDrawer from "./components/TeacherDrawer";
import PositionList from "./components/PositionList";
import PositionDrawer from "./components/PositionDrawer";
import { Teacher, WorkPosition } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"teachers" | "positions">("teachers");

  // Database lists
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [positions, setPositions] = useState<WorkPosition[]>([]);
  
  // Loading and Error States
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pagination & Search States for Teacher List
  const [teacherPage, setTeacherPage] = useState(1);
  const [teacherLimit, setTeacherLimit] = useState(10);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [teacherSearch, setTeacherSearch] = useState("");

  // Drawer States
  const [isTeacherDrawerOpen, setIsTeacherDrawerOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const [isPositionDrawerOpen, setIsPositionDrawerOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<WorkPosition | null>(null);

  // Load Positions
  const loadPositions = async () => {
    try {
      const posRes = await fetch("/api/positions");
      if (!posRes.ok) throw new Error("Không thể tải danh sách vị trí công tác");
      const posData = await posRes.json();
      setPositions(posData);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Lỗi tải vị trí công tác");
    }
  };

  // Load Teachers (paginated & searched)
  const loadTeachers = async () => {
    setLoading(true);
    try {
      const url = `/api/teachers?page=${teacherPage}&limit=${teacherLimit}&search=${encodeURIComponent(teacherSearch)}`;
      const teachRes = await fetch(url);
      if (!teachRes.ok) throw new Error("Không thể tải danh sách giáo viên");
      const result = await teachRes.json();
      setTeachers(result.data || []);
      setTotalTeachers(result.total || 0);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Lỗi tải danh sách giáo viên");
    } finally {
      setLoading(false);
    }
  };

  // Combined loadData function
  const loadData = async () => {
    setInitialLoading(true);
    setError("");
    try {
      await Promise.all([loadPositions(), loadTeachers()]);
    } catch (err: any) {
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  // Sync teachers whenever page, limit or search changes
  useEffect(() => {
    if (!initialLoading) {
      loadTeachers();
    }
  }, [teacherPage, teacherLimit, teacherSearch]);

  // Save Teacher (Create or Update)
  const handleSaveTeacher = async (teacherData: Partial<Teacher>) => {
    try {
      const isEdit = !!selectedTeacher;
      const url = isEdit ? `/api/teachers/${selectedTeacher.id}` : "/api/teachers";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacherData),
      });

      if (!res.ok) {
        const errObj = await res.json();
        throw new Error(errObj.error || "Có lỗi xảy ra khi lưu thông tin giáo viên");
      }

      await loadTeachers();
      setIsTeacherDrawerOpen(false);
      setSelectedTeacher(null);
    } catch (err: any) {
      alert(err.message || "Không thể lưu thông tin giáo viên!");
    }
  };

  // Save Position (Create or Update)
  const handleSavePosition = async (positionData: Partial<WorkPosition>) => {
    try {
      const isEdit = !!selectedPosition;
      const url = isEdit ? `/api/positions/${selectedPosition.id}` : "/api/positions";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(positionData),
      });

      if (!res.ok) {
        const errObj = await res.json();
        throw new Error(errObj.error || "Có lỗi xảy ra khi lưu vị trí công tác");
      }

      await loadPositions();
      setIsPositionDrawerOpen(false);
      setSelectedPosition(null);
    } catch (err: any) {
      alert(err.message || "Không thể lưu vị trí công tác!");
    }
  };

  // Trigger editing a teacher
  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsTeacherDrawerOpen(true);
  };

  // Trigger creating a new teacher
  const handleCreateTeacher = () => {
    setSelectedTeacher(null);
    setIsTeacherDrawerOpen(true);
  };

  // Trigger editing a position
  const handleEditPosition = (position: WorkPosition) => {
    setSelectedPosition(position);
    setIsPositionDrawerOpen(true);
  };

  // Trigger creating a new position
  const handleCreatePosition = () => {
    setSelectedPosition(null);
    setIsPositionDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Top Banner Header */}
      <header className="bg-indigo-900 text-white shadow-md relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
          <GraduationCap className="w-64 h-64 text-white" />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-6 md:py-8 flex flex-col md:flex-row items-center justify-between gap-6 relative">
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <div className="p-3.5 bg-indigo-600 rounded-2xl shadow-lg ring-4 ring-indigo-800">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center justify-center md:justify-start gap-2">
                HỆ THỐNG QUẢN LÝ THÔNG TIN GIÁO VIÊN
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] bg-indigo-500/50 text-indigo-100 px-2 py-0.5 rounded-full font-semibold">
                  MERN Stack App
                </span>
              </h1>
              <p className="text-xs text-indigo-200 mt-1 max-w-xl">
                Quản lý hồ sơ nhân sự, trình độ đào tạo học vị, chuyên ngành, bộ môn, và cơ cấu tổ chức các vị trí làm việc công tác tại nhà trường.
              </p>
            </div>
          </div>

          {/* Quick Stats overview */}
          <div className="flex gap-4">
            <div className="bg-indigo-950/60 border border-indigo-750 rounded-xl px-4 py-2.5 text-center shadow-xs min-w-[100px]">
              <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Giáo Viên</div>
              <div className="text-lg font-black text-white mt-0.5">{totalTeachers}</div>
            </div>
            <div className="bg-indigo-950/60 border border-indigo-750 rounded-xl px-4 py-2.5 text-center shadow-xs min-w-[100px]">
              <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Vị Trí Công Tác</div>
              <div className="text-lg font-black text-white mt-0.5">{positions.length}</div>
            </div>
          </div>
        </div>

        {/* Global tab selectors inside header */}
        <div className="border-t border-indigo-800 bg-indigo-950/40">
          <div className="max-w-7xl mx-auto px-6 flex">
            <button
              onClick={() => setActiveTab("teachers")}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold tracking-wide transition-all border-b-2 cursor-pointer ${
                activeTab === "teachers"
                  ? "border-white text-white bg-indigo-800/40"
                  : "border-transparent text-indigo-200 hover:text-white hover:bg-indigo-800/25"
              }`}
            >
              Quản lý Giáo viên
            </button>
            <button
              onClick={() => setActiveTab("positions")}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold tracking-wide transition-all border-b-2 cursor-pointer ${
                activeTab === "positions"
                  ? "border-white text-white bg-indigo-800/40"
                  : "border-transparent text-indigo-200 hover:text-white hover:bg-indigo-800/25"
              }`}
            >
              Vị trí công tác ({positions.length})
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col min-h-0">
        {initialLoading ? (
          // Loader state
          <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
            <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
            <span className="text-sm font-semibold text-gray-500">Đang tải dữ liệu từ cơ sở dữ liệu...</span>
          </div>
        ) : error ? (
          // Error state
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col items-center text-center space-y-4 my-12 max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h3 className="text-base font-bold text-red-950">Lỗi đồng bộ cơ sở dữ liệu</h3>
            <p className="text-xs text-red-700 leading-relaxed">{error}</p>
            <button
              onClick={loadData}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Thử lại ngay
            </button>
          </div>
        ) : (
          // Active Tab Panel
          <div className="flex-1 min-h-0 animate-fade-in">
            {activeTab === "teachers" ? (
              <TeacherList
                teachers={teachers}
                positions={positions}
                onRefresh={loadData}
                onEditTeacher={handleEditTeacher}
                onCreateTeacher={handleCreateTeacher}
                currentPage={teacherPage}
                pageSize={teacherLimit}
                totalItems={totalTeachers}
                onPageChange={setTeacherPage}
                onPageSizeChange={setTeacherLimit}
                searchTerm={teacherSearch}
                onSearchChange={(val) => {
                  setTeacherSearch(val);
                  setTeacherPage(1);
                }}
              />
            ) : (
              <PositionList
                positions={positions}
                onRefresh={loadData}
                onEditPosition={handleEditPosition}
                onCreatePosition={handleCreatePosition}
              />
            )}
          </div>
        )}
      </main>

      {/* Teacher Creation/Edit Drawer */}
      <TeacherDrawer
        isOpen={isTeacherDrawerOpen}
        onClose={() => {
          setIsTeacherDrawerOpen(false);
          setSelectedTeacher(null);
        }}
        teacher={selectedTeacher}
        positions={positions}
        onSave={handleSaveTeacher}
      />

      {/* Position Creation/Edit Drawer */}
      <PositionDrawer
        isOpen={isPositionDrawerOpen}
        onClose={() => {
          setIsPositionDrawerOpen(false);
          setSelectedPosition(null);
        }}
        position={selectedPosition}
        onSave={handleSavePosition}
      />

      {/* Minimal Status Footer */}
      <footer className="py-4 border-t border-gray-150 text-center text-[11px] text-gray-400 bg-white shrink-0 font-medium">
        Hệ thống quản lý giáo viên &copy; 2026 &bull; Sử dụng MERN Stack (Node, Express, React, LocalStorage-JSON DB)
      </footer>
    </div>
  );
}
