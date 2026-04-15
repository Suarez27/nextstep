require("dotenv").config();

const fs = require("fs");
const path = require("path");
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const initSqlJs = require("sql.js");
const { spawnSync } = require("child_process");
const { z } = require("zod");
const { authRequired, roleRequired, permissionRequired } = require("./middlewares/auth");

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "nextstep-dev-secret";
const DB_CLIENT = (process.env.DB_CLIENT || "mysql").toLowerCase();
const USE_MYSQL = DB_CLIENT === "mysql";
const MYSQL_HOST = process.env.MYSQL_HOST || "127.0.0.1";
const MYSQL_PORT = Number(process.env.MYSQL_PORT || 3306);
const MYSQL_USER = process.env.MYSQL_USER || "root";
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || "";
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || "nextstep";
const MYSQL_BIN = process.env.MYSQL_BIN || "C:\\wamp64\\bin\\mysql\\mysql9.1.0\\bin\\mysql.exe";
const DB_PATH = process.env.NEXTSTEP_DB_PATH
  ? path.resolve(process.env.NEXTSTEP_DB_PATH)
  : path.join(__dirname, "..", "data", "nextstep.sqlite");
const CV_UPLOAD_DIR = path.join(__dirname, "..", "public", "uploads", "cv");
const CV_PDF_MAX_SIZE = 5 * 1024 * 1024;

let SQL;
let db;
let mysqlLastInsertId = null;

function nowIso() {
  return new Date().toISOString();
}

