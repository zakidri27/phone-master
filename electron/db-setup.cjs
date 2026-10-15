const { Client } = require("pg");
const url = require("url");

function parseDatabaseUrl(dbUrl) {
  try {
    const u = new URL(dbUrl);
    return {
      host: u.hostname || "127.0.0.1",
      port: Number(u.port || 5432),
      user: decodeURIComponent(u.username || "postgres"),
      password: decodeURIComponent(u.password || ""),
      database: (u.pathname || "/app_db").replace(/^\//, "") || "app_db",
    };
  } catch {
    return { host: "127.0.0.1", port: 5432, user: "postgres", password: "postgres", database: "app_db" };
  }
}

const DDL = `
CREATE TABLE IF NOT EXISTS products (
  id serial PRIMARY KEY,
  name text NOT NULL,
  brand text NOT NULL,
  model text NOT NULL,
  type text NOT NULL DEFAULT '',
  color text DEFAULT '',
  storage text DEFAULT '',
  ram text DEFAULT '',
  imei text DEFAULT '',
  image text DEFAULT '',
  cost_price numeric(12,2) NOT NULL DEFAULT '0',
  sell_price numeric(12,2) NOT NULL DEFAULT '0',
  quantity integer NOT NULL DEFAULT 0,
  min_quantity integer NOT NULL DEFAULT 1,
  category text NOT NULL DEFAULT 'phone',
  status text NOT NULL DEFAULT 'available',
  condition text NOT NULL DEFAULT 'new',
  last_purchase_qty integer NOT NULL DEFAULT 0,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
CREATE TABLE IF NOT EXISTS product_colors (
  id serial PRIMARY KEY,
  product_id integer NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color text NOT NULL,
  quantity integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS customers (
  id serial PRIMARY KEY,
  name text NOT NULL,
  phone text DEFAULT '',
  email text DEFAULT '',
  address text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamp DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sales (
  id serial PRIMARY KEY,
  invoice_number text NOT NULL UNIQUE,
  customer_id integer REFERENCES customers(id),
  customer_name text DEFAULT 'زبون نقدي',
  total_amount numeric(12,2) NOT NULL DEFAULT '0',
  discount numeric(12,2) NOT NULL DEFAULT '0',
  paid_amount numeric(12,2) NOT NULL DEFAULT '0',
  payment_method text NOT NULL DEFAULT 'cash',
  status text NOT NULL DEFAULT 'completed',
  notes text DEFAULT '',
  created_at timestamp DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sale_items (
  id serial PRIMARY KEY,
  sale_id integer NOT NULL REFERENCES sales(id),
  product_id integer REFERENCES products(id),
  product_name text NOT NULL,
  color text DEFAULT '',
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL DEFAULT '0',
  cost_price numeric(12,2) NOT NULL DEFAULT '0',
  total numeric(12,2) NOT NULL DEFAULT '0'
);
CREATE TABLE IF NOT EXISTS installments (
  id serial PRIMARY KEY,
  sale_id integer NOT NULL REFERENCES sales(id),
  invoice_number text NOT NULL DEFAULT '',
  customer_name text NOT NULL,
  total_amount numeric(12,2) NOT NULL DEFAULT '0',
  down_payment numeric(12,2) NOT NULL DEFAULT '0',
  months integer NOT NULL DEFAULT 1,
  monthly_amount numeric(12,2) NOT NULL DEFAULT '0',
  remaining_amount numeric(12,2) NOT NULL DEFAULT '0',
  status text NOT NULL DEFAULT 'active',
  next_due_date timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
CREATE TABLE IF NOT EXISTS installment_payments (
  id serial PRIMARY KEY,
  installment_id integer NOT NULL REFERENCES installments(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL DEFAULT '0',
  note text DEFAULT '',
  paid_at timestamp DEFAULT now()
);
CREATE TABLE IF NOT EXISTS repairs (
  id serial PRIMARY KEY,
  ticket_number text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  customer_phone text DEFAULT '',
  device_brand text NOT NULL,
  device_model text NOT NULL,
  imei text DEFAULT '',
  problem_description text NOT NULL,
  diagnosis_notes text DEFAULT '',
  repair_cost numeric(12,2) DEFAULT '0',
  parts_cost numeric(12,2) DEFAULT '0',
  advance_payment numeric(12,2) DEFAULT '0',
  status text NOT NULL DEFAULT 'received',
  technician text DEFAULT '',
  estimated_date timestamp,
  completed_date timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
CREATE TABLE IF NOT EXISTS repair_parts (
  id serial PRIMARY KEY,
  repair_id integer NOT NULL REFERENCES repairs(id) ON DELETE CASCADE,
  product_id integer REFERENCES products(id),
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_cost numeric(12,2) NOT NULL DEFAULT '0',
  total numeric(12,2) NOT NULL DEFAULT '0'
);
CREATE TABLE IF NOT EXISTS workers (
  id serial PRIMARY KEY,
  name text NOT NULL,
  salary numeric(12,2) NOT NULL DEFAULT '0',
  role text NOT NULL DEFAULT 'worker',
  pin text NOT NULL DEFAULT '0000',
  allowed_pages text NOT NULL DEFAULT '',
  last_paid_at timestamp,
  created_at timestamp DEFAULT now()
);
CREATE TABLE IF NOT EXISTS expenses (
  id serial PRIMARY KEY,
  title text NOT NULL,
  description text DEFAULT '',
  amount numeric(12,2) NOT NULL DEFAULT '0',
  category text NOT NULL DEFAULT 'other',
  payment_method text NOT NULL DEFAULT 'cash',
  date timestamp DEFAULT now(),
  created_at timestamp DEFAULT now()
);
CREATE TABLE IF NOT EXISTS store_settings (
  id serial PRIMARY KEY,
  store_name text NOT NULL DEFAULT 'متجر الهواتف',
  store_phone text DEFAULT '',
  store_address text DEFAULT '',
  logo text DEFAULT '',
  currency text NOT NULL DEFAULT 'دج',
  tax_rate numeric(5,2) DEFAULT '0',
  receipt_footer text DEFAULT '',
  manager_pin text NOT NULL DEFAULT '0000',
  show_demo_seed boolean NOT NULL DEFAULT true,
  updated_at timestamp DEFAULT now()
);
CREATE TABLE IF NOT EXISTS purchases (
  id serial PRIMARY KEY,
  supplier_name text NOT NULL,
  invoice_number text DEFAULT '',
  total_amount numeric(12,2) NOT NULL DEFAULT '0',
  paid_amount numeric(12,2) NOT NULL DEFAULT '0',
  payment_method text NOT NULL DEFAULT 'cash',
  notes text DEFAULT '',
  created_at timestamp DEFAULT now()
);
CREATE TABLE IF NOT EXISTS purchase_items (
  id serial PRIMARY KEY,
  purchase_id integer NOT NULL REFERENCES purchases(id),
  product_id integer REFERENCES products(id),
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  condition text NOT NULL DEFAULT 'new',
  unit_price numeric(12,2) NOT NULL DEFAULT '0',
  total numeric(12,2) NOT NULL DEFAULT '0'
);
`;

async function createDbAndTables(dbUrl) {
  const cfg = parseDatabaseUrl(dbUrl);
  const admin = new Client({ host: cfg.host, port: cfg.port, user: cfg.user, password: cfg.password, database: "postgres" });
  await admin.connect();
  try {
    const res = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [cfg.database]);
    if (res.rowCount === 0) {
      const ident = cfg.database.replace(/"/g, '""');
      await admin.query(`CREATE DATABASE "${ident}"`);
      console.log("[db-setup] created database:", cfg.database);
    }
  } finally {
    await admin.end();
  }

  const app = new Client({ host: cfg.host, port: cfg.port, user: cfg.user, password: cfg.password, database: cfg.database });
  await app.connect();
  try {
    await app.query(DDL);
    console.log("[db-setup] tables ensured");
  } finally {
    await app.end();
  }
}

function canConnect(host, port, user, password) {
  return new Promise(resolve => {
    const c = new Client({ host, port, user, password, database: "postgres", connectionTimeoutMillis: 3000 });
    c.connect()
      .then(() => {
        c.end().catch(() => {});
        resolve(true);
      })
      .catch(() => resolve(false));
  });
}

async function ensureDatabase() {
  if (process.env.DATABASE_URL) {
    try {
      await createDbAndTables(process.env.DATABASE_URL);
      return { url: process.env.DATABASE_URL, bundled: false };
    } catch (e) {
      console.error("[db-setup] configured DATABASE_URL failed, falling back to built-in:", e.message);
    }
  }

  const externalUrl = "postgresql://postgres:postgres@127.0.0.1:5432/app_db";
  if (process.env.APP_FORCE_BUNDLED_PG !== "1" && (await canConnect("127.0.0.1", 5432, "postgres", "postgres"))) {
    await createDbAndTables(externalUrl);
    return { url: externalUrl, bundled: false };
  }

  const { startBundledPg } = require("./bundled-pg.cjs");
  const info = startBundledPg();
  const bundledUrl = `postgresql://${info.user}:${info.password}@${info.host}:${info.port}/app_db`;
  await createDbAndTables(bundledUrl);
  return { url: bundledUrl, bundled: true };
}

module.exports = { ensureDatabase };