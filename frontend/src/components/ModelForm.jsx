import React, { useState, useEffect, useRef } from 'react';
import { Modal, FormField, inputStyle, selectStyle } from './UI';
import { modelAPI } from '../api';

const STAGES = ['قص','خياطة','تشطيب','تسليم من المصنع','استلام المخزن'];
const TYPES = ['أوردر','عينة'];
const STATUSES = ['في الموعد','متأخر','تم التسليم'];
const RESPONSIBLE = ['المصنع','التخطيط / المخزن','الفاشون ديزاين','النقل والشحن'];
const SEASONS = ['S 2026','W 2027','S 2027','W 2028','S 2028'];

const empty = (factory_id) => ({
  factory_id, code:'', name:'', type:'أوردر',
  current_stage:'قص', progress:0,
  start_date:'', expected_delivery:'',
  delivery_status:'في الموعد', delay_days:0,
  delay_reason:'', responsible_party:'', notes:'',
  season:'', image_data:'',
});

export default function ModelForm({ open, onClose, model, factoryId, onSaved }) {
  const [form, setForm] = useState(empty(factoryId));
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    if (model) {
      setForm({
        ...model,
        delay_reason: model.delay_reason || '',
        responsible_party: model.responsible_party || '',
        notes: model.notes || '',
        season: model.season || '',
        image_data: model.image_data || '',
      });
      setImagePreview(model.image_data || '');
    } else {
      setForm(empty(factoryId));
      setImagePreview('');
    }
    setErr('');
  }, [model, factoryId, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return setErr('الصورة أكبر من 2MB، اختار صورة أصغر');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setImagePreview(base64);
      set('image_data', base64);
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!form.code || !form.name || !form.start_date || !form.expected_delivery)
      return setErr('يرجى ملء جميع الحقول المطلوبة');
    setLoading(true);
    try {
      if (model) await modelAPI.update(model.id, form);
      else await modelAPI.create(form);
      onSaved();
      onClose();
    } catch { setErr('حدث خطأ. يرجى المحاولة مرة أخرى'); }
    finally { setLoading(false); }
  };

  const inp = (k, props={}) => (
    <input {...props}
      style={inputStyle} value={form[k]} dir="rtl"
      onChange={e => set(k, e.target.value)}
    />
  );

  return (
    <Modal open={open} onClose={onClose} title={model ? `تعديل ${model.name}` : 'إضافة موديل جديد'} width={660}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>

        {/* Image Upload */}
        <div style={{ gridColumn:'span 2' }}>
          <FormField label="صورة الموديل / العينة">
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              {/* Preview */}
              <div onClick={() => fileRef.current.click()} style={{
                width:90, height:90, borderRadius:10,
                border: imagePreview ? '2px solid #2E86AB' : '2px dashed #CBD5E1',
                background: imagePreview ? 'transparent' : '#F8FAFC',
                display:'flex', alignItems:'center', justifyContent:'center',
                cursor:'pointer', overflow:'hidden', flexShrink:0,
                transition:'border-color .2s',
              }}>
                {imagePreview
                  ? <img src={imagePreview} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <div style={{ textAlign:'center', color:'#94A3B8' }}>
                      <div style={{ fontSize:24 }}>📷</div>
                      <div style={{ fontSize:10, marginTop:4 }}>ارفع صورة</div>
                    </div>
                }
              </div>
              <div style={{ flex:1 }}>
                <button onClick={() => fileRef.current.click()} style={{
                  padding:'8px 16px', border:'1.5px solid #2E86AB', borderRadius:8,
                  background:'#EAF4FB', color:'#1E3A5F', fontFamily:'var(--font)',
                  fontSize:12, fontWeight:700, cursor:'pointer', display:'block', marginBottom:6,
                }}>📁 اختر صورة</button>
                <div style={{ fontSize:10, color:'#94A3B8' }}>PNG, JPG — أقل من 2MB</div>
                {imagePreview && (
                  <button onClick={() => { setImagePreview(''); set('image_data', ''); }} style={{
                    marginTop:6, padding:'4px 10px', border:'1px solid #FECACA',
                    borderRadius:6, background:'#FFF5F5', color:'#E74C3C',
                    fontFamily:'var(--font)', fontSize:11, cursor:'pointer',
                  }}>🗑️ حذف الصورة</button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleImageUpload} />
            </div>
          </FormField>
        </div>

        <FormField label="كود الموديل" required>
          {inp('code', { placeholder:'MOD-XXX' })}
        </FormField>
        <FormField label="اسم الموديل" required>
          {inp('name', { placeholder:'اسم الموديل' })}
        </FormField>
        <FormField label="النوع" required>
          <select style={selectStyle} value={form.type} onChange={e => set('type', e.target.value)}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </FormField>
        <FormField label="الموسم">
          <select style={selectStyle} value={form.season} onChange={e => set('season', e.target.value)}>
            <option value="">-- اختر الموسم --</option>
            {SEASONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </FormField>
        <FormField label="المرحلة الحالية" required>
          <select style={selectStyle} value={form.current_stage} onChange={e => set('current_stage', e.target.value)}>
            {STAGES.map(s => <option key={s}>{s}</option>)}
          </select>
        </FormField>
        <FormField label="حالة التسليم">
          <select style={selectStyle} value={form.delivery_status} onChange={e => set('delivery_status', e.target.value)}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </FormField>
        <FormField label="تاريخ البداية" required>
          {inp('start_date', { type:'date' })}
        </FormField>
        <FormField label="تاريخ التسليم المتوقع" required>
          {inp('expected_delivery', { type:'date' })}
        </FormField>
        <div style={{ gridColumn:'span 2' }}>
          <FormField label="نسبة التقدم">
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <input type="range" min={0} max={100} value={form.progress}
                onChange={e => set('progress', Number(e.target.value))}
                style={{ flex:1 }} />
              <span style={{ fontSize:13, fontWeight:700, fontFamily:'var(--mono)', minWidth:36, color:'#2E86AB' }}>{form.progress}%</span>
            </div>
          </FormField>
        </div>

        {form.delivery_status === 'متأخر' && <>
          <FormField label="عدد أيام التأخير">
            {inp('delay_days', { type:'number', min:0, placeholder:'0' })}
          </FormField>
          <FormField label="المسؤول عن التأخير">
            <select style={selectStyle} value={form.responsible_party} onChange={e => set('responsible_party', e.target.value)}>
              <option value="">-- اختر --</option>
              {RESPONSIBLE.map(r => <option key={r}>{r}</option>)}
            </select>
          </FormField>
          <div style={{ gridColumn:'span 2' }}>
            <FormField label="سبب التأخير">
              <input style={inputStyle} value={form.delay_reason}
                placeholder="اكتب سبب التأخير"
                onChange={e => set('delay_reason', e.target.value)} />
            </FormField>
          </div>
        </>}

        <div style={{ gridColumn:'span 2' }}>
          <FormField label="ملاحظات">
            <textarea style={{ ...inputStyle, resize:'vertical', minHeight:60 }}
              value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder="أي ملاحظات إضافية..." />
          </FormField>
        </div>
      </div>

      {err && <p style={{ color:'#E74C3C', fontSize:12, marginTop:12, fontWeight:600 }}>⚠️ {err}</p>}

      <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20 }}>
        <button onClick={onClose} style={{ padding:'10px 24px', border:'1.5px solid #E2E8F0', borderRadius:9, background:'#fff', cursor:'pointer', fontFamily:'var(--font)', fontSize:13, fontWeight:600, color:'#64748B' }}>إلغاء</button>
        <button onClick={save} disabled={loading} style={{ padding:'10px 28px', border:'none', borderRadius:9, background:'linear-gradient(135deg,#1E3A5F,#2E86AB)', cursor:'pointer', fontFamily:'var(--font)', fontSize:13, fontWeight:700, color:'#fff', opacity: loading ? .7 : 1 }}>
          {loading ? '⏳ جاري الحفظ...' : (model ? '💾 حفظ التعديلات' : '➕ إضافة الموديل')}
        </button>
      </div>
    </Modal>
  );
}
