const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'factory.db');

app.use(cors());
app.use(express.json());

let db;

async function initDB() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS factories (
      id TEXT PRIMARY KEY, name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS models (
      id TEXT PRIMARY KEY, factory_id TEXT NOT NULL,
      code TEXT NOT NULL, name TEXT NOT NULL,
      type TEXT NOT NULL, current_stage TEXT NOT NULL,
      progress INTEGER DEFAULT 0,
      start_date TEXT NOT NULL, expected_delivery TEXT NOT NULL,
      delivery_status TEXT DEFAULT 'في الموعد',
      delay_days INTEGER DEFAULT 0,
      delay_reason TEXT, responsible_party TEXT, notes TEXT,
      season TEXT,
      image_data TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);
  saveDB();

  const count = query('SELECT COUNT(*) as c FROM factories')[0]?.c || 0;
  if (count === 0) {
    const fid = 'factory-1';
    run('INSERT INTO factories (id, name) VALUES (?, ?)', [fid, 'LATOYA']);
    [
      [uuidv4(),fid,'MOD-101','جاكيت كتان','أوردر','خياطة',60,'2024-04-20','2024-05-05','متأخر',2,'المصنع متأخر في الخياطة','المصنع',null,'SS2024',null],
      [uuidv4(),fid,'MOD-102','هودي قطني','أوردر','تشطيب',80,'2024-04-18','2024-05-02','في الموعد',0,null,null,null,'SS2024',null],
      [uuidv4(),fid,'MOD-103','قميص رجالي','عينة','قص',30,'2024-04-25','2024-05-08','في الموعد',0,null,null,null,'SS2024',null],
      [uuidv4(),fid,'MOD-104','تي شيرت مطبوع','أوردر','استلام المخزن',100,'2024-04-10','2024-04-28','تم التسليم',0,null,null,null,'SS2024',null],
      [uuidv4(),fid,'MOD-105','بنطال كارجو','عينة','خياطة',55,'2024-04-22','2024-05-06','متأخر',3,'تأخير صرف خام','التخطيط / المخزن',null,'FW2024',null],
      [uuidv4(),fid,'MOD-107','قميص دنيم','أوردر','قص',25,'2024-04-22','2024-05-10','متأخر',2,'تأخير موافقة الفاشون بعد الفيتنج','الفاشون ديزاين',null,'FW2024',null],
      [uuidv4(),fid,'MOD-108','تي شيرت مطبوع','أوردر','تشطيب',70,'2024-04-15','2024-05-03','متأخر',4,'تأخير في النقل','النقل والشحن',null,'FW2024',null],
      [uuidv4(),fid,'MOD-110','بنطال كتان','أوردر','تسليم من المصنع',90,'2024-04-12','2024-04-30','متأخر',5,'المصنع متأخر في التسليم','المصنع',null,'SS2024',null],
      [uuidv4(),fid,'MOD-114','جاكيت هينز','عينة','قص',15,'2024-04-28','2024-05-12','متأخر',5,'تأخير صرف خام','التخطيط / المخزن',null,'FW2024',null],
    ].forEach(m => run('INSERT INTO models (id,factory_id,code,name,type,current_stage,progress,start_date,expected_delivery,delivery_status,delay_days,delay_reason,responsible_party,notes,season,image_data) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', m));
    saveDB();
  }
}

function saveDB() {
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDB();
}

function query(sql, params = []) {
  const res = db.exec(sql, params);
  if (!res.length) return [];
  const { columns, values } = res[0];
  return values.map(row => Object.fromEntries(columns.map((c, i) => [c, row[i]])));
}

function queryOne(sql, params = []) {
  return query(sql, params)[0] || null;
}

