import React, { useState, useRef, useEffect, useCallback } from 'react';

const STYLES = `
.img-editor-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.85);
  backdrop-filter: blur(8px); z-index: 9999; display: flex;
  align-items: center; justify-content: center; padding: 1rem;
  animation: editorFadeIn 0.2s ease; pointer-events: all; user-select: none;
}
@keyframes editorFadeIn { from{opacity:0} to{opacity:1} }

.img-editor-modal {
  background: #16140f; border: 1px solid rgba(201,168,76,0.2);
  border-radius: 20px; width: 100%; max-width: 960px;
  height: 90vh; max-height: 90vh;
  overflow: hidden; display: flex; flex-direction: column;
  box-shadow: 0 32px 80px rgba(0,0,0,0.8); pointer-events: all;
  position: relative; z-index: 10000;
  animation: editorSlideUp 0.25s cubic-bezier(0.16,1,0.3,1);
}
@keyframes editorSlideUp {
  from{transform:translateY(24px);opacity:0}
  to{transform:translateY(0);opacity:1}
}

.img-editor-header {
  display:flex; align-items:center; justify-content:space-between;
  padding:1rem 1.5rem; border-bottom:1px solid rgba(201,168,76,0.12);
  flex-shrink:0;
}
.img-editor-title {
  font-family:'Cormorant Garamond',Georgia,serif; font-size:1.3rem;
  font-weight:600; color:#f5edd6; display:flex; align-items:center; gap:10px;
}
.img-editor-title span {
  font-size:0.62rem; font-weight:600; letter-spacing:0.15em;
  text-transform:uppercase; color:#c9a84c; background:rgba(201,168,76,0.1);
  padding:3px 10px; border-radius:99px; border:1px solid rgba(201,168,76,0.2);
  font-family:'DM Sans',system-ui,sans-serif;
}

.img-editor-body {
  display:grid; grid-template-columns:1fr 280px;
  flex:1; overflow:hidden; min-height:0;
}

.img-editor-canvas-area {
  position:relative; background:#0a0908;
  background-image:
    linear-gradient(45deg,#111 25%,transparent 25%),
    linear-gradient(-45deg,#111 25%,transparent 25%),
    linear-gradient(45deg,transparent 75%,#111 75%),
    linear-gradient(-45deg,transparent 75%,#111 75%);
  background-size:20px 20px;
  background-position:0 0,0 10px,10px -10px,-10px 0;
  overflow:hidden; display:flex; align-items:center; justify-content:center;
  flex:1; height:100%; min-height:0;
}

.crop-wrapper { position:relative; display:inline-block; line-height:0; }
.crop-wrapper canvas { display:block; }

.crop-box {
  position:absolute; border:2px solid #c9a84c;
  box-sizing:border-box; cursor:move;
}
.crop-grid-line {
  position:absolute; background:rgba(201,168,76,0.3); pointer-events:none;
}
.crop-handle {
  position:absolute; width:14px; height:14px;
  background:#c9a84c; border:2px solid #0a0908;
  border-radius:3px; z-index:10;
}
.crop-handle.tl{top:-7px;left:-7px;cursor:nw-resize;}
.crop-handle.tc{top:-7px;left:50%;transform:translateX(-50%);cursor:n-resize;}
.crop-handle.tr{top:-7px;right:-7px;cursor:ne-resize;}
.crop-handle.ml{top:50%;transform:translateY(-50%);left:-7px;cursor:w-resize;}
.crop-handle.mr{top:50%;transform:translateY(-50%);right:-7px;cursor:e-resize;}
.crop-handle.bl{bottom:-7px;left:-7px;cursor:sw-resize;}
.crop-handle.bc{bottom:-7px;left:50%;transform:translateX(-50%);cursor:s-resize;}
.crop-handle.br{bottom:-7px;right:-7px;cursor:se-resize;}

.img-editor-controls {
  border-left:1px solid rgba(201,168,76,0.1);
  display:flex; flex-direction:column; overflow-y:auto;
  background:#111009; pointer-events:all; position:relative; z-index:10;
}

.mode-tabs {
  display:flex; gap:4px; padding:0.75rem 1rem;
  border-bottom:1px solid rgba(201,168,76,0.1); flex-shrink:0;
}
.mode-tab {
  flex:1; padding:7px 2px; background:transparent;
  border:1px solid rgba(201,168,76,0.12); border-radius:8px;
  color:#8a8070; font-size:0.62rem; font-weight:600;
  cursor:pointer; transition:all 0.18s;
  font-family:'DM Sans',system-ui,sans-serif;
  text-align:center; line-height:1.5;
}
.mode-tab:hover { color:#c9a84c; border-color:rgba(201,168,76,0.3); background:rgba(201,168,76,0.05); }
.mode-tab.active { background:rgba(201,168,76,0.12); border-color:#c9a84c; color:#c9a84c; }

.ctrl-section { padding:1rem 1.1rem; border-bottom:1px solid rgba(255,255,255,0.04); }

.ctrl-title {
  font-size:0.6rem; font-weight:700; letter-spacing:0.18em;
  text-transform:uppercase; color:#c9a84c; margin-bottom:0.85rem;
  display:flex; align-items:center; gap:6px;
  font-family:'DM Sans',system-ui,sans-serif;
}
.ctrl-title::after { content:''; flex:1; height:1px; background:rgba(201,168,76,0.15); }

.slider-row { margin-bottom:0.85rem; }
.slider-label-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; }
.slider-label { font-size:0.72rem; color:#8a8070; font-weight:500; font-family:'DM Sans',system-ui,sans-serif; }
.slider-value {
  font-size:0.68rem; color:#c9a84c; font-family:'DM Mono',monospace;
  background:rgba(201,168,76,0.08); padding:2px 7px; border-radius:4px;
  min-width:44px; text-align:center;
}
.slider-reset-btn {
  background:none; border:none; color:#5a5448; cursor:pointer;
  font-size:0.75rem; padding:2px 5px; border-radius:3px;
  transition:color 0.15s; font-family:'DM Sans',system-ui,sans-serif;
}
.slider-reset-btn:hover { color:#c9a84c; }

input[type=range].editor-slider {
  width:100%; height:4px; -webkit-appearance:none; appearance:none;
  background:#252118; border-radius:2px; outline:none; cursor:pointer;
}
input[type=range].editor-slider::-webkit-slider-thumb {
  -webkit-appearance:none; width:16px; height:16px; background:#c9a84c;
  border-radius:50%; cursor:pointer; box-shadow:0 2px 6px rgba(201,168,76,0.4);
  transition:transform 0.15s;
}
input[type=range].editor-slider::-webkit-slider-thumb:hover { transform:scale(1.25); }

.filter-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:6px; }
.filter-btn {
  padding:8px 6px; background:rgba(255,255,255,0.03);
  border:1px solid rgba(255,255,255,0.07); border-radius:8px;
  color:#8a8070; font-size:0.68rem; font-weight:600;
  cursor:pointer; transition:all 0.15s; text-align:center;
  font-family:'DM Sans',system-ui,sans-serif;
}
.filter-btn:hover { color:#e8c96a; border-color:rgba(201,168,76,0.3); background:rgba(201,168,76,0.05); }
.filter-btn.active { background:rgba(201,168,76,0.12); border-color:#c9a84c; color:#c9a84c; }

.aspect-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; }
.aspect-btn {
  padding:7px 4px; background:rgba(255,255,255,0.03);
  border:1px solid rgba(255,255,255,0.07); border-radius:7px;
  color:#8a8070; font-size:0.68rem; font-weight:600;
  cursor:pointer; transition:all 0.15s; text-align:center;
  font-family:'DM Sans',system-ui,sans-serif;
}
.aspect-btn:hover { color:#c9a84c; border-color:rgba(201,168,76,0.3); }
.aspect-btn.active { background:rgba(201,168,76,0.12); border-color:#c9a84c; color:#c9a84c; }

.crop-info-box {
  margin-top:0.9rem; padding:10px 12px;
  background:rgba(201,168,76,0.06); border-radius:8px;
  border:1px solid rgba(201,168,76,0.15);
  font-size:0.7rem; color:#8a8070;
  font-family:'DM Sans',system-ui,sans-serif; line-height:1.7;
}
.crop-info-box strong { color:#c9a84c; }

.crop-reset-btn {
  width:100%; margin-top:0.75rem; padding:8px;
  background:rgba(201,168,76,0.06); border:1px solid rgba(201,168,76,0.2);
  border-radius:8px; color:#c9a84c; font-size:0.75rem; font-weight:600;
  cursor:pointer; transition:all 0.15s; font-family:'DM Sans',system-ui,sans-serif;
}
.crop-reset-btn:hover { background:rgba(201,168,76,0.12); }

.transform-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:8px; }
.transform-btn {
  padding:10px 6px; background:rgba(255,255,255,0.03);
  border:1px solid rgba(255,255,255,0.07); border-radius:8px;
  color:#8a8070; font-size:1.1rem; cursor:pointer; transition:all 0.15s;
  display:flex; flex-direction:column; align-items:center; gap:4px;
}
.transform-btn span {
  font-size:0.6rem; font-weight:600; letter-spacing:0.05em;
  text-transform:uppercase; font-family:'DM Sans',system-ui,sans-serif; pointer-events:none;
}
.transform-btn:hover { color:#c9a84c; border-color:rgba(201,168,76,0.3); background:rgba(201,168,76,0.06); }

.img-editor-footer {
  display:flex; align-items:center; justify-content:space-between;
  padding:0.9rem 1.5rem; border-top:1px solid rgba(201,168,76,0.12);
  background:#0e0c09; flex-shrink:0; gap:1rem;
}
.editor-info { font-size:0.7rem; color:#5a5448; font-family:'DM Mono',monospace; }
.editor-footer-btns { display:flex; gap:8px; }

.editor-btn-cancel {
  padding:9px 18px; background:transparent;
  border:1px solid rgba(255,255,255,0.1); border-radius:8px;
  color:#8a8070; font-size:0.82rem; font-weight:600;
  cursor:pointer; transition:all 0.15s; font-family:'DM Sans',system-ui,sans-serif;
}
.editor-btn-cancel:hover { color:#ede8dc; border-color:rgba(255,255,255,0.25); }

.editor-btn-reset {
  padding:9px 18px; background:rgba(224,82,82,0.08);
  border:1px solid rgba(224,82,82,0.2); border-radius:8px;
  color:#e05252; font-size:0.82rem; font-weight:600;
  cursor:pointer; transition:all 0.15s; font-family:'DM Sans',system-ui,sans-serif;
}
.editor-btn-reset:hover { background:rgba(224,82,82,0.15); }

.editor-btn-apply {
  padding:9px 26px; background:linear-gradient(135deg,#9a7a2e,#e8c96a);
  border:none; border-radius:8px; color:#0a0908; font-size:0.82rem;
  font-weight:700; cursor:pointer; transition:all 0.2s;
  font-family:'DM Sans',system-ui,sans-serif;
  box-shadow:0 4px 16px rgba(201,168,76,0.3);
}
.editor-btn-apply:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(201,168,76,0.45); }

.upload-zone {
  border:2px dashed rgba(201,168,76,0.2); border-radius:12px;
  padding:2.5rem 1.5rem; text-align:center; cursor:pointer;
  transition:all 0.25s; background:rgba(255,255,255,0.01);
}
.upload-zone:hover,.upload-zone.drag-over { border-color:#c9a84c; background:rgba(201,168,76,0.04); }

.upload-icon-wrap {
  width:52px; height:52px; background:rgba(201,168,76,0.08);
  border:1px solid rgba(201,168,76,0.2); border-radius:12px;
  display:flex; align-items:center; justify-content:center;
  font-size:1.4rem; margin:0 auto 0.9rem; transition:all 0.25s;
}
.upload-zone:hover .upload-icon-wrap { background:rgba(201,168,76,0.15); border-color:#c9a84c; transform:scale(1.05); }

.upload-primary-text { font-size:0.875rem; color:#8a8070; margin-bottom:4px; font-family:'DM Sans',system-ui,sans-serif; }
.upload-primary-text strong { color:#c9a84c; }
.upload-secondary-text { font-size:0.72rem; color:#5a5448; font-family:'DM Sans',system-ui,sans-serif; }

/* Image preview with ALWAYS VISIBLE buttons below */
.upload-thumb-wrap { position:relative; display:inline-block; width:100%; }
.upload-thumb-wrap img {
  max-height:180px; max-width:100%; border-radius:10px;
  border:1px solid rgba(201,168,76,0.2); display:block;
  box-shadow:0 8px 24px rgba(0,0,0,0.4);
}

/* Buttons always visible BELOW the image */
.thumb-actions {
  display:flex; align-items:center; justify-content:center;
  gap:8px; margin-top:10px;
}

.thumb-action-btn {
  padding:8px 16px; border:none; border-radius:8px;
  font-size:0.78rem; font-weight:700; cursor:pointer;
  font-family:'DM Sans',system-ui,sans-serif; transition:all 0.15s;
  display:flex; align-items:center; gap:6px;
}
.thumb-action-btn.edit {
  background:rgba(201,168,76,0.15); color:#c9a84c;
  border:1px solid rgba(201,168,76,0.3);
}
.thumb-action-btn.edit:hover { background:rgba(201,168,76,0.25); }
.thumb-action-btn.remove {
  background:rgba(224,82,82,0.1); color:#e05252;
  border:1px solid rgba(224,82,82,0.3);
}
.thumb-action-btn.remove:hover { background:rgba(224,82,82,0.2); }

.close-x-btn {
  background:none; border:none; color:#8a8070; font-size:1.5rem;
  cursor:pointer; padding:4px 10px; border-radius:6px;
  transition:all 0.15s; line-height:1;
}
.close-x-btn:hover { color:#ede8dc; background:rgba(255,255,255,0.06); }

@media(max-width:640px){
  .img-editor-body { grid-template-columns:1fr; }
  .img-editor-controls { border-left:none; border-top:1px solid rgba(201,168,76,0.1); max-height:240px; }
}
`;

