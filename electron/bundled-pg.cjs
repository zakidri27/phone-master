const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const QUIET = { stdio: "ignore" };

let lastInfo = null;

function pgsqlDir() {
  if (process.env.PGSQL_DIR) return process.env.PGSQL_DIR;
  let base = null;
  try {
    const electron = require("electron");
    if (electron && electron.app && typeof electron.app.getAppPath === "function") {
      base = electron.app.getAppPath();
    }
  } catch {}
  if (!base) base = path.join(__dirname, "..");
  const dir = path.join(base, "vendor", "pgsql");
  return fs.existsSync(path.join(dir, "bin", "postgres.exe")) ? dir : null;
}

function userDataDir() {
  try {
    const electron = require("electron");
    if (electron && electron.app && typeof electron.app.getPath === "function") {
      return electron.app.getPath("userData");
    }
  } catch {}
  return path.join(os.tmpdir(), "phone-master-pg");
}

function freePort(start) {
  const binDir = pgsqlDir();
  for (let p = start; p <= start + 20; p++) {
    const r = spawnSync(path.join(binDir, "bin", "pg_isready.exe"), ["-h", "127.0.0.1", "-p", String(p)], QUIET);
    if (r.status === 2) return p;
  }
  throw new Error("no free port found for built-in database");
}

function initIfNeeded(binDir, dataDir, logDir) {
  if (fs.existsSync(path.join(dataDir, "PG_VERSION"))) return;
  fs.mkdirSync(path.dirname(dataDir), { recursive: true });
  const pwfile = path.join(logDir, "initpw.txt");
  fs.writeFileSync(pwfile, "postgres");
  try {
    const r = spawnSync(
      path.join(binDir, "bin", "initdb.exe"),
      ["-D", dataDir, "-U", "postgres", "--pwfile", pwfile, "-E", "UTF8", "--locale=C", "-A", "scram-sha-256"],
      { ...QUIET, timeout: 180000 }
    );
    if (r.status !== 0) {
      throw new Error("initdb failed with code " + r.status);
    }
  } finally {
    try {
      fs.unlinkSync(pwfile);
    } catch {}
  }
}

function cleanupLeftover(dataDir) {
  const binDir = pgsqlDir();
  if (!fs.existsSync(path.join(dataDir, "postmaster.pid"))) return;
  let pid = null;
  try {
    pid = Number(fs.readFileSync(path.join(dataDir, "postmaster.pid"), "utf8").split(/\r?\n/)[0]);
  } catch {}
  if (pid) {
    const alive = spawnSync("tasklist", ["/FI", `PID eq ${pid}`], { encoding: "utf8" });
    if (alive.stdout && alive.stdout.includes(String(pid))) {
      console.log("[bundled-pg] stopping leftover postgres pid", pid);
      spawnSync(path.join(binDir, "bin", "pg_ctl.exe"), ["stop", "-D", dataDir, "-m", "immediate", "-w", "-t", "30"], { ...QUIET, timeout: 40000 });
      spawnSync("taskkill", ["/PID", String(pid), "/F"], QUIET);
    }
  }
  try {
    fs.unlinkSync(path.join(dataDir, "postmaster.pid"));
  } catch {}
}

function startBundledPg() {
  const binDir = pgsqlDir();
  if (!binDir) throw new Error("built-in database files not found");
  const dataDir = process.env.PG_DATA_DIR || path.join(userDataDir(), "pgdata");
  const logDir = path.dirname(dataDir);
  fs.mkdirSync(logDir, { recursive: true });

  let port = Number(process.env.APP_PG_PORT || 5432);
  const probe = spawnSync(path.join(binDir, "bin", "pg_isready.exe"), ["-h", "127.0.0.1", "-p", String(port)], QUIET);
  if (probe.status !== 2) port = freePort(5432);

  initIfNeeded(binDir, dataDir, logDir);
  cleanupLeftover(dataDir);

  const logFile = path.join(logDir, `postgres-${Date.now()}.log`);
  const start = spawnSync(
    path.join(binDir, "bin", "pg_ctl.exe"),
    ["start", "-D", dataDir, "-l", logFile, "-w", "-t", "120", "-o", `-p ${port} -h 127.0.0.1`],
    { ...QUIET, timeout: 150000 }
  );
  if (start.status !== 0) {
    throw new Error("database start failed with code " + start.status + " — see log: " + logFile);
  }

  const oldLogs = fs
    .readdirSync(logDir)
    .filter(f => /^postgres-\d+\.log$/.test(f))
    .sort();
  while (oldLogs.length > 5) {
    try {
      fs.unlinkSync(path.join(logDir, oldLogs.shift()));
    } catch {}
  }

  lastInfo = { host: "127.0.0.1", port, user: "postgres", password: "postgres", dataDir, binDir, logFile };
  console.log("[bundled-pg] started on port", port);
  return lastInfo;
}

function stopBundledPg() {
  if (!lastInfo) return;
  try {
    const r = spawnSync(
      path.join(lastInfo.binDir, "bin", "pg_ctl.exe"),
      ["stop", "-D", lastInfo.dataDir, "-m", "fast", "-w", "-t", "60"],
      { ...QUIET, timeout: 90000 }
    );
    console.log("[bundled-pg] stop exit:", r.status);
  } catch (e) {
    console.error("[bundled-pg] stop failed:", e);
  } finally {
    lastInfo = null;
  }
}

module.exports = { startBundledPg, stopBundledPg, pgsqlDir };