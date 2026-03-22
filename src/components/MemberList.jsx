import { useState } from 'react';

export default function MemberList({ members, onFocusProvince }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="member-list">
      <h2 onClick={() => setCollapsed(!collapsed)} style={{ cursor: 'pointer', userSelect: 'none' }}>
        <span className="collapse-icon">{collapsed ? '▸' : '▾'}</span>
        Thành viên
        {members.length > 0 && <span className="count-badge">{members.length}</span>}
      </h2>
      {!collapsed && (
        members.length === 0 ? (
          <p className="empty-msg">Chưa có thành viên nào.</p>
        ) : (
          <ul className="member-cards">
            {members.map((m, i) => (
              <li
                key={m.id}
                className="member-card"
                onClick={() => onFocusProvince?.(m.province)}
                title={`Click để xem ${m.province} trên bản đồ`}
              >
                <span className="mc-num">{i + 1}</span>
                <div className="mc-info">
                  <span className="mc-name">{m.name}</span>
                  <span className="mc-province">{m.province}{m.ward ? ` · ${m.ward}` : ''}</span>
                </div>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}
