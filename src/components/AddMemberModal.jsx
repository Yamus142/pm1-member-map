import { useState, useEffect } from 'react';
import { PROVINCES, WARDS_BY_PROVINCE } from '../data/provinceCoords';

export default function AddMemberModal({ onAdd, onClose }) {
  const [name, setName] = useState('');
  const [province, setProvince] = useState('');
  const [ward, setWard] = useState('');
  const [error, setError] = useState('');

  const wards = province ? (WARDS_BY_PROVINCE[province] || []) : [];

  // Đóng khi nhấn Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Vui lòng nhập họ tên.'); return; }
    if (!province) { setError('Vui lòng chọn tỉnh/thành phố.'); return; }
    setError('');
    onAdd({ name: name.trim(), province, ward: ward || '' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Đăng ký thành viên</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ và tên *</label>
            <input
              type="text"
              placeholder="Nhập họ và tên..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Tỉnh / Thành phố *</label>
            <select
              value={province}
              onChange={(e) => { setProvince(e.target.value); setWard(''); }}
            >
              <option value="">-- Chọn tỉnh/thành phố --</option>
              {PROVINCES.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Phường / Xã</label>
            <select
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              disabled={!province}
            >
              <option value="">-- Chọn phường/xã (tuỳ chọn) --</option>
              {wards.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn-add">+ Thêm</button>
          </div>
        </form>
      </div>
    </div>
  );
}
