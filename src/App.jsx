import { useState, useEffect, useRef, useCallback } from 'react';
import VietnamMap from './components/VietnamMap';
import MemberList from './components/MemberList';
import AddMemberModal from './components/AddMemberModal';
import Top10 from './components/Top10';
import { subscribeMembers, addMember } from './services/storage';
import './App.css';

export default function App() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribeMembers((data) => {
      setMembers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (memberData) => {
    await addMember(memberData);
    setShowModal(false);
  };

  const handleFocusProvince = useCallback((provinceName) => {
    mapRef.current?.focusProvince(provinceName);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Product Management 1</h1>
        <span className="subtitle">Khác quê hương, chung chí hướng — Bản đồ kết nối đồng hương toàn phòng</span>
        <button className="btn-open-modal" onClick={() => setShowModal(true)}>
          + Thêm thành viên
        </button>
      </header>

      <div className="app-body">
        <aside className="left-panel">
          <div className="hero-banner">
            <h2 className="hero-title">Cùng quê, cùng nhóm, cùng nhau!</h2>
            <p className="hero-desc">
              Bạn có biết đồng nghiệp ngồi cạnh có thể là đồng hương của bạn?
              Hãy chia sẻ quê quán để tìm thấy những người bạn cùng quê —
              kết nối từ gốc rễ, gắn kết trong công việc.
            </p>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-num">{members.length}</span>
                <span className="hero-stat-label">thành viên</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-num">{new Set(members.map(m => m.province)).size}</span>
                <span className="hero-stat-label">tỉnh thành</span>
              </div>
            </div>
          </div>
          <div className="left-top10">
            <Top10 members={members} onFocusProvince={handleFocusProvince} />
          </div>
          <div className="left-list">
            <MemberList members={members} onFocusProvince={handleFocusProvince} />
          </div>
        </aside>

        <main className="app-main">
          {loading ? (
            <div className="map-loading">Đang tải dữ liệu...</div>
          ) : (
            <VietnamMap ref={mapRef} members={members} />
          )}
        </main>
      </div>

      {showModal && (
        <AddMemberModal onAdd={handleAdd} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
