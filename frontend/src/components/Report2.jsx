import React, { useState, useEffect, useCallback } from 'react';
import { timelineAPI } from '../api';
import { StageBadge, Badge, EmptyState } from './UI';

const STAGES = ['قص','خياطة','تشطيب','تسليم من المصنع','استلام المخزن'];
const STAGE_COLORS = {
  'قص':                 { bg:'#EAFAF1', color:'#27AE60', icon:'✂️' },
  'خياطة':              { bg:'#FEF9E7', color:'#E8871E', icon:'🪡' },
  'تشطيب':              { bg:'#F5EEF8', color:'#8E44AD', icon:'✨' },
  'تسليم من المصنع':    { bg:'#EAF4FB', color:'#2E86AB', icon:'🚚' },
  'استلام المخزن':      { bg:'#F1F5F9', color:'#64748B', icon:'📦' },
};

function getDates(models) {
  if (!models.length) return [];
  const all = models.flatMap(m => [m.start_date, m.expected_delivery]);
  const min = all.reduce((a,b) => a < b ? a : b);
  const max = all.reduce((a,b) => a > b ? a : b);
  const dates = [];
  let cur = new Date(min);
  const end = new Date(max);
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0,10));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

const DAYS_AR = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];

export default function Report2({ factories, selectedFactory }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState('الكل');

  const load = useCallback(async () => {
    setLoading(true);
    const data = await timelineAPI.get({ factory_id: selectedFactory });
    setModels(data);
    setLoading(false);
  }, [selectedFactory]);

  useEffect(() => { load(); }, [load]);

  const filtered = stageFilter === 'الكل' ? models : models.filter(m => m.current_stage === stageFilter);
  const byStage = {};
  STAGES.forEach(s => {
    byStage[s] = filtered.filter(m => m.current_stage === s);
  });

  const dates = getDates(filtered);
  const visibleDates = dates.slice(0, 14); // Show 2 weeks max

  const isInRange = (model, date) => date >= model.start_date && date <= model.expected_delivery;

  return (
    <div className="fade-in">
      {/* Toolbar */}
      <div style={{ background:'#fff', borderRadius:14, padding:'14px 18px', marginBottom:16, display:'flex', gap:12, alignItems:'center', flexWrap:'wrap', boxShadow:'var(--shadow-sm)', border:'1px solid #E2E8F0' }}>
        <select value={stageFilter} onChange={e => setStageFilter(e.target.value)}
          style={{ padding:'8px 12px', border:'1.5px solid #E2E8F0', borderRadius:8, fontFamily:'var(--font)', fontSize:13, color:'#334155', background:'#F8FAFC' }}>
          <option>الكل</option>
          {STAGES.map(s => <option key={s}>{s}</option>)}
        </select>
        <span style={{ fontSize:12, color:'#94A3B8' }}>يعرض أول 14 يوم من الفترة المحددة</span>
      </div>

      {/* Legend */}
      <div style={{ display:'flex', gap:12, marginBottom:16, flexWrap:'wrap' }}>
        {STAGES.map(s => {
          const sc = STAGE_COLORS[s];
          return (
            <div key={s} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#64748B' }}>
              <span style={{ display:'inline-block', width:12, height:12, borderRadius:3, background:sc.color }} />
              {sc.icon} {s}
            </div>
          );
        })}
      </div>

      {/* Gantt Table */}
      <div style={{ background:'#fff', borderRadius:14, overflow:'auto', boxShadow:'var(--shadow-md)', border:'1px solid #E2E8F0' }}>
        {loading ? (
          <div style={{ padding:40, textAlign:'center', color:'#94A3B8' }}>⏳ جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="📅" title="لا توجد بيانات" desc="لا توجد موديلات في هذا الفلتر" />
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12, minWidth: 800 }}>
            <thead>
              <tr style={{ background:'linear-gradient(135deg,#0D1B2A,#1E3A5F)', position:'sticky', top:0, zIndex:2 }}>
                <th style={{ padding:'12px 16px', color:'#fff', fontWeight:700, textAlign:'right', minWidth:180, position:'sticky', right:0, background:'#0D1B2A', zIndex:3 }}>المرحلة / الموديل</th>
                {visibleDates.map(d => {
                  const dt = new Date(d);
                  const isFri = dt.getDay() === 5;
                  const isSat = dt.getDay() === 6;
                  return (
                    <th key={d} style={{
                      padding:'6px 2px', color: (isFri||isSat) ? '#F59E0B' : '#fff',
                      fontWeight:600, textAlign:'center', minWidth:56,
                      borderLeft:'1px solid #1E3A5F',
                    }}>
                      <div style={{ fontSize:11 }}>{d.slice(5)}</div>
                      <div style={{ fontSize:9, opacity:.7 }}>{DAYS_AR[dt.getDay()]}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {STAGES.map(stage => {
                const stageModels = byStage[stage];
                if (!stageModels.length) return null;
                const sc = STAGE_COLORS[stage];
                return (
                  <React.Fragment key={stage}>
                    <tr>
                      <td colSpan={visibleDates.length + 1} style={{ background: sc.bg, padding:'6px 16px', fontWeight:700, color: sc.color, fontSize:12, borderTop:'2px solid #E2E8F0' }}>
                        {sc.icon} {stage} <span style={{ fontSize:10, fontWeight:400, color:'#94A3B8' }}>({stageModels.length} موديل)</span>
                      </td>
                    </tr>
                    {stageModels.map((m, i) => (
                      <tr key={m.id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFBFC', borderBottom:'1px solid #F1F5F9' }}>
                        <td style={{ padding:'8px 16px', position:'sticky', right:0, background: i % 2 === 0 ? '#fff' : '#FAFBFC', zIndex:1, borderLeft:'3px solid ' + sc.color }}>
                          <div style={{ fontWeight:700, color:'#0D1B2A', fontFamily:'var(--mono)', fontSize:11 }}>{m.code}</div>
                          <div style={{ color:'#64748B', fontSize:11, marginTop:1 }}>{m.name}</div>
                          <div style={{ marginTop:3 }}><Badge label={m.delivery_status} size="xs" /></div>
                        </td>
                        {visibleDates.map(d => {
                          const inRange = isInRange(m, d);
                          const isStart = d === m.start_date;
                          const isEnd = d === m.expected_delivery;
                          const delayed = m.delivery_status === 'متأخر';
                          return (
                            <td key={d} style={{
                              padding:'2px', textAlign:'center',
                              borderLeft:'1px solid #F1F5F9',
                            }}>
                              {inRange && (
                                <div style={{
                                  height:24, borderRadius: isStart ? '99px 0 0 99px' : isEnd ? '0 99px 99px 0' : 0,
                                  background: delayed ? '#FDEDEC' : sc.bg,
                                  border: `1px solid ${delayed ? '#E74C3C44' : sc.color + '44'}`,
                                  display:'flex', alignItems:'center', justifyContent:'center',
                                }}>
                                  {(isStart || isEnd) && <span style={{ fontSize:9, fontWeight:700, color: delayed ? '#E74C3C' : sc.color }}>{isStart ? 'بداية' : 'نهاية'}</span>}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
