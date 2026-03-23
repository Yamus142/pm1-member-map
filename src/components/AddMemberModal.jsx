import { useState, useEffect } from 'react';
import { PROVINCES, WARDS_BY_PROVINCE } from '../data/provinceCoords';
import SearchableSelect from './SearchableSelect';

export default function AddMemberModal({ onAdd, onClose }) {
  const [name, setName] = useState('');
  const [province, setProvince] = useState('');
  const [ward, setWard] = useState('');
  const [error, setError] = useState('');

  const provinceNames = PROVINCES.map((p) => p.name);
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
            <SearchableSelect
              options={provinceNames}
              value={province}
              onChange={(val) => { setProvince(val); setWard(''); }}
              placeholder="-- Chọn tỉnh/thành phố --"
            />
          </div>

          <div className="form-group">
            <label>Phường / Xã</label>
            <SearchableSelect
              options={wards}
              value={ward}
              onChange={setWard}
              placeholder="-- Chọn phường/xã (tuỳ chọn) --"
              disabled={!province}
            />
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
