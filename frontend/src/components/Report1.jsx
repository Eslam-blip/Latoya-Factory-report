import React, { useState, useEffect, useCallback } from 'react';
import { modelAPI, factoryAPI, statsAPI } from '../api';
import { Badge, StageBadge, ProgressBar, KpiCard, ConfirmDialog, EmptyState } from './UI';
import ModelForm from './ModelForm';

const STAGES = ['الكل','قص','خياطة','تشطيب','تسليم من المصنع','استلام المخزن'];
const SEASONS = ['الكل','S 2026','W 2027','S 2027','W 2028','S 2028'];
const TYPES  = ['الكل','أوردر','عينة'];
const STATUS = ['الكل','في الموعد','متأخر','تم التسليم'];

export default function Report1({ factories, selectedFactory, onFactoryChange }) {
  const [models, setModels] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({ type:'الكل', stage:'الكل', status:'الكل', season:'الكل' });
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editModel, setEditModel] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = {};
    if (selectedFactory) params.factory_id = selectedFactory;
    if (filters.type !== 'الكل') params.type = filters.type;
    if (filters.stage !== 'الكل') params.stage = filters.stage;
    if (filters.status !== 'الكل') params.delivery_status = filters.status;
    if (filters.season !== 'الكل') params.season = filters.season;
    const [m, s] = await Promise.all([modelAPI.getAll(params), statsAPI.get(selectedFactory)]);
    setModels(m); setStats(s); setLoading(false);
  }, [selectedFactory, filters]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    await modelAPI.delete(deleteId);
    setDeleteId(null);
    load();
  };

  const delayColor = (status, days) => {
    if (status === 'تم التسليم') return '#27AE60';
    if (status === 'متأخر') return '#E74C3C';
    return '#27AE60';
  };

  return (
    <div className="fade-in">
      {/* KPI Cards */}
      {stats && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
          <KpiCard label="إجمالي الموديلات" value={stats.total}   color="#2E86AB" bg="#EAF4FB" icon="🗂️" />
          <KpiCard label="أوردرات (إنتاج)"  value={stats.orders}  color="#27AE60" bg="#EAFAF1" icon="📦" />
          <KpiCard label="عينات"             value={stats.samples} color="#E8871E" bg="#FEF9E7" icon="👗" />
          <KpiCard label="متأخر"             value={stats.delayed} color="#E74C3C" bg="#FDEDEC" icon="⚠️" />
        </div>
      )}

      {/* Toolbar */}
      <div style={{ background:'#fff', borderRadius:14, padding:'14px 18px', marginBottom:16, display:'flex', gap:12, alignItems:'center', flexWrap:'wrap', boxShadow:'var(--shadow-sm)', border:'1px solid #E2E8F0' }}>
        <select value={selectedFactory || ''} onChange={e => onFactoryChange(e.target.value || null)}
          style={{ padding:'8px 12px', border:'1.5px solid #E2E8F0', borderRadius:8, fontFamily:'var(--font)', fontSize:13, color:'#334155', background:'#F8FAFC', cursor:'pointer' }}>
          <option value="">كل المصانع</option>
          {factories.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>

        {[['type', TYPES, 'النوع'], ['stage', STAGES, 'المرحلة'], ['status', STATUS, 'الحالة']].map(([key, opts, lbl]) => (
          <select key={key} value={filters[key]} onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
            style={{ padding:'8px 12px', border:'1.5px solid #E2E8F0', borderRadius:8, fontFamily:'var(--font)', fontSize:13, color:'#334155', background:'#F8FAFC', cursor:'pointer' }}>
            {opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}

        <div style={{ marginRight:'auto' }}>
          <button onClick={() => { setEditModel(null); setFormOpen(true); }}
            style={{ padding:'9px 20px', background:'linear-gradient(135deg,#1E3A5F,#2E86AB)', border:'none', borderRadius:9, color:'#fff', fontFamily:'var(--font)', fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6, boxShadow:'0 3px 12px #2E86AB44' }}>
            ➕ إضافة موديل
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', boxShadow:'var(--shadow-md)', border:'1px solid #E2E8F0' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ background:'linear-gradient(135deg,#0D1B2A,#1E3A5F)' }}>
              {['الصورة','الكود','الاسم','النوع','الموسم','المرحلة','التقدم','البداية','التسليم المتوقع','الحالة','التأخير','إجراءات'].map(h => (
                <th key={h} style={{ padding:'13px 14px', color:'#fff', fontWeight:700, fontSize:12, textAlign:'center', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({length:5}).map((_, i) => (
                <tr key={i}>
                  {Array.from({length:10}).map((_, j) => (
                    <td key={j} style={{ padding:'12px 14px' }}>
                      <div className="skeleton" style={{ height:16, borderRadius:4 }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : models.length === 0 ? (
              <tr><td colSpan={12}><EmptyState icon="📭" title="لا توجد موديلات" desc="اضغط على + إضافة موديل لبدء الإضافة" /></td></tr>
            ) : models.map((m, idx) => (
              <React.Fragment key={m.id}>
                <tr onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
                  style={{ background: idx % 2 === 0 ? '#fff' : '#F8FAFC', borderBottom:'1px solid #F1F5F9', cursor:'pointer', transition:'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#EAF4FB'}
                  onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#F8FAFC'}>
                  <td style={{ padding:'8px 10px', textAlign:'center' }}>
                    {m.image_data
                      ? <img src={m.image_data} alt={m.name} style={{ width:44, height:44, borderRadius:8, objectFit:'cover', border:'1.5px solid #E2E8F0' }} />
                      : <div style={{ width:44, height:44, borderRadius:8, background:'#F1F5F9', border:'1.5px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, margin:'auto' }}>👗</div>
                    }
                  </td>
                  <td style={{ padding:'12px 14px', textAlign:'center', fontWeight:700, fontFamily:'var(--mono)', color:'#1E3A5F', fontSize:12 }}>{m.code}</td>
                  <td style={{ padding:'12px 14px', textAlign:'center', fontWeight:600 }}>{m.name}</td>
                  <td style={{ padding:'12px 14px', textAlign:'center' }}><Badge label={m.type} /></td>
                  <td style={{ padding:'12px 14px', textAlign:'center' }}>
                    {m.season
                      ? <span style={{ background: m.season?.startsWith('S ') ? '#EAF4FB' : '#F5EEF8', color: m.season?.startsWith('S ') ? '#2E86AB' : '#8E44AD', border: `1px solid ${m.season?.startsWith('S ') ? '#AED6F1' : '#D2B4DE'}`, borderRadius:99, fontSize:10, fontWeight:700, padding:'2px 10px' }}>{m.season}</span>
                      : <span style={{ color:'#94A3B8', fontSize:11 }}>-</span>
                    }
                  </td>
                  <td style={{ padding:'12px 14px', textAlign:'center' }}><StageBadge stage={m.current_stage} /></td>
                  <td style={{ padding:'12px 20px', minWidth:140 }}><ProgressBar value={m.progress} /></td>
                  <td style={{ padding:'12px 14px', textAlign:'center', color:'#64748B', fontSize:12 }}>{m.start_date}</td>
                  <td style={{ padding:'12px 14px', textAlign:'center', color:'#64748B', fontSize:12 }}>{m.expected_delivery}</td>
                  <td style={{ padding:'12px 14px', textAlign:'center' }}><Badge label={m.delivery_status} /></td>
                  <td style={{ padding:'12px 14px', textAlign:'center', fontWeight:700, fontSize:12, color: delayColor(m.delivery_status, m.delay_days), fontFamily:'var(--mono)' }}>
                    {m.delivery_status === 'متأخر' ? `${m.delay_days} أيام` : m.delivery_status === 'تم التسليم' ? '✓' : '-'}
                  </td>
                  <td style={{ padding:'12px 14px', textAlign:'center' }}>
                    <div style={{ display:'flex', gap:6, justifyContent:'center' }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => { setEditModel(m); setFormOpen(true); }}
                        title="تعديل"
                        style={{ padding:'5px 10px', border:'1px solid #E2E8F0', borderRadius:6, background:'#F8FAFC', cursor:'pointer', fontSize:12 }}>✏️</button>
                      <button onClick={() => setDeleteId(m.id)}
                        title="حذف"
                        style={{ padding:'5px 10px', border:'1px solid #FEE2E2', borderRadius:6, background:'#FFF5F5', cursor:'pointer', fontSize:12 }}>🗑️</button>
                    </div>
                  </td>
                </tr>
                {expandedId === m.id && (
                  <tr style={{ background:'#F0F7FF' }}>
                    <td colSpan={12} style={{ padding:'16px 24px' }}>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, fontSize:13 }}>
                        {m.delay_reason && <div><strong style={{ color:'#E74C3C' }}>سبب التأخير:</strong> {m.delay_reason}</div>}
                        {m.responsible_party && <div><strong style={{ color:'#E8871E' }}>المسؤول:</strong> {m.responsible_party}</div>}
                        {m.notes && <div><strong style={{ color:'#2E86AB' }}>ملاحظات:</strong> {m.notes}</div>}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        <div style={{ padding:'10px 18px', borderTop:'1px solid #F1F5F9', color:'#94A3B8', fontSize:11 }}>
          إجمالي النتائج: {models.length} موديل
        </div>
      </div>

      <ModelForm open={formOpen} onClose={() => setFormOpen(false)} model={editModel} factoryId={selectedFactory || factories[0]?.id} onSaved={load} />
      <ConfirmDialog open={!!deleteId} message="هل أنت متأكد من حذف هذا الموديل؟ لن يمكن استرجاعه." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