// ── Factories ──────────────────────────────────────────────────────────────────
app.get('/api/factories', (_, res) => res.json(query('SELECT * FROM factories ORDER BY name')));
app.post('/api/factories', (req, res) => {
  if (!req.body.name) return res.status(400).json({ error: 'الاسم مطلوب' });
  const id = uuidv4();
  run('INSERT INTO factories (id, name) VALUES (?, ?)', [id, req.body.name]);
  res.status(201).json({ id, name: req.body.name });
});
app.put('/api/factories/:id', (req, res) => {
  run('UPDATE factories SET name = ? WHERE id = ?', [req.body.name, req.params.id]);
  res.json({ success: true });
});
app.delete('/api/factories/:id', (req, res) => {
  run('DELETE FROM models WHERE factory_id = ?', [req.params.id]);
  run('DELETE FROM factories WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// ── Models ─────────────────────────────────────────────────────────────────────
app.get('/api/models', (req, res) => {
  const { factory_id, type, delivery_status, stage } = req.query;
  let sql = 'SELECT * FROM models WHERE 1=1';
  const p = [];
  if (factory_id)      { sql += ' AND factory_id = ?';      p.push(factory_id); }
  if (type)            { sql += ' AND type = ?';             p.push(type); }
  if (delivery_status) { sql += ' AND delivery_status = ?';  p.push(delivery_status); }
  if (stage)           { sql += ' AND current_stage = ?';    p.push(stage); }
  if (req.query.season){ sql += ' AND season = ?';           p.push(req.query.season); }
  sql += ' ORDER BY created_at DESC';
  res.json(query(sql, p));
});

app.get('/api/models/:id', (req, res) => {
  const m = queryOne('SELECT * FROM models WHERE id = ?', [req.params.id]);
  if (!m) return res.status(404).json({ error: 'غير موجود' });
  res.json(m);
});

app.post('/api/models', (req, res) => {
  const { factory_id, code, name, type, current_stage, progress, start_date, expected_delivery, delivery_status, delay_days, delay_reason, responsible_party, notes, season, image_data } = req.body;
  if (!factory_id || !code || !name || !type || !current_stage || !start_date || !expected_delivery)
    return res.status(400).json({ error: 'الحقول الأساسية مطلوبة' });
  const id = uuidv4();
  run('INSERT INTO models (id,factory_id,code,name,type,current_stage,progress,start_date,expected_delivery,delivery_status,delay_days,delay_reason,responsible_party,notes,season,image_data) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
    [id, factory_id, code, name, type, current_stage, progress||0, start_date, expected_delivery, delivery_status||'في الموعد', delay_days||0, delay_reason||null, responsible_party||null, notes||null, season||null, image_data||null]);
  res.status(201).json({ id, ...req.body });
});

app.put('/api/models/:id', (req, res) => {
  const { code, name, type, current_stage, progress, start_date, expected_delivery, delivery_status, delay_days, delay_reason, responsible_party, notes, season, image_data } = req.body;
  run('UPDATE models SET code=?,name=?,type=?,current_stage=?,progress=?,start_date=?,expected_delivery=?,delivery_status=?,delay_days=?,delay_reason=?,responsible_party=?,notes=?,season=?,image_data=?,updated_at=datetime("now") WHERE id=?',
    [code, name, type, current_stage, progress, start_date, expected_delivery, delivery_status, delay_days||0, delay_reason||null, responsible_party||null, notes||null, season||null, image_data||null, req.params.id]);
  res.json({ success: true });
});

app.delete('/api/models/:id', (req, res) => {
  run('DELETE FROM models WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// ── Stats ──────────────────────────────────────────────────────────────────────
app.get('/api/stats', (req, res) => {
  const { factory_id } = req.query;
  const w = factory_id ? ' AND factory_id = ?' : '';
  const p = factory_id ? [factory_id] : [];
  res.json({
    total:          queryOne(`SELECT COUNT(*) as c FROM models WHERE 1=1${w}`, p)?.c || 0,
    orders:         queryOne(`SELECT COUNT(*) as c FROM models WHERE type='أوردر'${w}`, p)?.c || 0,
    samples:        queryOne(`SELECT COUNT(*) as c FROM models WHERE type='عينة'${w}`, p)?.c || 0,
    delayed:        queryOne(`SELECT COUNT(*) as c FROM models WHERE delivery_status='متأخر'${w}`, p)?.c || 0,
    totalDelayDays: queryOne(`SELECT COALESCE(SUM(delay_days),0) as s FROM models WHERE delivery_status='متأخر'${w}`, p)?.s || 0,
    byStage:        query(`SELECT current_stage, COUNT(*) as count FROM models WHERE 1=1${w} GROUP BY current_stage`, p),
    byResponsible:  query(`SELECT responsible_party, SUM(delay_days) as total_days FROM models WHERE delivery_status='متأخر' AND responsible_party IS NOT NULL${w} GROUP BY responsible_party`, p),
    byReason:       query(`SELECT delay_reason, COUNT(*) as count FROM models WHERE delivery_status='متأخر' AND delay_reason IS NOT NULL${w} GROUP BY delay_reason`, p),
  });
});

// ── Timeline ───────────────────────────────────────────────────────────────────
app.get('/api/timeline', (req, res) => {
  const { factory_id } = req.query;
  const w = factory_id ? ' AND factory_id = ?' : '';
  const p = factory_id ? [factory_id] : [];
  res.json(query(`SELECT * FROM models WHERE 1=1${w} ORDER BY start_date ASC`, p));
});

// ── Start ──────────────────────────────────────────────────────────────────────
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n✅  API → http://localhost:${PORT}`);
    console.log(`📦  DB  → ${DB_PATH}\n`);
  });
}).catch(console.error);