function ensureDbDir() {
  if (USE_MYSQL) return;
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function ensureCvUploadDir() {
  if (!fs.existsSync(CV_UPLOAD_DIR)) {
    fs.mkdirSync(CV_UPLOAD_DIR, { recursive: true });
  }
}

function removeStoredCvPdf(cvPdfUrl) {
  if (!cvPdfUrl || typeof cvPdfUrl !== "string") return;
  if (!cvPdfUrl.startsWith("/uploads/cv/")) return;
  const fileName = path.basename(cvPdfUrl);
  const filePath = path.join(CV_UPLOAD_DIR, fileName);
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (_e) {
    // Ignore file cleanup errors.
  }
}

function escapeSqlValue(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  if (typeof value === "boolean") return value ? "1" : "0";
  return `'${String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

function bindNamedParams(sql, params = {}) {
  return sql.replace(/:[a-zA-Z_][a-zA-Z0-9_]*/g, (token) => {
    if (!(token in params)) return token;
    return escapeSqlValue(params[token]);
  });
}

function parseMysqlTable(output) {
  const text = (output || "").trim();
  if (!text) return [];

  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];

  const headers = lines[0].split("\t");
  return lines.slice(1).map((line) => {
    const values = line.split("\t");
    const row = {};
    headers.forEach((h, idx) => {
      const raw = values[idx];
      if (raw === "\\N" || typeof raw === "undefined") {
        row[h] = null;
      } else if (/^-?\d+$/.test(raw)) {
        row[h] = Number(raw);
      } else {
        row[h] = raw;
      }
    });
    return row;
  });
}

function mysqlExec(sql, includeHeaders = false, useDatabase = true) {
  const args = [
    "-h",
    MYSQL_HOST,
    "-P",
    String(MYSQL_PORT),
    "-u",
    MYSQL_USER,
    "--protocol=TCP",
    "--batch",
    "--raw",
    "--default-character-set=utf8mb4",
  ];

  if (!includeHeaders) args.push("--skip-column-names");
  if (MYSQL_PASSWORD) args.push(`-p${MYSQL_PASSWORD}`);

  if (useDatabase) {
    args.push("-D", MYSQL_DATABASE);
  }

  args.push("-e", sql);

  const result = spawnSync(MYSQL_BIN, args, { encoding: "utf8" });
  if (result.status !== 0) {
    const err = (result.stderr || result.stdout || "MySQL execution error").trim();
    throw new Error(err);
  }

  return result.stdout || "";
}

function saveDb() {
  if (USE_MYSQL) return;
  ensureDbDir();
  const data = db.export();
  const tmpPath = `${DB_PATH}.tmp`;
  fs.writeFileSync(tmpPath, Buffer.from(data));
  fs.renameSync(tmpPath, DB_PATH);
}

function run(sql, params = {}) {
  if (USE_MYSQL) {
    mysqlExec(bindNamedParams(sql, params), false, true);
    const idOut = mysqlExec("SELECT LAST_INSERT_ID() AS id", true, true);
    const idRows = parseMysqlTable(idOut);
    mysqlLastInsertId = idRows[0] ? idRows[0].id : null;
    return;
  }

  const stmt = db.prepare(sql);
  stmt.bind(params);
  stmt.step();
  stmt.free();
  saveDb();
}

function all(sql, params = {}) {
  if (USE_MYSQL) {
    const out = mysqlExec(bindNamedParams(sql, params), true, true);
    return parseMysqlTable(out);
  }

  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function get(sql, params = {}) {
  const rows = all(sql, params);
  return rows[0] || null;
}

function lastInsertId() {
  if (USE_MYSQL) return mysqlLastInsertId;
  const row = get("SELECT last_insert_rowid() AS id");
  return row ? row.id : null;
}

function getCenterForUser(userId) {
  return get("SELECT id, user_id, center_name, city, created_at FROM centers WHERE user_id = :uid", { ":uid": userId });
}

function ensureCenterForUser(userId, fallbackName = "Centro Educativo", fallbackCity = "") {
  let center = getCenterForUser(userId);
  if (center) return center;

  const createdAt = nowIso();
  run(
    `INSERT INTO centers (user_id, center_name, city, created_at)
     VALUES (:user_id, :center_name, :city, :created_at)`,
    {
      ":user_id": userId,
      ":center_name": fallbackName,
      ":city": fallbackCity,
      ":created_at": createdAt,
    }
  );

  center = getCenterForUser(userId);
  return center;
}

function ensureColumn(table, columnName, columnDefinition) {
  let exists;
  if (USE_MYSQL) {
    const columns = all(`SHOW COLUMNS FROM ${table} LIKE '${columnName}'`);
    exists = columns.length > 0;
  } else {
    const columns = all(`PRAGMA table_info(${table})`);
    exists = columns.some((c) => c.name === columnName);
  }
  if (!exists) {
    run(`ALTER TABLE ${table} ADD COLUMN ${columnDefinition}`);
  }
}

function migrateSchema() {
  ensureColumn("students", "center_id", "center_id INTEGER");

  if (USE_MYSQL) {
    ensureColumn("alumnos", "url_cv_pdf", "url_cv_pdf VARCHAR(500) NULL");
  } else {
    ensureColumn("students", "cv_pdf_url", "cv_pdf_url TEXT");
  }

  const defaultCenter = get("SELECT id FROM centers ORDER BY id ASC LIMIT 1");
  if (defaultCenter) {
    run("UPDATE students SET center_id = :cid WHERE center_id IS NULL", { ":cid": defaultCenter.id });
  }
}

function seedIfEmpty() {
  const users = get("SELECT COUNT(*) AS total FROM users");
  if (users && users.total > 0) return;

  const password = bcrypt.hashSync("Demo1234!", 10);
  const ts = nowIso();

  run(
    `INSERT INTO users (name, email, password_hash, role, created_at)
     VALUES (:name, :email, :password_hash, :role, :created_at)`,
    {
      ":name": "Admin NextStep",
      ":email": "admin@nextstep.local",
      ":password_hash": password,
      ":role": "admin",
      ":created_at": ts,
    }
  );

  run(
    `INSERT INTO users (name, email, password_hash, role, created_at)
     VALUES (:name, :email, :password_hash, :role, :created_at)`,
    {
      ":name": "Centro Demo",
      ":email": "centro@nextstep.local",
      ":password_hash": password,
      ":role": "centro",
      ":created_at": ts,
    }
  );

  run(
    `INSERT INTO users (name, email, password_hash, role, created_at)
     VALUES (:name, :email, :password_hash, :role, :created_at)`,
    {
      ":name": "Empresa Demo",
      ":email": "empresa@nextstep.local",
      ":password_hash": password,
      ":role": "empresa",
      ":created_at": ts,
    }
  );

  run(
    `INSERT INTO users (name, email, password_hash, role, created_at)
     VALUES (:name, :email, :password_hash, :role, :created_at)`,
    {
      ":name": "Alumno Demo",
      ":email": "alumno@nextstep.local",
      ":password_hash": password,
      ":role": "alumno",
      ":created_at": ts,
    }
  );

  const centroUser = get("SELECT id FROM users WHERE email = 'centro@nextstep.local'");
  const empresaUser = get("SELECT id FROM users WHERE email = 'empresa@nextstep.local'");
  const alumnoUser = get("SELECT id FROM users WHERE email = 'alumno@nextstep.local'");

  run(
    `INSERT INTO centers (user_id, center_name, city, created_at)
     VALUES (:user_id, :center_name, :city, :created_at)`,
    {
      ":user_id": centroUser.id,
      ":center_name": "IES Innovacion Digital",
      ":city": "Madrid",
      ":created_at": ts,
    }
  );

  const center = get("SELECT id FROM centers WHERE user_id = :uid", { ":uid": centroUser.id });

  run(
    `INSERT INTO companies (user_id, company_name, sector, city, created_at)
     VALUES (:user_id, :company_name, :sector, :city, :created_at)`,
    {
      ":user_id": empresaUser.id,
      ":company_name": "TechBridge S.L.",
      ":sector": "Software",
      ":city": "Madrid",
      ":created_at": ts,
    }
  );

  run(
    `INSERT INTO students (user_id, center_id, cv_text, skills, validated, created_at)
     VALUES (:user_id, :center_id, :cv_text, :skills, :validated, :created_at)`,
    {
      ":user_id": alumnoUser.id,
      ":center_id": center ? center.id : null,
      ":cv_text": "Estudiante DAW con conocimientos en JS y SQL.",
      ":skills": "JavaScript, HTML, CSS, Node.js, SQL",
      ":validated": 1,
      ":created_at": ts,
    }
  );

  const company = get("SELECT id FROM companies WHERE user_id = :uid", { ":uid": empresaUser.id });

  run(
    `INSERT INTO internships (company_id, title, description, hours_total, schedule, slots, created_at)
     VALUES (:company_id, :title, :description, :hours_total, :schedule, :slots, :created_at)`,
    {
      ":company_id": company.id,
      ":title": "Practicas Frontend Junior",
      ":description": "Apoyo en interfaces web con React y APIs REST.",
      ":hours_total": 300,
      ":schedule": "L-V 09:00-14:00",
      ":slots": 2,
      ":created_at": ts,
    }
  );
}

function initSchema() {
  if (USE_MYSQL) {
    const legacyUsersTable = get(
      `SELECT TABLE_NAME
       FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = :db
         AND TABLE_NAME = 'users'
         AND TABLE_TYPE = 'BASE TABLE'`,
      { ":db": MYSQL_DATABASE }
    );

    run(`CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(120) NOT NULL,
      correo VARCHAR(200) NOT NULL UNIQUE,
      hash_contrasena VARCHAR(255) NOT NULL,
      rol ENUM('admin','centro','empresa','alumno') NOT NULL,
      creado_en VARCHAR(40) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    run(`CREATE TABLE IF NOT EXISTS centros_educativos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id INT NOT NULL UNIQUE,
      nombre_centro VARCHAR(200) NOT NULL,
      ciudad VARCHAR(120) DEFAULT '',
      creado_en VARCHAR(40) NOT NULL,
      CONSTRAINT fk_centros_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    run(`CREATE TABLE IF NOT EXISTS empresas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id INT NOT NULL UNIQUE,
      nombre_empresa VARCHAR(200) NOT NULL,
      sector VARCHAR(120) DEFAULT '',
      ciudad VARCHAR(120) DEFAULT '',
      creado_en VARCHAR(40) NOT NULL,
      CONSTRAINT fk_empresas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    run(`CREATE TABLE IF NOT EXISTS alumnos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id INT NOT NULL UNIQUE,
      centro_id INT NULL,
      texto_cv TEXT,
      url_cv_pdf VARCHAR(500) DEFAULT NULL,
      habilidades TEXT,
      validado TINYINT(1) NOT NULL DEFAULT 0,
      creado_en VARCHAR(40) NOT NULL,
      CONSTRAINT fk_alumnos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      CONSTRAINT fk_alumnos_centro FOREIGN KEY (centro_id) REFERENCES centros_educativos(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    run(`CREATE TABLE IF NOT EXISTS practicas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      empresa_id INT NOT NULL,
      titulo VARCHAR(200) NOT NULL,
      descripcion TEXT NOT NULL,
      horas_totales INT NOT NULL,
      horario VARCHAR(120) DEFAULT '',
      plazas INT NOT NULL DEFAULT 1,
      creado_en VARCHAR(40) NOT NULL,
      CONSTRAINT fk_practicas_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    run(`CREATE TABLE IF NOT EXISTS candidaturas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      practica_id INT NOT NULL,
      alumno_id INT NOT NULL,
      estado ENUM('pendiente','aceptada','rechazada') NOT NULL DEFAULT 'pendiente',
      creado_en VARCHAR(40) NOT NULL,
      UNIQUE KEY uq_practica_alumno (practica_id, alumno_id),
      CONSTRAINT fk_candidaturas_practica FOREIGN KEY (practica_id) REFERENCES practicas(id),
      CONSTRAINT fk_candidaturas_alumno FOREIGN KEY (alumno_id) REFERENCES alumnos(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    run(`CREATE TABLE IF NOT EXISTS entrevistas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      candidatura_id INT NOT NULL,
      fecha_entrevista VARCHAR(40) NOT NULL,
      notas TEXT,
      creado_en VARCHAR(40) NOT NULL,
      CONSTRAINT fk_entrevistas_candidatura FOREIGN KEY (candidatura_id) REFERENCES candidaturas(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    run(`CREATE TABLE IF NOT EXISTS convenios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      practica_id INT NOT NULL,
      alumno_id INT NOT NULL,
      centro_id INT NOT NULL,
      firmado_en VARCHAR(40) NOT NULL,
      notas TEXT,
      creado_en VARCHAR(40) NOT NULL,
      CONSTRAINT fk_convenios_practica FOREIGN KEY (practica_id) REFERENCES practicas(id),
      CONSTRAINT fk_convenios_alumno FOREIGN KEY (alumno_id) REFERENCES alumnos(id),
      CONSTRAINT fk_convenios_centro FOREIGN KEY (centro_id) REFERENCES centros_educativos(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    run(`CREATE TABLE IF NOT EXISTS seguimientos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      alumno_id INT NOT NULL,
      usuario_autor_id INT NOT NULL,
      contenido TEXT NOT NULL,
      progreso INT NOT NULL DEFAULT 0,
      creado_en VARCHAR(40) NOT NULL,
      CONSTRAINT fk_seguimientos_alumno FOREIGN KEY (alumno_id) REFERENCES alumnos(id),
      CONSTRAINT fk_seguimientos_usuario FOREIGN KEY (usuario_autor_id) REFERENCES usuarios(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    if (legacyUsersTable) {
      run(`INSERT IGNORE INTO usuarios (id, nombre, correo, hash_contrasena, rol, creado_en)
           SELECT id, name, email, password_hash, role, created_at FROM users`);

      run(`INSERT IGNORE INTO centros_educativos (id, usuario_id, nombre_centro, ciudad, creado_en)
           SELECT id, user_id, center_name, city, created_at FROM centers`);

      run(`INSERT IGNORE INTO empresas (id, usuario_id, nombre_empresa, sector, ciudad, creado_en)
           SELECT id, user_id, company_name, sector, city, created_at FROM companies`);

      run(`INSERT IGNORE INTO alumnos (id, usuario_id, centro_id, texto_cv, habilidades, validado, creado_en)
           SELECT id, user_id, center_id, cv_text, skills, validated, created_at FROM students`);

      run(`INSERT IGNORE INTO practicas (id, empresa_id, titulo, descripcion, horas_totales, horario, plazas, creado_en)
           SELECT id, company_id, title, description, hours_total, schedule, slots, created_at FROM internships`);

      run(`INSERT IGNORE INTO candidaturas (id, practica_id, alumno_id, estado, creado_en)
           SELECT id, internship_id, student_id, status, created_at FROM applications`);

      run(`INSERT IGNORE INTO entrevistas (id, candidatura_id, fecha_entrevista, notas, creado_en)
           SELECT id, application_id, interview_at, notes, created_at FROM interviews`);

      run(`INSERT IGNORE INTO convenios (id, practica_id, alumno_id, centro_id, firmado_en, notas, creado_en)
           SELECT id, internship_id, student_id, center_id, signed_at, notes, created_at FROM agreements`);

      run(`INSERT IGNORE INTO seguimientos (id, alumno_id, usuario_autor_id, contenido, progreso, creado_en)
           SELECT id, student_id, author_user_id, content, progress, created_at FROM followups`);

      run("DROP TABLE IF EXISTS followups, agreements, interviews, applications, internships, students, companies, centers, users");
    }

    ensureColumn("alumnos", "url_cv_pdf", "url_cv_pdf VARCHAR(500) NULL");

    run("DROP VIEW IF EXISTS followups, agreements, interviews, applications, internships, students, companies, centers, users");

    run(`CREATE VIEW users AS
         SELECT id, nombre AS name, correo AS email, hash_contrasena AS password_hash, rol AS role, creado_en AS created_at
         FROM usuarios`);

    run(`CREATE VIEW centers AS
         SELECT id, usuario_id AS user_id, nombre_centro AS center_name, ciudad AS city, creado_en AS created_at
         FROM centros_educativos`);

    run(`CREATE VIEW companies AS
         SELECT id, usuario_id AS user_id, nombre_empresa AS company_name, sector, ciudad AS city, creado_en AS created_at
         FROM empresas`);

    run(`CREATE VIEW students AS
          SELECT id, usuario_id AS user_id, centro_id AS center_id, texto_cv AS cv_text, url_cv_pdf AS cv_pdf_url, habilidades AS skills, validado AS validated, creado_en AS created_at
         FROM alumnos`);

    run(`CREATE VIEW internships AS
         SELECT id, empresa_id AS company_id, titulo AS title, descripcion AS description, horas_totales AS hours_total, horario AS schedule, plazas AS slots, creado_en AS created_at
         FROM practicas`);

    run(`CREATE VIEW applications AS
         SELECT id, practica_id AS internship_id, alumno_id AS student_id, estado AS status, creado_en AS created_at
         FROM candidaturas`);

    run(`CREATE VIEW interviews AS
         SELECT id, candidatura_id AS application_id, fecha_entrevista AS interview_at, notas AS notes, creado_en AS created_at
         FROM entrevistas`);

    run(`CREATE VIEW agreements AS
         SELECT id, practica_id AS internship_id, alumno_id AS student_id, centro_id AS center_id, firmado_en AS signed_at, notas AS notes, creado_en AS created_at
         FROM convenios`);

    run(`CREATE VIEW followups AS
         SELECT id, alumno_id AS student_id, usuario_autor_id AS author_user_id, contenido AS content, progreso AS progress, creado_en AS created_at
         FROM seguimientos`);

    return;
  }

  run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin','centro','empresa','alumno')),
    created_at TEXT NOT NULL
  )`);

  run(`CREATE TABLE IF NOT EXISTS centers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    center_name TEXT NOT NULL,
    city TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  run(`CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    company_name TEXT NOT NULL,
    sector TEXT,
    city TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    center_id INTEGER,
    cv_text TEXT,
    cv_pdf_url TEXT,
    skills TEXT,
    validated INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(center_id) REFERENCES centers(id)
  )`);

  run(`CREATE TABLE IF NOT EXISTS internships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    hours_total INTEGER NOT NULL,
    schedule TEXT,
    slots INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    FOREIGN KEY(company_id) REFERENCES companies(id)
  )`);

  run(`CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    internship_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendiente' CHECK(status IN ('pendiente','aceptada','rechazada')),
    created_at TEXT NOT NULL,
    UNIQUE(internship_id, student_id),
    FOREIGN KEY(internship_id) REFERENCES internships(id),
    FOREIGN KEY(student_id) REFERENCES students(id)
  )`);

  run(`CREATE TABLE IF NOT EXISTS interviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL,
    interview_at TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(application_id) REFERENCES applications(id)
  )`);

  run(`CREATE TABLE IF NOT EXISTS agreements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    internship_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    center_id INTEGER NOT NULL,
    signed_at TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(internship_id) REFERENCES internships(id),
    FOREIGN KEY(student_id) REFERENCES students(id),
    FOREIGN KEY(center_id) REFERENCES centers(id)
  )`);

  run(`CREATE TABLE IF NOT EXISTS followups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    author_user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY(student_id) REFERENCES students(id),
    FOREIGN KEY(author_user_id) REFERENCES users(id)
  )`);
}

function validate(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validacion fallida",
        issues: parsed.error.issues,
      });
    }
    req.body = parsed.data;
    return next();
  };
}

function buildToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "12h" }
  );
}

