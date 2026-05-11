import React from 'react';

// ── Badge ──────────────────────────────────────────────────────────────────────
const BADGE_STYLES = {
  'أوردر':            { bg:'#EAFAF1', color:'#27AE60', border:'#A9DFBF' },
  'عينة':             { bg:'#F5EEF8', color:'#8E44AD', border:'#D2B4DE' },
  'متأخر':            { bg:'#FDEDEC', color:'#E74C3C', border:'#F1948A' },
  'في الموعد':        { bg:'#EAFAF1', color:'#27AE60', border:'#A9DFBF' },
  'تم التسليم':       { bg:'#EAF4FB', color:'#2E86AB', border:'#AED6F1' },
  'المصنع':           { bg:'#FDEDEC', color:'#E74C3C', border:'#F1948A' },
  'التخطيط / المخزن': { bg:'#FEF9E7', color:'#E8871E', border:'#FAD7A0' },
  'الفاشون ديزاين':   { bg:'#F5EEF8', color:'#8E44AD', border:'#D2B4DE' },
  'النقل والشحن':     { bg:'#EAF4FB', color:'#2E86AB', border:'#AED6F1' },
};
export function Badge({ label, size = 'sm' }) {
  const s = BADGE_STYLES[label] || { bg:'#F1F5F9', color:'#64748B', border:'#CBD5E1' };
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:4,
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      borderRadius: 99, fontWeight: 700,
      fontSize: size === 'sm' ? 11 : 13,
      padding: size === 'sm' ? '2px 10px' : '4px 14px',
      whiteSpace:'nowrap',
    }}>
      {label}
    </span>
  );
}

// ── Stage Badge ────────────────────────────────────────────────────────────────
const STAGE_ICONS = {
  'قص': '✂️', 'خياطة': '🪡', 'تشطيب': '✨',
  'تسليم من المصنع': '🚚', 'استلام المخزن': '📦',
};
export function StageBadge({ stage }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      background:'#F1F5F9', color:'#334155',
      border:'1px solid #E2E8F0', borderRadius:8,
      fontSize:11, fontWeight:600, padding:'3px 10px',
    }}>
      {STAGE_ICONS[stage]} {stage}
    </span>
  );
}

// ── Progress Bar ───────────────────────────────────────────────────────────────
export function ProgressBar({ value }) {
  const color = value === 100 ? '#27AE60' : value >= 70 ? '#2E86AB' : value >= 40 ? '#E8871E' : '#E74C3C';
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ flex:1, height:6, background:'#E2E8F0', borderRadius:99, overflow:'hidden' }}>
        <div style={{ width:`${value}%`, height:'100%', background:color, borderRadius:99, transition:'width .4s ease' }} />
      </div>
      <span style={{ fontSize:11, fontWeight:700, color, minWidth:32, fontFamily:'var(--mono)' }}>{value}%</span>
    </div>
  );
}

// ── KPI Card ───────────────────────────────────────────────────────────────────
export function KpiCard({ label, value, color, bg, icon }) {
  return (
    <div className="scale-in" style={{
      background: bg, border:`1.5px solid ${color}22`,
      borderRadius: 14, padding:'16px 20px',
      display:'flex', flexDirection:'column', alignItems:'center', gap:4,
      boxShadow:`0 2px 12px ${color}18`,
    }}>
      <span style={{ fontSize:26 }}>{icon}</span>
      <span style={{ fontSize:32, fontWeight:900, color, lineHeight:1, fontFamily:'var(--mono)' }}>{value}</span>
      <span style={{ fontSize:12, color:'#64748B', fontWeight:600, textAlign:'center' }}>{label}</span>
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 560 }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(13,27,42,.6)',
      zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center',
      backdropFilter:'blur(4px)', padding:16,
    }}>
      <div onClick={e => e.stopPropagation()} className="scale-in" style={{
        background:'#fff', borderRadius:18, width:'100%', maxWidth:width,
        boxShadow:'0 24px 64px rgba(0,0,0,.2)', maxHeight:'90vh', display:'flex', flexDirection:'column',
      }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <h3 style={{ fontSize:17, fontWeight:800, color:'#0D1B2A' }}>{title}</h3>
          <button onClick={onClose} style={{ border:'none', background:'#F1F5F9', borderRadius:8, width:32, height:32, cursor:'pointer', fontSize:16, color:'#64748B' }}>✕</button>
        </div>
        <div style={{ padding:24, overflowY:'auto', flex:1 }}>{children}</div>
      </div>
    </div>
  );
}

// ── Form Input ─────────────────────────────────────────────────────────────────
export function FormField({ label, required, children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
      <label style={{ fontSize:12, fontWeight:700, color:'#334155' }}>
        {label} {required && <span style={{ color:'#E74C3C' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export const inputStyle = {
  width:'100%', padding:'9px 12px', border:'1.5px solid #E2E8F0',
  borderRadius:8, fontSize:13, fontFamily:'var(--font)',
  color:'#0F172A', background:'#F8FAFC', outline:'none', direction:'rtl',
  transition:'border-color .15s',
};

export const selectStyle = { ...inputStyle, cursor:'pointer' };

// ── Empty State ────────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title, desc }) {
  return (
    <div className="fade-in" style={{ padding:'60px 20px', textAlign:'center', color:'#94A3B8' }}>
      <div style={{ fontSize:48, marginBottom:12 }}>{icon}</div>
      <div style={{ fontSize:16, fontWeight:700, color:'#64748B', marginBottom:6 }}>{title}</div>
      {desc && <div style={{ fontSize:13 }}>{desc}</div>}
    </div>
  );
}

// ── Confirm Dialog ─────────────────────────────────────────────────────────────
export function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div onClick={onCancel} style={{ position:'fixed',inset:0,background:'rgba(13,27,42,.6)',zIndex:1100,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)' }}>
      <div onClick={e=>e.stopPropagation()} className="scale-in" style={{ background:'#fff',borderRadius:16,padding:28,width:340,textAlign:'center',boxShadow:'0 16px 48px rgba(0,0,0,.2)' }}>
        <div style={{ fontSize:36,marginBottom:12 }}>⚠️</div>
        <p style={{ fontSize:14,color:'#334155',fontWeight:600,marginBottom:24,lineHeight:1.6 }}>{message}</p>
        <div style={{ display:'flex',gap:10,justifyContent:'center' }}>
          <button onClick={onCancel} style={{ padding:'9px 24px',border:'1.5px solid #E2E8F0',borderRadius:8,background:'#fff',cursor:'pointer',fontFamily:'var(--font)',fontSize:13,fontWeight:600,color:'#64748B' }}>إلغاء</button>
          <button onClick={onConfirm} style={{ padding:'9px 24px',border:'none',borderRadius:8,background:'#E74C3C',cursor:'pointer',fontFamily:'var(--font)',fontSize:13,fontWeight:700,color:'#fff' }}>تأكيد الحذف</button>
        </div>
      </div>
    </div>
  );
}
