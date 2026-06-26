import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { Teacher, WorkPosition } from "./src/types";

const USERS_PATH = path.join(process.cwd(), "data", "users.json");
const TEACHERS_PATH = path.join(process.cwd(), "data", "teachers.json");
const POSITIONS_PATH = path.join(process.cwd(), "data", "teacher_positions.json");

// Helpers to read database collections
async function readUsers() {
  try {
    const data = await fs.readFile(USERS_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeUsers(data: any) {
  try {
    await fs.mkdir(path.dirname(USERS_PATH), { recursive: true });
    await fs.writeFile(USERS_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing users file", error);
  }
}

async function readTeachers() {
  try {
    const data = await fs.readFile(TEACHERS_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeTeachers(data: any) {
  try {
    await fs.mkdir(path.dirname(TEACHERS_PATH), { recursive: true });
    await fs.writeFile(TEACHERS_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing teachers file", error);
  }
}

async function readPositions() {
  try {
    const data = await fs.readFile(POSITIONS_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writePositions(data: any) {
  try {
    await fs.mkdir(path.dirname(POSITIONS_PATH), { recursive: true });
    await fs.writeFile(POSITIONS_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing positions file", error);
  }
}

// Generate unique 10-digit teacher code
async function generateUniqueTeacherCode(teachers: any[]): Promise<string> {
  let code = "";
  let isUnique = false;
  while (!isUnique) {
    code = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    isUnique = !teachers.some((t: any) => t.code === code);
  }
  return code;
}

// Map database teacher record to client-side Teacher format
function mapToClientTeacher(teacher: any, user: any, positionsList: any[]): any {
  const hocVi = (teacher.degrees || []).map((deg: any, index: number) => {
    return {
      id: deg._id || deg.id || `deg-${index}-${Date.now()}`,
      bac: deg.type || "Cử nhân",
      truong: deg.school || "",
      chuyenNganh: deg.major || "",
      totNghiep: deg.year ? String(deg.year) : "N/A",
      trangThai: deg.isGraduated ? "Hoàn thành" : "Đang học"
    };
  });

  const positionCodes = (teacher.teacherPositionsId || []).map((posId: string) => {
    const found = positionsList.find((p: any) => p.id === posId || p._id === posId || p.ma === posId || p.code === posId);
    return found ? found.code || found.ma : posId;
  });

  return {
    id: teacher.id || teacher._id,
    ma: teacher.code,
    hoTen: user ? user.name : "Chưa cập nhật",
    ngaySinh: user ? user.dob : "",
    soDienThoai: user ? user.phoneNumber : "",
    email: user ? user.email : "",
    soCCCD: user ? user.identity || "" : "",
    diaChi: user ? user.address || "" : "",
    viTriCongTac: positionCodes,
    hocVi: hocVi,
    boMon: hocVi.length > 0 ? hocVi[0].chuyenNganh : "N/A",
    trangThai: teacher.isActive ? "Đang công tác" : "Ngừng công tác",
    avatar: user ? user.avatar || "" : ""
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON with a large limit (for base64 avatar images)
  app.use(express.json({ limit: "50mb" }));

  // API Routes

  // GET: /teacher-positions and /api/positions - Get all work positions
  const getPositionsHandler = async (req: express.Request, res: express.Response) => {
    try {
      const positions = await readPositions();
      // Map schema fields to fit what the client-side expects
      const mapped = positions
        .filter((p: any) => !p.isDeleted)
        .map((p: any) => ({
          id: p.id || p._id,
          ma: p.code,
          ten: p.name,
          moTa: p.des,
          trangThai: p.isActive ? "Hoạt động" : "Ngừng"
        }));
      res.json(mapped);
    } catch (error) {
      res.status(500).json({ error: "Cannot load positions" });
    }
  };
  app.get("/teacher-positions", getPositionsHandler);
  app.get("/api/positions", getPositionsHandler);

  // POST: /teacher-positions and /api/positions - Create a new position
  const createPositionHandler = async (req: express.Request, res: express.Response) => {
    try {
      const positions = await readPositions();
      const { ma, ten, moTa, trangThai, code, name, des } = req.body;

      // support both frontend forms
      const finalCode = (code || ma || "").trim().toUpperCase();
      const finalName = (name || ten || "").trim();
      const finalDes = (des || moTa || "").trim();
      const finalIsActive = trangThai === "Hoạt động" || trangThai === undefined;

      if (!finalCode) {
        return res.status(400).json({ error: "Mã vị trí (code) không được để trống!" });
      }
      if (!finalName) {
        return res.status(400).json({ error: "Tên vị trí (name) không được để trống!" });
      }

      // Check unique code
      const exists = positions.some((p: any) => !p.isDeleted && p.code.toUpperCase() === finalCode);
      if (exists) {
        return res.status(400).json({ error: `Mã vị trí '${finalCode}' đã tồn tại!` });
      }

      const newPosition = {
        id: "pos-" + Date.now(),
        code: finalCode,
        name: finalName,
        des: finalDes,
        isActive: finalIsActive,
        isDeleted: false
      };

      positions.push(newPosition);
      await writePositions(positions);

      // Return client expected response
      res.status(201).json({
        id: newPosition.id,
        ma: newPosition.code,
        ten: newPosition.name,
        moTa: newPosition.des,
        trangThai: newPosition.isActive ? "Hoạt động" : "Ngừng"
      });
    } catch (error) {
      res.status(500).json({ error: "Cannot create position" });
    }
  };
  app.post("/teacher-positions", createPositionHandler);
  app.post("/api/positions", createPositionHandler);

  // Update a position
  app.put("/api/positions/:id", async (req, res) => {
    try {
      const positions = await readPositions();
      const { ma, ten, moTa, trangThai } = req.body;
      const index = positions.findIndex((p: any) => p.id === req.params.id);

      if (index === -1) {
        return res.status(404).json({ error: "Position not found" });
      }

      const finalCode = ma.trim().toUpperCase();
      const finalName = ten.trim();
      const finalDes = moTa.trim();

      // Check conflicts
      const conflict = positions.some((p: any) => p.id !== req.params.id && !p.isDeleted && p.code.toUpperCase() === finalCode);
      if (conflict) {
        return res.status(400).json({ error: `Mã vị trí '${finalCode}' đã tồn tại ở vị trí khác!` });
      }

      positions[index] = {
        ...positions[index],
        code: finalCode,
        name: finalName,
        des: finalDes,
        isActive: trangThai === "Hoạt động"
      };

      await writePositions(positions);
      res.json({
        id: positions[index].id,
        ma: positions[index].code,
        ten: positions[index].name,
        moTa: positions[index].des,
        trangThai: positions[index].isActive ? "Hoạt động" : "Ngừng"
      });
    } catch (error) {
      res.status(500).json({ error: "Cannot update position" });
    }
  });


  // GET: /teachers and /api/teachers - Get teachers with mapping and backend pagination
  const getTeachersHandler = async (req: express.Request, res: express.Response) => {
    try {
      const [users, teachers, positions] = await Promise.all([
        readUsers(),
        readTeachers(),
        readPositions()
      ]);

      // filter out deleted records
      const activeTeachers = teachers.filter((t: any) => !t.isDeleted);

      // Map to full client Teacher records
      const fullList = activeTeachers.map((teacher: any) => {
        const user = users.find((u: any) => u.id === teacher.userId && !u.isDeleted);
        return mapToClientTeacher(teacher, user, positions);
      });

      // Filter based on search query if any
      let filtered = fullList;
      const search = (req.query.search as string || "").trim().toLowerCase();
      if (search) {
        filtered = fullList.filter((t: any) => {
          return (
            t.hoTen.toLowerCase().includes(search) ||
            t.ma.toLowerCase().includes(search) ||
            t.soDienThoai.toLowerCase().includes(search) ||
            t.email.toLowerCase().includes(search) ||
            t.diaChi.toLowerCase().includes(search) ||
            t.boMon.toLowerCase().includes(search)
          );
        });
      }

      // Check if pagination queries exist
      const page = req.query.page ? parseInt(req.query.page as string, 10) : null;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : null;

      if (page !== null && limit !== null) {
        const total = filtered.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = filtered.slice(startIndex, endIndex);

        return res.json({
          data: paginatedData,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1
        });
      }

      // If no pagination query, return whole list directly (for backward compatibility if needed)
      res.json(filtered);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Cannot load teachers" });
    }
  };
  app.get("/teachers", getTeachersHandler);
  app.get("/api/teachers", getTeachersHandler);

  // Get single teacher
  app.get("/api/teachers/:id", async (req, res) => {
    try {
      const [users, teachers, positions] = await Promise.all([
        readUsers(),
        readTeachers(),
        readPositions()
      ]);

      const teacher = teachers.find((t: any) => (t.id === req.params.id || t.code === req.params.id) && !t.isDeleted);
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }

      const user = users.find((u: any) => u.id === teacher.userId && !u.isDeleted);
      const mapped = mapToClientTeacher(teacher, user, positions);
      res.json(mapped);
    } catch (error) {
      res.status(500).json({ error: "Error loading teacher" });
    }
  });

  // POST: /teachers and /api/teachers - Create new teacher
  const createTeacherHandler = async (req: express.Request, res: express.Response) => {
    try {
      const [users, teachers, positions] = await Promise.all([
        readUsers(),
        readTeachers(),
        readPositions()
      ]);

      const body = req.body;

      if (!body.hoTen || !body.soDienThoai || !body.email) {
        return res.status(400).json({ error: "Vui lòng nhập đầy đủ Họ tên, Số điện thoại và Email!" });
      }

      // Check unique email in users DB
      const emailLower = body.email.trim().toLowerCase();
      const emailExists = users.some((u: any) => !u.isDeleted && u.email && u.email.toLowerCase() === emailLower);
      if (emailExists) {
        return res.status(400).json({ error: `Email '${body.email}' đã được sử dụng trong hệ thống!` });
      }

      // Create new User document
      const userId = "user-" + Date.now() + Math.random().toString(36).substring(2, 7);
      const newUser = {
        id: userId,
        name: body.hoTen.trim(),
        email: emailLower,
        phoneNumber: body.soDienThoai.trim(),
        address: (body.diaChi || "").trim(),
        identity: (body.soCCCD || "").trim(),
        dob: body.ngaySinh || "",
        role: "TEACHER",
        isDeleted: false,
        avatar: body.avatar || ""
      };

      // Resolve position codes back to IDs
      const positionIds = (body.viTriCongTac || []).map((code: string) => {
        const found = positions.find((p: any) => p.code === code || p.ma === code || p.id === code);
        return found ? found.id || found._id : code;
      });

      // Generate random unique 10-digit code
      const teacherCode = await generateUniqueTeacherCode(teachers);

      // Create new Teacher document
      const teacherId = "teacher-" + Date.now() + Math.random().toString(36).substring(2, 7);
      const newTeacher = {
        id: teacherId,
        userId: userId,
        code: teacherCode,
        isActive: body.trangThai === "Đang công tác" || body.trangThai === undefined,
        isDeleted: false,
        startDate: new Date().toISOString(),
        teacherPositionsId: positionIds,
        degrees: (body.hocVi || []).map((deg: any) => ({
          type: deg.bac,
          school: deg.truong,
          major: deg.chuyenNganh,
          year: Number(deg.totNghiep) || 2020,
          isGraduated: deg.trangThai === "Hoàn thành"
        }))
      };

      users.push(newUser);
      teachers.push(newTeacher);

      await Promise.all([
        writeUsers(users),
        writeTeachers(teachers)
      ]);

      const mapped = mapToClientTeacher(newTeacher, newUser, positions);
      res.status(201).json(mapped);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Cannot create teacher" });
    }
  };
  app.post("/teachers", createTeacherHandler);
  app.post("/api/teachers", createTeacherHandler);

  // Update teacher
  app.put("/api/teachers/:id", async (req, res) => {
    try {
      const [users, teachers, positions] = await Promise.all([
        readUsers(),
        readTeachers(),
        readPositions()
      ]);

      const body = req.body;
      const teacherIndex = teachers.findIndex((t: any) => t.id === req.params.id && !t.isDeleted);

      if (teacherIndex === -1) {
        return res.status(404).json({ error: "Teacher not found" });
      }

      const teacher = teachers[teacherIndex];
      const userIndex = users.findIndex((u: any) => u.id === teacher.userId && !u.isDeleted);

      // Check unique email conflict
      if (body.email && userIndex !== -1) {
        const emailLower = body.email.trim().toLowerCase();
        const conflict = users.some((u: any) => u.id !== teacher.userId && !u.isDeleted && u.email && u.email.toLowerCase() === emailLower);
        if (conflict) {
          return res.status(400).json({ error: `Email '${body.email}' đã được người dùng khác sử dụng!` });
        }
      }

      // Update user details
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          name: body.hoTen !== undefined ? body.hoTen.trim() : users[userIndex].name,
          email: body.email !== undefined ? body.email.trim().toLowerCase() : users[userIndex].email,
          phoneNumber: body.soDienThoai !== undefined ? body.soDienThoai.trim() : users[userIndex].phoneNumber,
          address: body.diaChi !== undefined ? body.diaChi.trim() : users[userIndex].address,
          identity: body.soCCCD !== undefined ? body.soCCCD.trim() : users[userIndex].identity,
          dob: body.ngaySinh !== undefined ? body.ngaySinh : users[userIndex].dob,
          avatar: body.avatar !== undefined ? body.avatar : users[userIndex].avatar
        };
      }

      // Map position codes to IDs
      const positionIds = (body.viTriCongTac || []).map((code: string) => {
        const found = positions.find((p: any) => p.code === code || p.ma === code || p.id === code);
        return found ? found.id || found._id : code;
      });

      // Update teacher details
      teachers[teacherIndex] = {
        ...teacher,
        isActive: body.trangThai !== undefined ? (body.trangThai === "Đang công tác") : teacher.isActive,
        teacherPositionsId: positionIds,
        degrees: body.hocVi !== undefined ? (body.hocVi || []).map((deg: any) => ({
          type: deg.bac,
          school: deg.truong,
          major: deg.chuyenNganh,
          year: Number(deg.totNghiep) || 2020,
          isGraduated: deg.trangThai === "Hoàn thành"
        })) : teacher.degrees
      };

      await Promise.all([
        writeUsers(users),
        writeTeachers(teachers)
      ]);

      const mapped = mapToClientTeacher(teachers[teacherIndex], users[userIndex], positions);
      res.json(mapped);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Cannot update teacher" });
    }
  });

  // Soft Delete teacher (isDeleted = true)
  app.delete("/api/teachers/:id", async (req, res) => {
    try {
      const teachers = await readTeachers();
      const index = teachers.findIndex((t: any) => t.id === req.params.id);
      
      if (index === -1) {
        return res.status(404).json({ error: "Teacher not found" });
      }
      
      teachers[index].isDeleted = true;
      await writeTeachers(teachers);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Cannot delete teacher" });
    }
  });

  // Vite Integration for Serving Frontend
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