async function start() {
  if (USE_MYSQL) {
    mysqlExec(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`, false, false);
  } else {
    ensureDbDir();

    SQL = await initSqlJs({
      locateFile: (file) => path.join(__dirname, "..", "node_modules", "sql.js", "dist", file),
    });

    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH);
      db = new SQL.Database(data);
    } else {
      db = new SQL.Database();
    }
  }

  initSchema();
  migrateSchema();
  seedIfEmpty();

  const app = express();

  const uploadCvPdf = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => {
        ensureCvUploadDir();
        cb(null, CV_UPLOAD_DIR);
      },
      filename: (req, file, cb) => {
        const hasPdfExt = path.extname(file.originalname || "").toLowerCase() === ".pdf";
        const fileName = `student-${req.user.id}-${Date.now()}-${Math.floor(Math.random() * 1000000)}${hasPdfExt ? ".pdf" : ".pdf"}`;
        cb(null, fileName);
      },
    }),
    limits: { fileSize: CV_PDF_MAX_SIZE },
    fileFilter: (_req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase();
      const byMime = (file.mimetype || "").toLowerCase() === "application/pdf";
      if (byMime || ext === ".pdf") return cb(null, true);
      return cb(new Error("Solo se permite subir archivos PDF"));
    },
  }).single("cv_pdf");

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "nextstep-api", time: nowIso() });
  });

  const registerSchema = z.object({
    name: z.string().min(2).max(120),
    email: z.string().email().max(200),
    password: z.string().min(8).max(120),
    role: z.enum(["centro", "empresa"]),
  });

  app.post("/api/auth/register", validate(registerSchema), (req, res) => {
    const { name, email, password, role } = req.body;
    const exists = get("SELECT id FROM users WHERE email = :email", { ":email": email.toLowerCase() });
    if (exists) return res.status(409).json({ error: "Email ya registrado" });

    const hash = bcrypt.hashSync(password, 10);
    const createdAt = nowIso();

    run(
      `INSERT INTO users (name, email, password_hash, role, created_at)
       VALUES (:name, :email, :password_hash, :role, :created_at)`,
      {
        ":name": name,
        ":email": email.toLowerCase(),
        ":password_hash": hash,
        ":role": role,
        ":created_at": createdAt,
      }
    );

    const userId = lastInsertId();
    if (role === "empresa") {
      run(
        `INSERT INTO companies (user_id, company_name, sector, city, created_at)
         VALUES (:user_id, :company_name, '', '', :created_at)`,
        {
          ":user_id": userId,
          ":company_name": `Empresa de ${name}`,
          ":created_at": createdAt,
        }
      );
    }

    if (role === "centro") {
      run(
        `INSERT INTO centers (user_id, center_name, city, created_at)
         VALUES (:user_id, :center_name, '', :created_at)`,
        {
          ":user_id": userId,
          ":center_name": `Centro de ${name}`,
          ":created_at": createdAt,
        }
      );
    }

    const user = get(
      "SELECT id, name, email, role FROM users WHERE id = :id",
      { ":id": userId }
    );

    return res.status(201).json({ token: buildToken(user), user });
  });

  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  app.post("/api/auth/login", validate(loginSchema), (req, res) => {
    const { email, password } = req.body;
    const user = get("SELECT * FROM users WHERE email = :email", { ":email": email.toLowerCase() });
    if (!user) return res.status(401).json({ error: "Credenciales invalidas" });
    const ok = bcrypt.compareSync(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciales invalidas" });

    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    return res.json({ token: buildToken(safeUser), user: safeUser });
  });

  app.get("/api/me", authRequired, (req, res) => {
    const user = get("SELECT id, name, email, role, created_at FROM users WHERE id = :id", { ":id": req.user.id });
    res.json(user);
  });

  const studentProfileSchema = z.object({
    cv_text: z.string().max(6000).default(""),
    skills: z.string().max(1500).default(""),
  });

  app.get("/api/students/me", authRequired, (req, res) => {
    const profile = get(
      `SELECT s.id, s.cv_text, s.cv_pdf_url, s.skills, s.validated, u.name, u.email
       FROM students s
       JOIN users u ON u.id = s.user_id
       WHERE s.user_id = :uid`,
      { ":uid": req.user.id }
    );
    if (!profile) return res.status(404).json({ error: "Perfil de alumno no encontrado" });
    res.json(profile);
  });

  app.put("/api/students/me", authRequired, validate(studentProfileSchema), (req, res) => {
    const student = get("SELECT id FROM students WHERE user_id = :uid", { ":uid": req.user.id });
    if (!student) return res.status(403).json({ error: "Solo cuentas de alumno pueden editar este perfil" });

    run(
      `UPDATE students SET cv_text = :cv_text, skills = :skills, validated = 0 WHERE user_id = :uid`,
      {
        ":cv_text": req.body.cv_text,
        ":skills": req.body.skills,
        ":uid": req.user.id,
      }
    );
    const profile = get("SELECT id, cv_text, cv_pdf_url, skills, validated FROM students WHERE user_id = :uid", { ":uid": req.user.id });
    res.json(profile);
  });

  app.post("/api/students/me/cv-pdf", authRequired, (req, res) => {
    const student = get("SELECT id, cv_pdf_url FROM students WHERE user_id = :uid", { ":uid": req.user.id });
    if (!student) return res.status(403).json({ error: "Solo cuentas de alumno pueden subir CV" });

    uploadCvPdf(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "El PDF supera el limite de 5MB" });
        }
        return res.status(400).json({ error: err.message || "No se pudo subir el archivo" });
      }

      if (!req.file) return res.status(400).json({ error: "Debes adjuntar un archivo PDF" });

      const nextCvPdfUrl = `/uploads/cv/${req.file.filename}`;

      run(
        `UPDATE students SET cv_pdf_url = :cv_pdf_url, validated = 0 WHERE user_id = :uid`,
        {
          ":cv_pdf_url": nextCvPdfUrl,
          ":uid": req.user.id,
        }
      );

      if (student.cv_pdf_url && student.cv_pdf_url !== nextCvPdfUrl) {
        removeStoredCvPdf(student.cv_pdf_url);
      }

      const profile = get("SELECT id, cv_text, cv_pdf_url, skills, validated FROM students WHERE user_id = :uid", { ":uid": req.user.id });
      return res.json(profile);
    });
  });

  app.get("/api/students/validated", authRequired, permissionRequired("studentsValidatedView"), roleRequired("empresa", "centro", "admin"), (_req, res) => {
    const req = _req;
    if (req.user.role === "centro") {
      const center = ensureCenterForUser(req.user.id, `Centro de ${req.user.name}`, "");
      const rows = all(
        `SELECT s.id, s.center_id, s.cv_text, s.skills, u.name, u.email
         , s.cv_pdf_url
         FROM students s
         JOIN users u ON u.id = s.user_id
         WHERE s.validated = 1 AND s.center_id = :cid
         ORDER BY u.name ASC`,
        { ":cid": center.id }
      );
      return res.json(rows);
    }

    const rows = all(
      `SELECT s.id, s.center_id, s.cv_text, s.cv_pdf_url, s.skills, u.name, u.email, c.center_name
       FROM students s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN centers c ON c.id = s.center_id
       WHERE s.validated = 1
       ORDER BY u.name ASC`
    );
    res.json(rows);
  });

  app.get("/api/students/all", authRequired, permissionRequired("students"), roleRequired("centro", "admin"), (req, res) => {
    if (req.user.role === "centro") {
      const center = ensureCenterForUser(req.user.id, `Centro de ${req.user.name}`, "");
      const rows = all(
        `SELECT s.id, s.center_id, s.cv_text, s.cv_pdf_url, s.skills, s.validated, u.name, u.email
         FROM students s
         JOIN users u ON u.id = s.user_id
         WHERE s.center_id = :cid
         ORDER BY s.validated ASC, u.name ASC`,
        { ":cid": center.id }
      );
      return res.json(rows);
    }

    const rows = all(
      `SELECT s.id, s.center_id, s.cv_text, s.cv_pdf_url, s.skills, s.validated, u.name, u.email, c.center_name
       FROM students s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN centers c ON c.id = s.center_id
       ORDER BY s.validated ASC, u.name ASC`
    );
    return res.json(rows);
  });

  const createStudentSchema = z.object({
    name: z.string().min(2).max(120),
    email: z.string().email().max(200),
    password: z.string().min(8).max(120),
    center_id: z.number().int().min(1).optional(),
  });

  const resetStudentPasswordSchema = z.object({
    password: z.string().min(8).max(120),
  });

  app.post("/api/students", authRequired, permissionRequired("studentCreate"), roleRequired("centro", "admin"), validate(createStudentSchema), (req, res) => {
    const { name, email, password } = req.body;

    const exists = get("SELECT id FROM users WHERE email = :email", { ":email": email.toLowerCase() });
    if (exists) return res.status(409).json({ error: "Email ya registrado" });

    let centerId;
    if (req.user.role === "centro") {
      const center = ensureCenterForUser(req.user.id, `Centro de ${req.user.name}`, "");
      centerId = center.id;
    } else {
      centerId = req.body.center_id;
      if (!centerId) return res.status(400).json({ error: "center_id es obligatorio para admin" });
    }

    const centerExists = get("SELECT id FROM centers WHERE id = :id", { ":id": centerId });
    if (!centerExists) return res.status(404).json({ error: "Centro no encontrado" });

    const createdAt = nowIso();
    const hash = bcrypt.hashSync(password, 10);

    run(
      `INSERT INTO users (name, email, password_hash, role, created_at)
       VALUES (:name, :email, :password_hash, 'alumno', :created_at)`,
      {
        ":name": name,
        ":email": email.toLowerCase(),
        ":password_hash": hash,
        ":created_at": createdAt,
      }
    );

    const createdUser = get("SELECT id FROM users WHERE email = :email", { ":email": email.toLowerCase() });
    const userId = createdUser ? createdUser.id : null;
    if (!userId) return res.status(500).json({ error: "No se pudo crear el usuario del alumno" });
    run(
      `INSERT INTO students (user_id, center_id, cv_text, skills, validated, created_at)
       VALUES (:user_id, :center_id, '', '', 0, :created_at)`,
      {
        ":user_id": userId,
        ":center_id": centerId,
        ":created_at": createdAt,
      }
    );

    const created = get(
      `SELECT s.id, s.center_id, s.validated, u.name, u.email
       FROM students s
       JOIN users u ON u.id = s.user_id
       WHERE s.user_id = :uid`,
      { ":uid": userId }
    );

    return res.status(201).json(created);
  });

  app.post("/api/students/:id/validate", authRequired, permissionRequired("studentValidate"), roleRequired("centro", "admin"), (req, res) => {
    const studentId = Number(req.params.id);

    if (req.user.role === "centro") {
      const center = ensureCenterForUser(req.user.id, `Centro de ${req.user.name}`, "");
      const row = get("SELECT id FROM students WHERE id = :id AND center_id = :cid", {
        ":id": studentId,
        ":cid": center.id,
      });
      if (!row) return res.status(403).json({ error: "No puedes validar alumnos de otro centro" });
    }

    run("UPDATE students SET validated = 1 WHERE id = :id", { ":id": studentId });
    const row = get("SELECT id, validated FROM students WHERE id = :id", { ":id": Number(req.params.id) });
    res.json(row);
  });

  app.post("/api/students/:id/reset-password", authRequired, permissionRequired("studentResetPassword"), roleRequired("centro", "admin"), validate(resetStudentPasswordSchema), (req, res) => {
    const studentId = Number(req.params.id);

    const student = get("SELECT id, user_id, center_id FROM students WHERE id = :id", { ":id": studentId });
    if (!student) return res.status(404).json({ error: "Alumno no encontrado" });

    if (req.user.role === "centro") {
      const center = ensureCenterForUser(req.user.id, `Centro de ${req.user.name}`, "");
      if (student.center_id !== center.id) {
        return res.status(403).json({ error: "No puedes cambiar la clave de alumnos de otro centro" });
      }
    }

    const hash = bcrypt.hashSync(req.body.password, 10);
    run("UPDATE users SET password_hash = :hash WHERE id = :uid", {
      ":hash": hash,
      ":uid": student.user_id,
    });

    return res.json({ ok: true });
  });

  const companySchema = z.object({
    company_name: z.string().min(2).max(200),
    sector: z.string().max(120).default(""),
    city: z.string().max(120).default(""),
  });

  const centerSchema = z.object({
    center_name: z.string().min(2).max(200),
    city: z.string().max(120).default(""),
  });

  app.get("/api/centers/me", authRequired, roleRequired("centro"), (req, res) => {
    const center = ensureCenterForUser(req.user.id, `Centro de ${req.user.name}`, "");
    res.json(center);
  });

  app.put("/api/centers/me", authRequired, roleRequired("centro"), validate(centerSchema), (req, res) => {
    const center = ensureCenterForUser(req.user.id, `Centro de ${req.user.name}`, "");

    run(
      `UPDATE centers SET center_name=:center_name, city=:city WHERE id=:id`,
      {
        ":center_name": req.body.center_name,
        ":city": req.body.city,
        ":id": center.id,
      }
    );

    const updated = get("SELECT * FROM centers WHERE id = :id", { ":id": center.id });
    res.json(updated);
  });

  app.get("/api/companies/me", authRequired, permissionRequired("profile"), roleRequired("empresa"), (req, res) => {
    const company = get("SELECT * FROM companies WHERE user_id = :uid", { ":uid": req.user.id });
    res.json(company);
  });

  app.put("/api/companies/me", authRequired, permissionRequired("profile"), roleRequired("empresa"), validate(companySchema), (req, res) => {
    const exists = get("SELECT id FROM companies WHERE user_id = :uid", { ":uid": req.user.id });
    if (!exists) {
      run(
        `INSERT INTO companies (user_id, company_name, sector, city, created_at)
         VALUES (:user_id, :company_name, :sector, :city, :created_at)`,
        {
          ":user_id": req.user.id,
          ":company_name": req.body.company_name,
          ":sector": req.body.sector,
          ":city": req.body.city,
          ":created_at": nowIso(),
        }
      );
    } else {
      run(
        `UPDATE companies SET company_name=:company_name, sector=:sector, city=:city WHERE user_id=:uid`,
        {
          ":company_name": req.body.company_name,
          ":sector": req.body.sector,
          ":city": req.body.city,
          ":uid": req.user.id,
        }
      );
    }
    const company = get("SELECT * FROM companies WHERE user_id = :uid", { ":uid": req.user.id });
    res.json(company);
  });

  const internshipSchema = z.object({
    title: z.string().min(4).max(200),
    description: z.string().min(10).max(4000),
    hours_total: z.number().int().min(1).max(2000),
    schedule: z.string().max(120).default(""),
    slots: z.number().int().min(1).max(50),
  });

  app.post("/api/internships", authRequired, permissionRequired("internshipCreate"), roleRequired("empresa"), validate(internshipSchema), (req, res) => {
    const company = get("SELECT id FROM companies WHERE user_id = :uid", { ":uid": req.user.id });
    if (!company) return res.status(400).json({ error: "Perfil de empresa incompleto" });

    run(
      `INSERT INTO internships (company_id, title, description, hours_total, schedule, slots, created_at)
       VALUES (:company_id, :title, :description, :hours_total, :schedule, :slots, :created_at)`,
      {
        ":company_id": company.id,
        ":title": req.body.title,
        ":description": req.body.description,
        ":hours_total": req.body.hours_total,
        ":schedule": req.body.schedule,
        ":slots": req.body.slots,
        ":created_at": nowIso(),
      }
    );

    const created = get("SELECT * FROM internships WHERE id = :id", { ":id": lastInsertId() });
    res.status(201).json(created);
  });

  app.get("/api/internships", authRequired, (req, res) => {
    const rows = all(
      `SELECT i.*, c.company_name
       FROM internships i
       JOIN companies c ON c.id = i.company_id
       ORDER BY i.created_at DESC`
    );
    res.json(rows);
  });

  app.post("/api/applications/:internshipId", authRequired, permissionRequired("internshipApply"), (req, res) => {
    const student = get("SELECT id FROM students WHERE user_id = :uid", { ":uid": req.user.id });
    if (!student) return res.status(403).json({ error: "Solo cuentas de alumno pueden postular" });

    const internshipId = Number(req.params.internshipId);
    const internship = get("SELECT id FROM internships WHERE id = :id", { ":id": internshipId });
    if (!internship) return res.status(404).json({ error: "Oferta no encontrada" });

    const exists = get(
      "SELECT id FROM applications WHERE internship_id=:iid AND student_id=:sid",
      { ":iid": internshipId, ":sid": student.id }
    );
    if (exists) return res.status(409).json({ error: "Ya postulaste a esta oferta" });

    run(
      `INSERT INTO applications (internship_id, student_id, status, created_at)
       VALUES (:internship_id, :student_id, 'pendiente', :created_at)`,
      {
        ":internship_id": internshipId,
        ":student_id": student.id,
        ":created_at": nowIso(),
      }
    );

    res.status(201).json({ id: lastInsertId(), status: "pendiente" });
  });

  app.get("/api/applications/my", authRequired, permissionRequired("applicationsOwn"), (req, res) => {
    const student = get("SELECT id FROM students WHERE user_id = :uid", { ":uid": req.user.id });
    if (!student) return res.status(403).json({ error: "Solo cuentas de alumno tienen candidaturas" });
    const rows = all(
      `SELECT a.id, a.status, a.created_at, i.title, c.company_name
       FROM applications a
       JOIN internships i ON i.id = a.internship_id
       JOIN companies c ON c.id = i.company_id
       WHERE a.student_id = :sid
       ORDER BY a.created_at DESC`,
      { ":sid": student.id }
    );
    res.json(rows);
  });

  app.get("/api/applications/internship/:id", authRequired, permissionRequired("applicationsReview"), roleRequired("empresa", "centro", "admin"), (req, res) => {
    const rows = all(
      `SELECT a.id, a.status, a.created_at, s.id AS student_id, u.name AS student_name, u.email AS student_email
       FROM applications a
       JOIN students s ON s.id = a.student_id
       JOIN users u ON u.id = s.user_id
       WHERE a.internship_id = :iid
       ORDER BY a.created_at DESC`,
      { ":iid": Number(req.params.id) }
    );
    res.json(rows);
  });

  const appStatusSchema = z.object({
    status: z.enum(["pendiente", "aceptada", "rechazada"]),
  });

  app.post("/api/applications/:id/status", authRequired, permissionRequired("applicationsStatusUpdate"), roleRequired("empresa", "centro", "admin"), validate(appStatusSchema), (req, res) => {
    run("UPDATE applications SET status=:status WHERE id=:id", {
      ":status": req.body.status,
      ":id": Number(req.params.id),
    });
    const row = get("SELECT id, status FROM applications WHERE id=:id", { ":id": Number(req.params.id) });
    res.json(row);
  });

  const interviewSchema = z.object({
    application_id: z.number().int().min(1),
    interview_at: z.string().min(10).max(40),
    notes: z.string().max(2000).default(""),
  });

  app.post("/api/interviews", authRequired, permissionRequired("interviewCreate"), roleRequired("empresa", "centro", "admin"), validate(interviewSchema), (req, res) => {
    run(
      `INSERT INTO interviews (application_id, interview_at, notes, created_at)
       VALUES (:application_id, :interview_at, :notes, :created_at)`,
      {
        ":application_id": req.body.application_id,
        ":interview_at": req.body.interview_at,
        ":notes": req.body.notes,
        ":created_at": nowIso(),
      }
    );
    res.status(201).json({ id: lastInsertId() });
  });

  app.get("/api/interviews/my", authRequired, (req, res) => {
    const rows = all(
      `SELECT i.id, i.interview_at, i.notes, a.status, u.name AS student_name, inr.title
       FROM interviews i
       JOIN applications a ON a.id = i.application_id
       JOIN students s ON s.id = a.student_id
       JOIN users u ON u.id = s.user_id
       JOIN internships inr ON inr.id = a.internship_id
       ORDER BY i.interview_at ASC`
    );
    res.json(rows);
  });

  const agreementSchema = z.object({
    internship_id: z.number().int().min(1),
    student_id: z.number().int().min(1),
    notes: z.string().max(2000).default(""),
  });

  app.post("/api/agreements", authRequired, permissionRequired("agreementCreate"), roleRequired("centro", "admin"), validate(agreementSchema), (req, res) => {
    let center = get("SELECT id FROM centers WHERE user_id = :uid", { ":uid": req.user.id });
    if (!center) {
      center = { id: 1 };
    }
    run(
      `INSERT INTO agreements (internship_id, student_id, center_id, signed_at, notes, created_at)
       VALUES (:internship_id, :student_id, :center_id, :signed_at, :notes, :created_at)`,
      {
        ":internship_id": req.body.internship_id,
        ":student_id": req.body.student_id,
        ":center_id": center.id,
        ":signed_at": nowIso(),
        ":notes": req.body.notes,
        ":created_at": nowIso(),
      }
    );
    res.status(201).json({ id: lastInsertId() });
  });

  app.get("/api/agreements", authRequired, roleRequired("centro", "empresa", "admin"), (_req, res) => {
    const rows = all(
      `SELECT ag.id, ag.signed_at, ag.notes, inr.title, u.name AS student_name, c.center_name
       FROM agreements ag
       JOIN internships inr ON inr.id = ag.internship_id
       JOIN students s ON s.id = ag.student_id
       JOIN users u ON u.id = s.user_id
       JOIN centers c ON c.id = ag.center_id
       ORDER BY ag.created_at DESC`
    );
    res.json(rows);
  });

  const followupSchema = z.object({
    student_id: z.number().int().min(1),
    content: z.string().min(4).max(3000),
    progress: z.number().int().min(0).max(100),
  });

  app.post("/api/followups", authRequired, permissionRequired("followupCreate"), roleRequired("centro", "empresa", "admin"), validate(followupSchema), (req, res) => {
    run(
      `INSERT INTO followups (student_id, author_user_id, content, progress, created_at)
       VALUES (:student_id, :author_user_id, :content, :progress, :created_at)`,
      {
        ":student_id": req.body.student_id,
        ":author_user_id": req.user.id,
        ":content": req.body.content,
        ":progress": req.body.progress,
        ":created_at": nowIso(),
      }
    );
    res.status(201).json({ id: lastInsertId() });
  });

  app.get("/api/followups/:studentId", authRequired, (req, res) => {
    const rows = all(
      `SELECT f.id, f.content, f.progress, f.created_at, u.name AS author_name
       FROM followups f
       JOIN users u ON u.id = f.author_user_id
       WHERE f.student_id = :sid
       ORDER BY f.created_at DESC`,
      { ":sid": Number(req.params.studentId) }
    );
    res.json(rows);
  });

  const adminInternshipSchema = z.object({
    company_id: z.number().int().min(1),
    title: z.string().min(4).max(200),
    description: z.string().min(10).max(4000),
    hours_total: z.number().int().min(1).max(2000),
    schedule: z.string().max(120).default(""),
    slots: z.number().int().min(1).max(50),
  });

  // =========================
  // ADMIN - COMPANIES CRUD
  // =========================

  app.get(
    "/api/admin/companies",
    authRequired,
    permissionRequired("adminPanel"),
    roleRequired("admin"),
    (req, res) => {
      const page = Number(req.query.page || 1);
      const perPage = Number(req.query.perPage || 10);
      const sortField = req.query.sortField || "id";
      const sortOrder = (req.query.sortOrder || "ASC").toUpperCase() === "DESC" ? "DESC" : "ASC";

      let filter = {};
      try {
        filter = req.query.filter ? JSON.parse(req.query.filter) : {};
      } catch (_e) {
        filter = {};
      }

      const q = String(filter.q || "").trim().toLowerCase();

      const where = [];
      const params = {};

      if (q) {
        where.push(`(
        LOWER(c.company_name) LIKE :q
        OR LOWER(COALESCE(c.sector, '')) LIKE :q
        OR LOWER(COALESCE(c.city, '')) LIKE :q
        OR LOWER(COALESCE(u.email, '')) LIKE :q
      )`);
        params[":q"] = `%${q}%`;
      }

      const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
      const offset = (page - 1) * perPage;

      const totalRow = get(
        `
      SELECT COUNT(*) AS total
      FROM companies c
      JOIN users u ON u.id = c.user_id
      ${whereSql}
      `,
        params
      );

      const sortMap = {
        id: "c.id",
        company_name: "c.company_name",
        sector: "c.sector",
        city: "c.city",
        email: "u.email",
      };

      const safeSortField = sortMap[sortField] || "c.id";

      const rows = all(
        `
      SELECT
        c.id,
        c.company_name,
        c.sector,
        c.city,
        u.email
      FROM companies c
      JOIN users u ON u.id = c.user_id
      ${whereSql}
      ORDER BY ${safeSortField} ${sortOrder}
      LIMIT ${perPage} OFFSET ${offset}
      `,
        params
      );

      return res.json({
        data: rows,
        total: totalRow?.total || 0,
      });
    }
  );

  app.get(
    "/api/admin/companies/:id",
    authRequired,
    permissionRequired("adminPanel"),
    roleRequired("admin"),
    (req, res) => {
      const id = Number(req.params.id);

      const row = get(
        `
      SELECT
        c.id,
        c.company_name,
        c.sector,
        c.city,
        u.email
      FROM companies c
      JOIN users u ON u.id = c.user_id
      WHERE c.id = :id
      `,
        { ":id": id }
      );

      if (!row) return res.status(404).json({ error: "Empresa no encontrada" });

      return res.json({ data: row });
    }
  );

  app.post(
    "/api/admin/companies",
    authRequired,
    permissionRequired("adminPanel"),
    roleRequired("admin"),
    (req, res) => {
      const { company_name, sector = "", city = "", email = "" } = req.body;

      if (!company_name || !String(company_name).trim()) {
        return res.status(400).json({ error: "El nombre de empresa es obligatorio" });
      }

      const createdAt = nowIso();
      const safeEmail = String(email || "").trim().toLowerCase();

      const userEmail = safeEmail || `empresa_${Date.now()}@nextstep.local`;
      const passwordHash = bcrypt.hashSync("Demo1234!", 10);

      run(
        `
      INSERT INTO users (name, email, password_hash, role, created_at)
      VALUES (:name, :email, :password_hash, 'empresa', :created_at)
      `,
        {
          ":name": String(company_name).trim(),
          ":email": userEmail,
          ":password_hash": passwordHash,
          ":created_at": createdAt,
        }
      );

      const userId = lastInsertId();

      run(
        `
      INSERT INTO companies (user_id, company_name, sector, city, created_at)
      VALUES (:user_id, :company_name, :sector, :city, :created_at)
      `,
        {
          ":user_id": userId,
          ":company_name": String(company_name).trim(),
          ":sector": String(sector || "").trim(),
          ":city": String(city || "").trim(),
          ":created_at": createdAt,
        }
      );

      const companyId = lastInsertId();

      const row = get(
        `
      SELECT
        c.id,
        c.company_name,
        c.sector,
        c.city,
        u.email
      FROM companies c
      JOIN users u ON u.id = c.user_id
      WHERE c.id = :id
      `,
        { ":id": companyId }
      );

      return res.status(201).json({ data: row });
    }
  );

  app.put(
    "/api/admin/companies/:id",
    authRequired,
    permissionRequired("adminPanel"),
    roleRequired("admin"),
    (req, res) => {
      const id = Number(req.params.id);
      const { company_name, sector = "", city = "", email = "" } = req.body;

      const existing = get(
        `
      SELECT c.id, c.user_id
      FROM companies c
      WHERE c.id = :id
      `,
        { ":id": id }
      );

      if (!existing) return res.status(404).json({ error: "Empresa no encontrada" });

      run(
        `
      UPDATE companies
      SET company_name = :company_name,
          sector = :sector,
          city = :city
      WHERE id = :id
      `,
        {
          ":id": id,
          ":company_name": String(company_name || "").trim(),
          ":sector": String(sector || "").trim(),
          ":city": String(city || "").trim(),
        }
      );

      if (email && String(email).trim()) {
        run(
          `
        UPDATE users
        SET email = :email
        WHERE id = :user_id
        `,
          {
            ":email": String(email).trim().toLowerCase(),
            ":user_id": existing.user_id,
          }
        );
      }

      const row = get(
        `
      SELECT
        c.id,
        c.company_name,
        c.sector,
        c.city,
        u.email
      FROM companies c
      JOIN users u ON u.id = c.user_id
      WHERE c.id = :id
      `,
        { ":id": id }
      );

      return res.json({ data: row });
    }
  );

  app.delete(
    "/api/admin/companies/:id",
    authRequired,
    permissionRequired("adminPanel"),
    roleRequired("admin"),
    (req, res) => {
      const id = Number(req.params.id);

      const existing = get(
        `
      SELECT c.id, c.user_id
      FROM companies c
      WHERE c.id = :id
      `,
        { ":id": id }
      );

      if (!existing) return res.status(404).json({ error: "Empresa no encontrada" });

      run(`DELETE FROM companies WHERE id = :id`, { ":id": id });
      run(`DELETE FROM users WHERE id = :user_id`, { ":user_id": existing.user_id });

      return res.json({ data: { id } });
    }
  );

  // =========================
  // ADMIN - INTERNSHIPS CRUD
  // =========================

  app.get(
    "/api/admin/internships",
    authRequired,
    permissionRequired("adminPanel"),
    roleRequired("admin"),
    (req, res) => {
      const page = Number(req.query.page || 1);
      const perPage = Number(req.query.perPage || 10);
      const sortField = req.query.sortField || "id";
      const sortOrder = (req.query.sortOrder || "ASC").toUpperCase() === "DESC" ? "DESC" : "ASC";

      let filter = {};
      try {
        filter = req.query.filter ? JSON.parse(req.query.filter) : {};
      } catch (_e) {
        filter = {};
      }

      const q = String(filter.q || "").trim().toLowerCase();

      const where = [];
      const params = {};

      if (q) {
        where.push(`(
        LOWER(i.title) LIKE :q
        OR LOWER(COALESCE(i.description, '')) LIKE :q
        OR LOWER(COALESCE(c.company_name, '')) LIKE :q
      )`);
        params[":q"] = `%${q}%`;
      }

      const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
      const offset = (page - 1) * perPage;

      const totalRow = get(
        `
      SELECT COUNT(*) AS total
      FROM internships i
      JOIN companies c ON c.id = i.company_id
      ${whereSql}
      `,
        params
      );

      const sortMap = {
        id: "i.id",
        title: "i.title",
        hours_total: "i.hours_total",
        slots: "i.slots",
        schedule: "i.schedule",
        company_name: "c.company_name",
        created_at: "i.created_at",
      };

      const safeSortField = sortMap[sortField] || "i.id";

      const rows = all(
        `
      SELECT
        i.id,
        i.company_id,
        i.title,
        i.description,
        i.hours_total,
        i.schedule,
        i.slots,
        i.created_at,
        c.company_name
      FROM internships i
      JOIN companies c ON c.id = i.company_id
      ${whereSql}
      ORDER BY ${safeSortField} ${sortOrder}
      LIMIT ${perPage} OFFSET ${offset}
      `,
        params
      );

      return res.json({
        data: rows,
        total: totalRow?.total || 0,
      });
    }
  );

  app.get(
    "/api/admin/internships/:id",
    authRequired,
    permissionRequired("adminPanel"),
    roleRequired("admin"),
    (req, res) => {
      const id = Number(req.params.id);

      const row = get(
        `
      SELECT
        i.id,
        i.company_id,
        i.title,
        i.description,
        i.hours_total,
        i.schedule,
        i.slots,
        i.created_at,
        c.company_name
      FROM internships i
      JOIN companies c ON c.id = i.company_id
      WHERE i.id = :id
      `,
        { ":id": id }
      );

      if (!row) return res.status(404).json({ error: "Práctica no encontrada" });

      return res.json({ data: row });
    }
  );

  app.post(
    "/api/admin/internships",
    authRequired,
    permissionRequired("adminPanel"),
    roleRequired("admin"),
    validate(adminInternshipSchema),
    (req, res) => {
      const companyId = Number(req.body.company_id);

      const company = get("SELECT id FROM companies WHERE id = :id", { ":id": companyId });
      if (!company) return res.status(400).json({ error: "Empresa no válida" });

      run(
        `
      INSERT INTO internships (company_id, title, description, hours_total, schedule, slots, created_at)
      VALUES (:company_id, :title, :description, :hours_total, :schedule, :slots, :created_at)
      `,
        {
          ":company_id": companyId,
          ":title": req.body.title,
          ":description": req.body.description,
          ":hours_total": Number(req.body.hours_total),
          ":schedule": req.body.schedule || "",
          ":slots": Number(req.body.slots),
          ":created_at": nowIso(),
        }
      );

      const created = get(
        `
      SELECT
        i.id,
        i.company_id,
        i.title,
        i.description,
        i.hours_total,
        i.schedule,
        i.slots,
        i.created_at,
        c.company_name
      FROM internships i
      JOIN companies c ON c.id = i.company_id
      WHERE i.id = :id
      `,
        { ":id": lastInsertId() }
      );

      return res.status(201).json({ data: created });
    }
  );

  app.put(
    "/api/admin/internships/:id",
    authRequired,
    permissionRequired("adminPanel"),
    roleRequired("admin"),
    validate(adminInternshipSchema),
    (req, res) => {
      const id = Number(req.params.id);
      const companyId = Number(req.body.company_id);

      const existing = get("SELECT id FROM internships WHERE id = :id", { ":id": id });
      if (!existing) return res.status(404).json({ error: "Práctica no encontrada" });

      const company = get("SELECT id FROM companies WHERE id = :id", { ":id": companyId });
      if (!company) return res.status(400).json({ error: "Empresa no válida" });

      run(
        `
      UPDATE internships
      SET company_id = :company_id,
          title = :title,
          description = :description,
          hours_total = :hours_total,
          schedule = :schedule,
          slots = :slots
      WHERE id = :id
      `,
        {
          ":id": id,
          ":company_id": companyId,
          ":title": req.body.title,
          ":description": req.body.description,
          ":hours_total": Number(req.body.hours_total),
          ":schedule": req.body.schedule || "",
          ":slots": Number(req.body.slots),
        }
      );

      const updated = get(
        `
      SELECT
        i.id,
        i.company_id,
        i.title,
        i.description,
        i.hours_total,
        i.schedule,
        i.slots,
        i.created_at,
        c.company_name
      FROM internships i
      JOIN companies c ON c.id = i.company_id
      WHERE i.id = :id
      `,
        { ":id": id }
      );

      return res.json({ data: updated });
    }
  );

  app.delete(
    "/api/admin/internships/:id",
    authRequired,
    permissionRequired("adminPanel"),
    roleRequired("admin"),
    (req, res) => {
      const id = Number(req.params.id);

      const existing = get("SELECT id FROM internships WHERE id = :id", { ":id": id });
      if (!existing) return res.status(404).json({ error: "Práctica no encontrada" });

      const applicationsCount = get(
        "SELECT COUNT(*) AS total FROM applications WHERE internship_id = :id",
        { ":id": id }
      );

      const agreementsCount = get(
        "SELECT COUNT(*) AS total FROM agreements WHERE internship_id = :id",
        { ":id": id }
      );

      if ((applicationsCount?.total || 0) > 0 || (agreementsCount?.total || 0) > 0) {
        return res.status(400).json({
          error: "No se puede eliminar una práctica con candidaturas o convenios relacionados",
        });
      }

      run("DELETE FROM internships WHERE id = :id", { ":id": id });

      return res.json({ data: { id } });
    }
  );

  app.use(express.static(path.join(__dirname, "..", "public")));

  app.get("/{*splat}", (req, res) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ error: "Endpoint no encontrado" });
    }

    const indexPath = path.join(__dirname, "..", "public", "index.html");

    if (!fs.existsSync(indexPath)) {
      return res.status(404).json({ error: "Frontend estatico no disponible en este entorno" });
    }

    return res.sendFile(indexPath);
  });

  app.listen(PORT, () => {
    console.log(`NextStep server listening on http://localhost:${PORT}`);
    if (USE_MYSQL) {
      console.log(`DB mode: mysql (${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE})`);
    } else {
      console.log(`DB file: ${DB_PATH}`);
    }
    console.log("Usuarios demo: admin/centro/empresa/alumno @nextstep.local con clave Demo1234!");
  });

  const gracefulFlush = () => {
    try {
      if (!USE_MYSQL && db) {
        saveDb();
      }
    } catch (_e) {
      // ignore flush errors on shutdown
    }
  };

  process.on("SIGINT", gracefulFlush);
  process.on("SIGTERM", gracefulFlush);
  process.on("beforeExit", gracefulFlush);
}

start().catch((err) => {
  console.error("Error al iniciar servidor", err);
  process.exit(1);
});
