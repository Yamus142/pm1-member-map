import { useState } from 'react';
import { PROVINCES, WARDS_BY_PROVINCE } from '../data/provinceCoords';

export default function MemberForm({ onAdd }) {
  const [name, setName] = useState('');
  const [province, setProvince] = useState('');
  const [ward, setWard] = useState('');
  const [error, setError] = useState('');

  const wards = province ? (WARDS_BY_PROVINCE[province] || []) : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Vui lòng nhập họ tên.'); return; }
    if (!province) { setError('Vui lòng chọn tỉnh/thành phố.'); return; }
    setError('');
    onAdd({ name: name.trim(), province, ward: ward || '' });
    setName('');
    setProvince('');
    setWard('');
  };

  return (
    <form className="member-form" onSubmit={handleSubmit}>
      <h2>Đăng ký thành viên</h2>

      <div className="form-group">
        <label>Họ và tên *</label>
        <input
          type="text"
          placeholder="Nhập họ và tên..."
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          <option value="">-- Chọn phường/xã --</option>
          {wards.map((w) => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>
      </div>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="btn-add">+ Thêm thành viên</button>
    </form>
  );
}
