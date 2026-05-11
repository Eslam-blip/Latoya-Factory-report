import React, { useState, useEffect } from 'react';
import './index.css';
import { factoryAPI } from './api';
import Report1 from './components/Report1';
import Report2 from './components/Report2';
import Report3 from './components/Report3';
import { Modal, FormField, inputStyle } from './components/UI';

const TABS = [
  { id: 1, label: 'تقرير 1', sublabel: 'Factory Report', icon: '🗂️' },
  { id: 2, label: 'تقرير 2', sublabel: 'Timeline',       icon: '📅' },
  { id: 3, label: 'تقرير 3', sublabel: 'Delay Analysis', icon: '🔴' },
];

export default function App() {
  const [tab, setTab] = useState(1);
  const [factories, setFactories] = useState([]);
  const [selectedFactory, setSelectedFactory] = useState(null);
  const [factoryModalOpen, setFactoryModalOpen] = useState(false);
  const [newFactoryName, setNewFactoryName] = useState('');
  const [addingFactory, setAddingFactory] = useState(false);
  const [deleteFactoryId, setDeleteFactoryId] = useState(null);
  const [editFactoryId, setEditFactoryId] = useState(null);
  const [editFactoryName, setEditFactoryName] = useState('');

  const loadFactories = async () => {
    const data = await factoryAPI.getAll();
    setFactories(data);
    if (data.length && !selectedFactory) setSelectedFactory(data[0].id);
  };

  useEffect(() => { loadFactories(); }, []);

  const deleteFactory = async (id) => {
    await factoryAPI.delete(id);
    setDeleteFactoryId(null);
    if (selectedFactory === id) setSelectedFactory(null);
    loadFactories();
  };

  const updateFactory = async () => {
    if (!editFactoryName.trim()) return;
    await factoryAPI.update(editFactoryId, editFactoryName.trim());
    setEditFactoryId(null);
    loadFactories();
  };

  const addFactory = async () => {
    if (!newFactoryName.trim()) return;
    setAddingFactory(true);
    await factoryAPI.create(newFactoryName.trim());
    setNewFactoryName('');
    setFactoryModalOpen(false);
    setAddingFactory(false);
    loadFactories();
  };

  const selectedFactoryName = factories.find(f => f.id === selectedFactory)?.name || 'كل المصانع';

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--gray-50)' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 220, background:'linear-gradient(180deg,#0D1B2A 0%,#1E3A5F 100%)',
        display:'flex', flexDirection:'column', padding:'24px 0',
        boxShadow:'4px 0 24px rgba(0,0,0,.2)', position:'sticky', top:0, height:'100vh',
        flexShrink:0,
      }}>
        {/* Logo */}
        <div style={{ padding:'0 20px 24px', borderBottom:'1px solid #ffffff18' }}>
          <div style={{ fontSize:22 }}>🏭</div>
          <div style={{ color:'#fff', fontWeight:900, fontSize:15, marginTop:4, lineHeight:1.3 }}>LATOYA</div>
          <div style={{ color:'#7FB3D3', fontSize:11, marginTop:2 }}>LATOYA System</div>
        </div>

        {/* Factory selector */}
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #ffffff18' }}>
          <div style={{ color:'#7FB3D3', fontSize:10, fontWeight:700, marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>المصنع</div>
          <select value={selectedFactory || ''} onChange={e => setSelectedFactory(e.target.value || null)}
            style={{ width:'100%', padding:'7px 10px', background:'#ffffff18', border:'1px solid #ffffff30', borderRadius:8, color:'#fff', fontFamily:'var(--font)', fontSize:12, cursor:'pointer', outline:'none' }}>
            <option value="">كل المصانع</option>
            {factories.map(f => <option key={f.id} value={f.id} style={{ color:'#0D1B2A' }}>{f.name}</option>)}
          </select>
          <button onClick={() => setFactoryModalOpen(true)}
            style={{ marginTop:8, width:'100%', padding:'6px', border:'1px dashed #ffffff40', borderRadius:8, background:'transparent', color:'#7FB3D3', fontFamily:'var(--font)', fontSize:11, cursor:'pointer', transition:'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.background='#ffffff18'; e.currentTarget.style.color='#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#7FB3D3'; }}>
            ➕ إضافة مصنع
          </button>
        </div>

        {/* Nav Tabs */}
        <nav style={{ flex:1, padding:'12px 12px' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                width:'100%', padding:'12px 14px', border:'none', borderRadius:10,
                background: tab === t.id ? 'linear-gradient(135deg,#2E86AB,#1A5276)' : 'transparent',
                cursor:'pointer', display:'flex', alignItems:'center', gap:10,
                marginBottom:4, textAlign:'right', transition:'all .2s',
                boxShadow: tab === t.id ? '0 3px 12px rgba(46,134,171,.4)' : 'none',
              }}
              onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.background = '#ffffff12'; }}
              onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.background = 'transparent'; }}>
              <span style={{ fontSize:18 }}>{t.icon}</span>
              <div>
                <div style={{ color:'#fff', fontWeight:700, fontSize:13, lineHeight:1 }}>{t.label}</div>
                <div style={{ color: tab === t.id ? '#AED6F1' : '#7FB3D3', fontSize:10, marginTop:2 }}>{t.sublabel}</div>
              </div>
              {tab === t.id && <div style={{ marginRight:'auto', width:4, height:4, borderRadius:'50%', background:'#5DADE2' }} />}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding:'16px 20px', borderTop:'1px solid #ffffff18' }}>
          <div style={{ color:'#ffffff40', fontSize:10, textAlign:'center' }}>
            Factory Report v1.0<br />LATOYA
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex:1, overflow:'auto' }}>
        {/* Header */}
        <div style={{
          background:'#fff', padding:'16px 28px',
          borderBottom:'1px solid #E2E8F0', display:'flex',
          alignItems:'center', gap:14, position:'sticky', top:0, zIndex:10,
          boxShadow:'0 2px 8px rgba(0,0,0,.06)',
        }}>
          <span style={{ fontSize:24 }}>{TABS.find(t => t.id === tab)?.icon}</span>
          <div>
            <h1 style={{ fontSize:18, fontWeight:900, color:'#0D1B2A', lineHeight:1 }}>
              {TABS.find(t => t.id === tab)?.label} — {TABS.find(t => t.id === tab)?.sublabel}
            </h1>
            <div style={{ fontSize:12, color:'#94A3B8', marginTop:3 }}>{selectedFactoryName}</div>
          </div>
          <div style={{ marginRight:'auto', display:'flex', gap:8 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{
                  padding:'7px 16px', border: tab === t.id ? '2px solid #2E86AB' : '1.5px solid #E2E8F0',
                  borderRadius:9, background: tab === t.id ? '#EAF4FB' : '#fff',
                  color: tab === t.id ? '#1E3A5F' : '#64748B',
                  fontFamily:'var(--font)', fontSize:12, fontWeight: tab === t.id ? 700 : 500,
                  cursor:'pointer', transition:'all .15s',
                }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Report Content */}
        <div style={{ padding:24 }}>
          {tab === 1 && <Report1 factories={factories} selectedFactory={selectedFactory} onFactoryChange={setSelectedFactory} />}
          {tab === 2 && <Report2 factories={factories} selectedFactory={selectedFactory} />}
          {tab === 3 && <Report3 factories={factories} selectedFactory={selectedFactory} />}
        </div>
      </main>

      {/* Delete Factory Confirm */}
      {deleteFactoryId && (
        <div onClick={() => setDeleteFactoryId(null)} style={{ position:'fixed', inset:0, background:'rgba(13,27,42,.7)', zIndex:1100, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:16, padding:28, width:320, textAlign:'center', boxShadow:'0 16px 48px rgba(0,0,0,.3)' }}>
            <div style={{ fontSize:36, marginBottom:12 }}>⚠️</div>
            <p style={{ fontSize:14, color:'#334155', fontWeight:600, marginBottom:24, lineHeight:1.6 }}>هل أنت متأكد من حذف المصنع؟<br/>كل الموديلات بتاعته هتتحذف!</p>
            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
              <button onClick={() => setDeleteFactoryId(null)} style={{ padding:'9px 20px', border:'1.5px solid #E2E8F0', borderRadius:8, background:'#fff', cursor:'pointer', fontFamily:'var(--font)', fontSize:13, fontWeight:600, color:'#64748B' }}>إلغاء</button>
              <button onClick={() => deleteFactory(deleteFactoryId)} style={{ padding:'9px 20px', border:'none', borderRadius:8, background:'#E74C3C', cursor:'pointer', fontFamily:'var(--font)', fontSize:13, fontWeight:700, color:'#fff' }}>حذف</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Factory Modal */}
      {editFactoryId && (
        <div onClick={() => setEditFactoryId(null)} style={{ position:'fixed', inset:0, background:'rgba(13,27,42,.7)', zIndex:1100, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:16, padding:24, width:360, boxShadow:'0 16px 48px rgba(0,0,0,.3)' }}>
            <h3 style={{ fontSize:16, fontWeight:800, color:'#0D1B2A', marginBottom:16 }}>✏️ تعديل اسم المصنع</h3>
            <input style={{ width:'100%', padding:'9px 12px', border:'1.5px solid #E2E8F0', borderRadius:8, fontSize:13, fontFamily:'var(--font)', marginBottom:16, direction:'rtl' }}
              value={editFactoryName} onChange={e => setEditFactoryName(e.target.value)} />
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button onClick={() => setEditFactoryId(null)} style={{ padding:'9px 20px', border:'1.5px solid #E2E8F0', borderRadius:8, background:'#fff', cursor:'pointer', fontFamily:'var(--font)', fontSize:13, color:'#64748B' }}>إلغاء</button>
              <button onClick={updateFactory} style={{ padding:'9px 20px', border:'none', borderRadius:8, background:'linear-gradient(135deg,#1E3A5F,#2E86AB)', cursor:'pointer', fontFamily:'var(--font)', fontSize:13, fontWeight:700, color:'#fff' }}>💾 حفظ</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Factory Modal */}
      <Modal open={factoryModalOpen} onClose={() => setFactoryModalOpen(false)} title="إضافة مصنع جديد" width={400}>
        <FormField label="اسم المصنع" required>
          <input style={inputStyle} value={newFactoryName} onChange={e => setNewFactoryName(e.target.value)}
            placeholder="مثال: LATOYA"
            onKeyDown={e => e.key === 'Enter' && addFactory()} />
        </FormField>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20 }}>
          <button onClick={() => setFactoryModalOpen(false)} style={{ padding:'9px 20px', border:'1.5px solid #E2E8F0', borderRadius:8, background:'#fff', cursor:'pointer', fontFamily:'var(--font)', fontSize:13, color:'#64748B' }}>إلغاء</button>
          <button onClick={addFactory} disabled={addingFactory}
            style={{ padding:'9px 24px', border:'none', borderRadius:8, background:'linear-gradient(135deg,#1E3A5F,#2E86AB)', cursor:'pointer', fontFamily:'var(--font)', fontSize:13, fontWeight:700, color:'#fff' }}>
            {addingFactory ? '⏳ جاري الإضافة...' : '✅ إضافة المصنع'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
