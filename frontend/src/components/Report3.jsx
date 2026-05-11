import React, { useState, useEffect, useCallback } from 'react';
import { modelAPI, statsAPI } from '../api';
import { Badge, StageBadge, EmptyState } from './UI';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';

const COLORS = { 'المصنع':'#E74C3C', 'التخطيط / المخزن':'#E8871E', 'الفاشون ديزاين':'#8E44AD', 'النقل والشحن':'#2E86AB' };
const CHART_COLORS = ['#E74C3C','#E8871E','#8E44AD','#2E86AB'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:8, padding:'8px 14px', fontSize:12, fontFamily:'var(--font)', boxShadow:'var(--shadow-md)' }}>
        <strong>{payload[0].name}</strong>: {payload[0].value}
      </div>
    );
  }
  return null;
};

export default function Report3({ factories, selectedFactory }) {
  const [models, setModels] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [m, s] = await Promise.all([
      modelAPI.getAll({ factory_id: selectedFactory, delivery_status: 'متأخر' }),
      statsAPI.get(selectedFactory),
    ]);
    setModels(m); setStats(s); setLoading(false);
  }, [selectedFactory]);

  useEffect(() => { load(); }, [load]);

  const pieData = stats?.byResponsible?.map(r => ({ name: r.responsible_party, value: r.total_days })) || [];
  const barData = stats?.byResponsible?.map(r => ({ name: r.responsible_party, أيام: r.total_days })) || [];

  const totalDelayDays = stats?.totalDelayDays || 0;
  const delayedCount  = stats?.delayed || 0;

  return (
    <div className="fade-in">
      {/* KPI Row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        <div style={{ gridColumn:'span 2', background:'#FDEDEC', borderRadius:14, padding:'20px 24px', border:'1.5px solid #F1948A22', display:'flex', alignItems:'center', gap:16, boxShadow:'0 2px 12px #E74C3C18' }}>
          <span style={{ fontSize:36 }}>⚠️</span>
          <div>
            <div style={{ fontSize:36, fontWeight:900, color:'#E74C3C', fontFamily:'var(--mono)', lineHeight:1 }}>{totalDelayDays}</div>
            <div style={{ fontSize:13, color:'#64748B', fontWeight:600, marginTop:2 }}>إجمالي أيام التأخير</div>
          </div>
        </div>
        <div style={{ gridColumn:'span 2', background:'#FEF9E7', borderRadius:14, padding:'20px 24px', border:'1.5px solid #FAD7A022', display:'flex', alignItems:'center', gap:16, boxShadow:'0 2px 12px #E8871E18' }}>
          <span style={{ fontSize:36 }}>📦</span>
          <div>
            <div style={{ fontSize:36, fontWeight:900, color:'#E8871E', fontFamily:'var(--mono)', lineHeight:1 }}>{delayedCount}</div>
            <div style={{ fontSize:13, color:'#64748B', fontWeight:600, marginTop:2 }}>إجمالي الموديلات المتأخرة</div>
          </div>
        </div>
      </div>

      {/* Delay Table */}
      <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', boxShadow:'var(--shadow-md)', border:'1px solid #E2E8F0', marginBottom:24 }}>
        <div style={{ padding:'14px 20px', background:'linear-gradient(135deg,#C0392B,#E74C3C)', display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:16 }}>🔴</span>
          <span style={{ color:'#fff', fontWeight:800, fontSize:15 }}>تفاصيل الموديلات المتأخرة</span>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ background:'#FFF5F5' }}>
              {['الكود','الاسم','المرحلة','سبب التأخير','المسؤول','أيام التأخير'].map(h => (
                <th key={h} style={{ padding:'11px 16px', color:'#E74C3C', fontWeight:700, fontSize:12, textAlign:'center', borderBottom:'2px solid #FECACA' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding:40, textAlign:'center', color:'#94A3B8' }}>⏳ جاري التحميل...</td></tr>
            ) : models.length === 0 ? (
              <tr><td colSpan={6}><EmptyState icon="🎉" title="لا توجد موديلات متأخرة!" desc="كل الموديلات في الموعد" /></td></tr>
            ) : models.map((m, i) => (
              <tr key={m.id} style={{ background: i%2===0 ? '#fff' : '#FFF8F8', borderBottom:'1px solid #FEF2F2' }}>
                <td style={{ padding:'11px 16px', textAlign:'center', fontWeight:700, fontFamily:'var(--mono)', color:'#E74C3C', fontSize:12 }}>{m.code}</td>
                <td style={{ padding:'11px 16px', textAlign:'center', fontWeight:600 }}>{m.name}</td>
                <td style={{ padding:'11px 16px', textAlign:'center' }}><StageBadge stage={m.current_stage} /></td>
                <td style={{ padding:'11px 16px', textAlign:'center', color:'#64748B', fontSize:12 }}>{m.delay_reason || '-'}</td>
                <td style={{ padding:'11px 16px', textAlign:'center' }}>
                  {m.responsible_party ? <Badge label={m.responsible_party} /> : <span style={{ color:'#94A3B8' }}>-</span>}
                </td>
                <td style={{ padding:'11px 16px', textAlign:'center' }}>
                  <span style={{ fontWeight:800, color:'#E74C3C', fontFamily:'var(--mono)', fontSize:14 }}>{m.delay_days}</span>
                  <span style={{ color:'#94A3B8', fontSize:11, marginRight:4 }}>يوم</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Charts Row */}
      {pieData.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          {/* Pie Chart */}
          <div style={{ background:'#fff', borderRadius:14, padding:20, boxShadow:'var(--shadow-md)', border:'1px solid #E2E8F0' }}>
            <h3 style={{ fontSize:14, fontWeight:800, color:'#0D1B2A', marginBottom:16 }}>أسباب التأخير حسب المسؤول</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div style={{ background:'#fff', borderRadius:14, padding:20, boxShadow:'var(--shadow-md)', border:'1px solid #E2E8F0' }}>
            <h3 style={{ fontSize:14, fontWeight:800, color:'#0D1B2A', marginBottom:16 }}>أيام التأخير حسب المسؤول</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} layout="vertical" margin={{ right:20 }}>
                <XAxis type="number" tick={{ fontSize:11, fontFamily:'var(--font)' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize:10, fontFamily:'var(--font)' }} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="أيام" radius={[0,6,6,0]}>
                  {barData.map((entry, i) => <Cell key={i} fill={COLORS[entry.name] || CHART_COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
