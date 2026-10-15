const { app, BrowserWindow, session, dialog, Menu } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { ensureDatabase } = require("./db-setup.cjs");
const { stopBundledPg } = require("./bundled-pg.cjs");

const PORT = Number(process.env.APP_PORT || 3179);
const appPath = app.getAppPath();
const isPackaged = app.isPackaged;

const HOSTS_ALLOWED = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);

function loadEnv() {
  try {
    const envFile = path.join(appPath, ".env");
    if (fs.existsSync(envFile)) {
      for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {}
  // مجلد الصور: مكان ثابت قابل للكتابة خارج مجلد التثبيت
  try {
    const uploadDir = path.join(app.getPath("userData"), "uploads");
    fs.mkdirSync(uploadDir, { recursive: true });
    process.env.UPLOAD_DIR = uploadDir;
    // ترحيل الصور الموجودة من مجلد المشروع عند أول تشغيل فقط
    const srcUploads = path.join(appPath, "public", "uploads");
    if (fs.existsSync(srcUploads) && fs.readdirSync(uploadDir).length === 0) {
      for (const f of fs.readdirSync(srcUploads)) {
        const src = path.join(srcUploads, f);
        if (fs.statSync(src).isFile()) fs.copyFileSync(src, path.join(uploadDir, f));
      }
    }
  } catch (e) {
    console.error("[desktop] uploads dir setup failed:", e);
  }
}

function startNextServer() {
  const nextBin = path.join(appPath, "node_modules", "next", "dist", "bin", "next");
  if (!fs.existsSync(nextBin)) {
    throw new Error("next/dist/bin/next not found — run `npm run build` first");
  }
  try {
    process.env.NODE_ENV = "production";
    process.env.NEXT_TELEMETRY_DISABLED = "1";
    try {
      process.chdir(appPath);
    } catch {}
    process.argv = [process.argv[0], "next", "start", "-p", String(PORT), "-H", "127.0.0.1"];
    require(nextBin);
    return;
  } catch (err) {
    console.error("[desktop] in-process next failed, falling back to system node:", err);
  }
  const child = spawn("node", ["node_modules/next/dist/bin/next", "start", "-p", String(PORT), "-H", "127.0.0.1"], {
    cwd: appPath,
    env: { ...process.env, NODE_ENV: "production", NEXT_TELEMETRY_DISABLED: "1" },
    stdio: "inherit",
    windowsHide: true,
  });
  child.on("exit", code => {
    console.error("[desktop] next server exited with code", code);
  });
}

function waitForServer(timeoutMs = 60000) {
  const started = Date.now();
  return new Promise(resolve => {
    const tryOnce = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:${PORT}/api/health`);
        if (res.ok) return resolve(true);
      } catch {}
      if (Date.now() - started > timeoutMs) return resolve(false);
      setTimeout(tryOnce, 500);
    };
    tryOnce();
  });
}

function blockExternalNetwork(win) {
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    try {
      const url = new URL(details.url);
      if (url.protocol === "http:" || url.protocol === "https:" || url.protocol === "ws:" || url.protocol === "wss:") {
        if (HOSTS_ALLOWED.has(url.hostname)) return callback({});
        return callback({ cancel: true });
      }
    } catch {}
    callback({});
  });

  win.webContents.on("will-navigate", (event, url) => {
    try {
      const u = new URL(url);
      if (u.protocol === "http:" && HOSTS_ALLOWED.has(u.hostname)) return;
    } catch {}
    event.preventDefault();
  });

  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#0f172a",
    icon: path.join(appPath, "public", "logo.png"),
    title: "فون ماستر",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.once("ready-to-show", () => win.show());
  win.webContents.on("did-fail-load", (_e, code, desc) => {
    if (code === -3) return;
    dialog.showErrorBox("فون ماستر", `تعذر تحميل التطبيق: ${desc}`);
  });

  win.webContents.on("before-input-event", (event, input) => {
    if (input.type !== "keyDown") return;
    const key = (input.key || "").toLowerCase();
    if (input.key === "F12") {
      event.preventDefault();
      return;
    }
    if (input.key === "F11") {
      event.preventDefault();
      win.setFullScreen(!win.isFullScreen());
      return;
    }
    if (input.control && input.shift && ["i", "j", "c"].includes(key)) {
      event.preventDefault();
      return;
    }
    if (input.control && key === "u") {
      event.preventDefault();
    }
  });

  win.webContents.on("devtools-opened", () => win.webContents.closeDevTools());

  blockExternalNetwork(win);
  win.loadURL(`http://127.0.0.1:${PORT}`);
  return win;
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  let mainCreated = false;

app.whenReady().then(async () => {
    Menu.setApplicationMenu(null);
    loadEnv();
    let splash = null;
    try {
      splash = new BrowserWindow({ width: 420, height: 180, frame: false, resizable: false, alwaysOnTop: true, show: false, backgroundColor: "#0f172a" });
      splash.loadURL(
        "data:text/html;charset=utf-8," +
          encodeURIComponent(
            '<html dir="rtl"><body style="margin:0;background:#0f172a;color:#e2e8f0;font-family:Tahoma;display:flex;align-items:center;justify-content:center;height:100vh;font-size:18px">جاري تجهيز قاعدة البيانات، انتظر قليلاً...</body></html>'
          )
      );
      splash.once("ready-to-show", () => splash.show());
    } catch (e) {
      console.error("[desktop] splash failed:", e);
    }
    let db;
    try {
      db = await ensureDatabase();
      if (db.url) process.env.DATABASE_URL = db.url;
    } catch (err) {
      console.error("[desktop] database setup failed:", err);
      if (splash) splash.destroy();
      dialog.showErrorBox(
        "فون ماستر",
        "تعذر تجهيز قاعدة البيانات على هذا الجهاز.\n\nقد يكون سبب المشكلة:\n- برنامج مكافحة الفيروسات يمنع قاعدة البيانات المدمجة\n- المنافذ 5432-5452 مشغولة بالكامل\n\nأعد تشغيل التطبيق، أو إن أمكن أنشئ ملف .env بجانب التطبيق يحتوي:\nDATABASE_URL=postgresql://postgres:كلمة_المرور@127.0.0.1:5432/app_db"
      );
      app.quit();
      return;
    }
    startNextServer();
    const ok = await waitForServer();
    if (splash) splash.destroy();
    if (!ok) {
      dialog.showErrorBox("فون ماستر", "تعذر تشغيل الخادم المحلي — تأكد من اكتمال التثبيت بشكل صحيح.");
      app.quit();
      return;
    }
    createWindow();
    mainCreated = true;
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on("will-quit", () => {
    stopBundledPg();
  });

  app.on("window-all-closed", () => {
    if (mainCreated) app.quit();
  });
}