export default function Top10({ members, onFocusProvince }) {
  const provinceCount = {};
  members.forEach((m) => {
    if (!provinceCount[m.province]) {
      provinceCount[m.province] = { province: m.province, count: 0, names: [] };
    }
    provinceCount[m.province].count++;
    provinceCount[m.province].names.push(m.name);
  });

  const top10 = Object.values(provinceCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const medals = ['\u{1F947}', '\u{1F948}', '\u{1F949}'];

  return (
    <div className="top10">
      <h2 className="top10-title">
        Top 5 Đồng Hương
        <span className="count-badge">{top10.length}</span>
      </h2>

      {top10.length === 0 ? (
        <p className="empty-msg">Chưa có dữ liệu.</p>
      ) : (
        <ol className="top10-list">
          {top10.map((item, i) => (
            <li
              key={item.province}
              className={`top10-item rank-${i + 1}`}
              onClick={() => onFocusProvince?.(item.province)}
              title={`Click để xem ${item.province} trên bản đồ`}
            >
              <span className="top10-rank">
                {i < 3 ? medals[i] : <span className="rank-num">{i + 1}</span>}
              </span>
              <div className="top10-info">
                <span className="top10-province">{item.province}</span>
                <span className="top10-names">
                  {item.names.slice(0, 3).join(', ')}
                  {item.names.length > 3 && ` +${item.names.length - 3} người`}
                </span>
              </div>
              <span className="top10-count">{item.count}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