if (typeof document !== 'undefined' && !document.getElementById('img-editor-styles')) {
  const s = document.createElement('style');
  s.id = 'img-editor-styles';
  s.textContent = STYLES;
  document.head.appendChild(s);
}

const DEFAULT_ADJ = {
  brightness:100, contrast:100, saturation:100,
  hue:0, blur:0, zoom:1, rotate:0, flipH:false, flipV:false,
};

const FILTERS = [
  { name:'None',     id:'none',     css:'' },
  { name:'Vivid',    id:'vivid',    css:'saturate(1.6) contrast(1.1)' },
  { name:'Matte',    id:'matte',    css:'saturate(0.8) brightness(1.05) contrast(0.9)' },
  { name:'B & W',    id:'bw',       css:'grayscale(1)' },
  { name:'Sepia',    id:'sepia',    css:'sepia(0.8)' },
  { name:'Vintage',  id:'vintage',  css:'sepia(0.4) contrast(0.85) brightness(1.1)' },
  { name:'Cold',     id:'cold',     css:'hue-rotate(200deg) saturate(0.9)' },
  { name:'Warm',     id:'warm',     css:'sepia(0.2) saturate(1.3) hue-rotate(-10deg)' },
  { name:'Faded',    id:'faded',    css:'saturate(0.7) brightness(1.1)' },
  { name:'Dramatic', id:'dramatic', css:'contrast(1.4) saturate(1.2) brightness(0.9)' },
];

const ASPECTS = [
  { label:'Free',   id:'free',  ratio:null },
  { label:'1 : 1',  id:'1:1',   ratio:1 },
  { label:'4 : 3',  id:'4:3',   ratio:4/3 },
  { label:'16 : 9', id:'16:9',  ratio:16/9 },
  { label:'3 : 4',  id:'3:4',   ratio:3/4 },
  { label:'2 : 3',  id:'2:3',   ratio:2/3 },
];

const SLIDERS = [
  { key:'brightness', label:'Brightness', min:0,    max:200, def:100, step:1,    unit:'%'  },
  { key:'contrast',   label:'Contrast',   min:0,    max:200, def:100, step:1,    unit:'%'  },
  { key:'saturation', label:'Saturation', min:0,    max:200, def:100, step:1,    unit:'%'  },
  { key:'hue',        label:'Hue Shift',  min:-180, max:180, def:0,   step:1,    unit:'°'  },
  { key:'blur',       label:'Blur',       min:0,    max:10,  def:0,   step:0.1,  unit:'px' },
  { key:'zoom',       label:'Zoom',       min:0.5,  max:3,   def:1,   step:0.01, unit:'x'  },
];

const clamp    = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const MIN_CROP = 30;

function ImageEditor({ src, onApply, onCancel }) {
  const canvasRef  = useRef(null);
  const imgRef     = useRef(null);
  const wrapperRef = useRef(null);
  const areaRef    = useRef(null);
  const dragRef    = useRef(null);

  const [tab,    setTab]    = useState('adjust');
  const [adj,    setAdj]    = useState({ ...DEFAULT_ADJ });
  const [filter, setFilter] = useState('none');
  const [aspect, setAspect] = useState('free');
  const [dims,   setDims]   = useState({ w:0, h:0 });
  const [crop,   setCrop]   = useState({ x:0, y:0, w:0, h:0 });

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      setDims({ w:img.naturalWidth, h:img.naturalHeight });
      requestAnimationFrame(() => drawCanvas(img, { ...DEFAULT_ADJ }, 'none'));
    };
    img.src = src;
  }, [src]);

  useEffect(() => {
    if (imgRef.current) drawCanvas(imgRef.current, adj, filter);
  }, [adj, filter]);

  useEffect(() => {
    if (tab === 'crop' && canvasRef.current && crop.w === 0) {
      setCrop({ x:0, y:0, w:canvasRef.current.width, h:canvasRef.current.height });
    }
  }, [tab]);

  const drawCanvas = (img, a, f) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const area = areaRef.current;
    const maxW = (area ? area.clientWidth  : 640) - 10;
    const maxH = (area ? area.clientHeight : 520) - 10;
    const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
    canvas.width  = Math.floor(img.naturalWidth  * scale);
    canvas.height = Math.floor(img.naturalHeight * scale);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((a.rotate * Math.PI) / 180);
    ctx.scale(a.flipH ? -a.zoom : a.zoom, a.flipV ? -a.zoom : a.zoom);
    const fp = FILTERS.find(x => x.id === f) || FILTERS[0];
    ctx.filter = [
      `brightness(${a.brightness}%)`,`contrast(${a.contrast}%)`,
      `saturate(${a.saturation}%)`,`blur(${a.blur * 0.4}px)`,
      `hue-rotate(${a.hue}deg)`,fp.css,
    ].filter(Boolean).join(' ');
    ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    ctx.restore();
    setCrop({ x:0, y:0, w:canvas.width, h:canvas.height });
  };

  const setOne = (key, val) => setAdj(p => ({ ...p, [key]:val }));
  const rotate  = (deg)      => setAdj(p => ({ ...p, rotate:(p.rotate + deg + 360) % 360 }));

  const applyAspect = (id) => {
    setAspect(id);
    const a = ASPECTS.find(x => x.id === id);
    if (!a || !a.ratio || !canvasRef.current) return;
    const cw = canvasRef.current.width;
    const ch = canvasRef.current.height;
    let w = cw, h = cw / a.ratio;
    if (h > ch) { h = ch; w = ch * a.ratio; }
    setCrop({ x:(cw - w) / 2, y:(ch - h) / 2, w, h });
  };

  const resetCrop = () => {
    if (!canvasRef.current) return;
    setCrop({ x:0, y:0, w:canvasRef.current.width, h:canvasRef.current.height });
    setAspect('free');
  };

  const getPos = (e) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return { x:0, y:0 };
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const onMouseDown = useCallback((e, type) => {
    e.preventDefault(); e.stopPropagation();
    const pos = getPos(e);
    dragRef.current = { type, startX:pos.x, startY:pos.y, startCrop:{ ...crop } };
  }, [crop]);

  const onMouseMove = useCallback((e) => {
    if (!dragRef.current || !canvasRef.current) return;
    e.preventDefault();
    const pos  = getPos(e);
    const dx   = pos.x - dragRef.current.startX;
    const dy   = pos.y - dragRef.current.startY;
    const sc   = dragRef.current.startCrop;
    const cw   = canvasRef.current.width;
    const ch   = canvasRef.current.height;
    const ar   = ASPECTS.find(x => x.id === aspect)?.ratio || null;
    let { x, y, w, h } = sc;
    const type = dragRef.current.type;
    if (type === 'move') {
      x = clamp(sc.x + dx, 0, cw - w);
      y = clamp(sc.y + dy, 0, ch - h);
    } else {
      if (type.includes('r')) { w = clamp(sc.w + dx, MIN_CROP, cw - x); }
      if (type.includes('l')) { const nx = clamp(sc.x + dx, 0, sc.x + sc.w - MIN_CROP); w = sc.x + sc.w - nx; x = nx; }
      if (type.includes('b')) { h = clamp(sc.h + dy, MIN_CROP, ch - y); }
      if (type.includes('t')) { const ny = clamp(sc.y + dy, 0, sc.y + sc.h - MIN_CROP); h = sc.y + sc.h - ny; y = ny; }
      if (ar) {
        if (type.includes('r') || type.includes('l')) { h = w / ar; } else { w = h * ar; }
        if (x + w > cw) w = cw - x;
        if (y + h > ch) h = ch - y;
        h = clamp(h, MIN_CROP, ch - y);
        w = clamp(w, MIN_CROP, cw - x);
      }
    }
    setCrop({ x, y, w, h });
  }, [aspect]);

  const onMouseUp = useCallback(() => { dragRef.current = null; }, []);

  const handleApply = () => {
    const img = imgRef.current;
    if (!img) return;
    const canvas = canvasRef.current;
    const scaleX = img.naturalWidth  / canvas.width;
    const scaleY = img.naturalHeight / canvas.height;
    const out    = document.createElement('canvas');
    out.width    = Math.round(crop.w * scaleX);
    out.height   = Math.round(crop.h * scaleY);
    const ctx    = out.getContext('2d');
    const fp     = FILTERS.find(x => x.id === filter) || FILTERS[0];
    ctx.filter   = [
      `brightness(${adj.brightness}%)`,`contrast(${adj.contrast}%)`,
      `saturate(${adj.saturation}%)`,`blur(${adj.blur * 0.4}px)`,
      `hue-rotate(${adj.hue}deg)`,fp.css,
    ].filter(Boolean).join(' ');
    ctx.drawImage(img, crop.x * scaleX, crop.y * scaleY, crop.w * scaleX, crop.h * scaleY, 0, 0, out.width, out.height);
    out.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], 'cover-edited.jpg', { type:'image/jpeg' });
      onApply(file, URL.createObjectURL(blob));
    }, 'image/jpeg', 0.95);
  };

  const handleReset = () => {
    setAdj({ ...DEFAULT_ADJ }); setFilter('none'); setAspect('free');
    if (imgRef.current) drawCanvas(imgRef.current, { ...DEFAULT_ADJ }, 'none');
  };

  const stopProp = (e) => e.stopPropagation();
  const cw = canvasRef.current?.width  || 1;
  const ch = canvasRef.current?.height || 1;

  return (
    <div className="img-editor-overlay">
      <div className="img-editor-modal" onClick={stopProp} onMouseDown={stopProp}>
        <div className="img-editor-header">
          <div className="img-editor-title">🎨 Image Editor <span>Live Preview</span></div>
          <button type="button" className="close-x-btn" onClick={onCancel}>×</button>
        </div>
        <div className="img-editor-body">
          <div className="img-editor-canvas-area" ref={areaRef}
            onMouseMove={tab==='crop'?onMouseMove:undefined}
            onMouseUp={tab==='crop'?onMouseUp:undefined}
            onMouseLeave={tab==='crop'?onMouseUp:undefined}
            onTouchMove={tab==='crop'?onMouseMove:undefined}
            onTouchEnd={tab==='crop'?onMouseUp:undefined}>
            <div className="crop-wrapper" ref={wrapperRef}>
              <canvas ref={canvasRef} />
              {tab==='crop' && crop.w>0 && (
                <>
                  <div style={{position:'absolute',top:0,left:0,width:cw,height:crop.y,background:'rgba(0,0,0,0.6)',pointerEvents:'none'}} />
                  <div style={{position:'absolute',top:crop.y+crop.h,left:0,width:cw,height:ch-(crop.y+crop.h),background:'rgba(0,0,0,0.6)',pointerEvents:'none'}} />
                  <div style={{position:'absolute',top:crop.y,left:0,width:crop.x,height:crop.h,background:'rgba(0,0,0,0.6)',pointerEvents:'none'}} />
                  <div style={{position:'absolute',top:crop.y,left:crop.x+crop.w,width:cw-(crop.x+crop.w),height:crop.h,background:'rgba(0,0,0,0.6)',pointerEvents:'none'}} />
                  <div className="crop-box" style={{left:crop.x,top:crop.y,width:crop.w,height:crop.h}}
                    onMouseDown={e=>onMouseDown(e,'move')} onTouchStart={e=>onMouseDown(e,'move')}>
                    <div className="crop-grid-line" style={{left:'33.33%',top:0,width:1,height:'100%'}} />
                    <div className="crop-grid-line" style={{left:'66.66%',top:0,width:1,height:'100%'}} />
                    <div className="crop-grid-line" style={{top:'33.33%',left:0,height:1,width:'100%'}} />
                    <div className="crop-grid-line" style={{top:'66.66%',left:0,height:1,width:'100%'}} />
                    <div className="crop-handle tl" onMouseDown={e=>onMouseDown(e,'tl')} onTouchStart={e=>onMouseDown(e,'tl')} />
                    <div className="crop-handle tc" onMouseDown={e=>onMouseDown(e,'t')}  onTouchStart={e=>onMouseDown(e,'t')}  />
                    <div className="crop-handle tr" onMouseDown={e=>onMouseDown(e,'tr')} onTouchStart={e=>onMouseDown(e,'tr')} />
                    <div className="crop-handle ml" onMouseDown={e=>onMouseDown(e,'l')}  onTouchStart={e=>onMouseDown(e,'l')}  />
                    <div className="crop-handle mr" onMouseDown={e=>onMouseDown(e,'r')}  onTouchStart={e=>onMouseDown(e,'r')}  />
                    <div className="crop-handle bl" onMouseDown={e=>onMouseDown(e,'bl')} onTouchStart={e=>onMouseDown(e,'bl')} />
                    <div className="crop-handle bc" onMouseDown={e=>onMouseDown(e,'b')}  onTouchStart={e=>onMouseDown(e,'b')}  />
                    <div className="crop-handle br" onMouseDown={e=>onMouseDown(e,'br')} onTouchStart={e=>onMouseDown(e,'br')} />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="img-editor-controls">
            <div className="mode-tabs">
              {[{id:'adjust',icon:'⚙️',label:'Adjust'},{id:'filter',icon:'✨',label:'Filter'},{id:'crop',icon:'✂️',label:'Crop'},{id:'rotate',icon:'↻',label:'Rotate'}].map(t=>(
                <button type="button" key={t.id} className={`mode-tab ${tab===t.id?'active':''}`} onClick={()=>setTab(t.id)}>
                  {t.icon}<br/>{t.label}
                </button>
              ))}
            </div>
            {tab==='adjust' && (
              <div className="ctrl-section">
                <div className="ctrl-title">Adjustments</div>
                {SLIDERS.map(s=>(
                  <div className="slider-row" key={s.key}>
                    <div className="slider-label-row">
                      <span className="slider-label">{s.label}</span>
                      <div style={{display:'flex',alignItems:'center',gap:4}}>
                        <span className="slider-value">{s.step<1?Number(adj[s.key]).toFixed(2):Math.round(adj[s.key])}{s.unit}</span>
                        <button type="button" className="slider-reset-btn" onClick={()=>setOne(s.key,s.def)}>↺</button>
                      </div>
                    </div>
                    <input type="range" className="editor-slider" min={s.min} max={s.max} step={s.step} value={adj[s.key]} onChange={e=>setOne(s.key,parseFloat(e.target.value))} />
                  </div>
                ))}
              </div>
            )}
            {tab==='filter' && (
              <div className="ctrl-section">
                <div className="ctrl-title">Presets</div>
                <div className="filter-grid">
                  {FILTERS.map(f=>(
                    <button type="button" key={f.id} className={`filter-btn ${filter===f.id?'active':''}`} onClick={()=>setFilter(f.id)}>{f.name}</button>
                  ))}
                </div>
              </div>
            )}
            {tab==='crop' && (
              <div className="ctrl-section">
                <div className="ctrl-title">Aspect Ratio</div>
                <div className="aspect-grid">
                  {ASPECTS.map(a=>(
                    <button type="button" key={a.id} className={`aspect-btn ${aspect===a.id?'active':''}`} onClick={()=>applyAspect(a.id)}>{a.label}</button>
                  ))}
                </div>
                <div className="crop-info-box">
                  <strong>How to crop:</strong><br/>
                  • Drag the <strong>golden box</strong> to move<br/>
                  • Drag any <strong>corner or edge</strong> to resize<br/>
                  • Pick a ratio above to lock shape<br/>
                  • Click <strong>Apply & Use</strong> to save
                </div>
                <div style={{marginTop:'0.75rem',textAlign:'center',fontSize:'0.7rem',color:'#c9a84c',fontFamily:'DM Mono,monospace'}}>
                  {Math.round(crop.w)} × {Math.round(crop.h)} px
                </div>
                <button type="button" className="crop-reset-btn" onClick={resetCrop}>↺ Reset Crop</button>
              </div>
            )}
            {tab==='rotate' && (
              <div className="ctrl-section">
                <div className="ctrl-title">Rotate & Flip</div>
                <div className="transform-grid">
                  <button type="button" className="transform-btn" onClick={()=>rotate(-90)}>↺<span>Left 90°</span></button>
                  <button type="button" className="transform-btn" onClick={()=>rotate(90)}>↻<span>Right 90°</span></button>
                  <button type="button" className="transform-btn" onClick={()=>setOne('flipH',!adj.flipH)}>↔️<span>Flip H {adj.flipH?'✓':''}</span></button>
                  <button type="button" className="transform-btn" onClick={()=>setOne('flipV',!adj.flipV)}>↕️<span>Flip V {adj.flipV?'✓':''}</span></button>
                </div>
                <div style={{marginTop:'1.2rem'}}>
                  <div className="ctrl-title">Fine Rotation</div>
                  <div className="slider-row">
                    <div className="slider-label-row">
                      <span className="slider-label">Angle</span>
                      <span className="slider-value">{adj.rotate}°</span>
                    </div>
                    <input type="range" className="editor-slider" min={-180} max={180} step={1} value={adj.rotate} onChange={e=>setOne('rotate',parseInt(e.target.value))} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="img-editor-footer">
          <div className="editor-info">{dims.w>0?`${dims.w} × ${dims.h} px`:''}</div>
          <div className="editor-footer-btns">
            <button type="button" className="editor-btn-cancel" onClick={onCancel}>Cancel</button>
            <button type="button" className="editor-btn-reset"  onClick={handleReset}>↺ Reset All</button>
            <button type="button" className="editor-btn-apply"  onClick={handleApply}>✓ Apply & Use</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageUpload({ value, onChange, existingUrl }) {
  const [preview,    setPreview]  = useState(null);
  const [rawSrc,     setRawSrc]   = useState(null);
  const [dragging,   setDragging] = useState(false);
  const [removed,    setRemoved]  = useState(false);
  const [showEditor, setEditor]   = useState(false);
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    const allowed = ['image/jpeg','image/png','image/gif','image/webp'];
    if (!allowed.includes(file.type)) { alert('Please upload JPEG, PNG, GIF, or WebP only.'); return; }
    if (file.size > 10 * 1024 * 1024) { alert('Image must be under 10 MB.'); return; }
    const url = URL.createObjectURL(file);
    setRawSrc(url); setPreview(url); setRemoved(false); onChange(file);
    setTimeout(() => setEditor(true), 80);
  };

  const handleApply = (editedFile, editedUrl) => {
    setPreview(editedUrl); onChange(editedFile); setEditor(false);
  };

  const handleRemove = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null); setRawSrc(null); setRemoved(true); onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const showExisting   = existingUrl && !removed && !preview;
  const showPreview    = !!preview;
  const showUploadZone = !showExisting && !showPreview;

  return (
    <div>
      {showEditor && rawSrc && (
        <ImageEditor src={rawSrc} onApply={handleApply} onCancel={() => setEditor(false)} />
      )}

      {showPreview && (
        <div style={{marginBottom:10}}>
          <div className="upload-thumb-wrap">
            <img src={preview} alt="Cover preview" />
            {/* Buttons always visible below image */}
            <div className="thumb-actions">
              <button type="button" className="thumb-action-btn edit"
                onClick={() => { setRawSrc(preview); setEditor(true); }}>
                🎨 Edit Image
              </button>
              <button type="button" className="thumb-action-btn remove" onClick={handleRemove}>
                🗑️ Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {showExisting && (
        <div style={{marginBottom:10}}>
          <div className="upload-thumb-wrap">
            <img src={existingUrl} alt="Current cover" onError={() => setRemoved(true)} />
            {/* Buttons always visible below image */}
            <div className="thumb-actions">
              <button type="button" className="thumb-action-btn edit"
                onClick={() => { setRawSrc(existingUrl); setEditor(true); }}>
                🎨 Edit Image
              </button>
              <button type="button" className="thumb-action-btn remove" onClick={handleRemove}>
                🗑️ Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {showUploadZone && (
        <div
          className={`upload-zone ${dragging?'drag-over':''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        >
          <div className="upload-icon-wrap">🖼️</div>
          <p className="upload-primary-text"><strong>Click to upload</strong> or drag & drop</p>
          <p className="upload-secondary-text" style={{marginTop:4}}>JPEG · PNG · GIF · WEBP · Max 10 MB</p>
          <p className="upload-secondary-text" style={{marginTop:6,color:'#c9a84c'}}>✨ Image editor opens automatically</p>
        </div>
      )}

      {removed && !preview && (
        <div style={{marginTop:8,fontSize:'0.8rem',color:'#e05252',background:'rgba(224,82,82,0.08)',padding:'7px 12px',borderRadius:8,border:'1px solid rgba(224,82,82,0.2)',fontFamily:'DM Sans,system-ui,sans-serif'}}>
          🗑️ Image will be removed when you save
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={e => handleFile(e.target.files[0])} style={{display:'none'}} />
    </div>
  );
}

export default ImageUpload;
