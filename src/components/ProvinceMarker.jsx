import { Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';

// Icon cho 1 thành viên
const singleIcon = L.divIcon({
  className: '',
  html: `<div class="marker-single">1</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Tạo icon cluster động theo số lượng
const clusterIcon = (count) =>
  L.divIcon({
    className: '',
    html: `<div class="marker-cluster">${count}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

export default function ProvinceMarker({ province, members }) {
  const { lat, lng } = province;
  const count = members.length;

  const popupContent = (
    <div className="popup-content">
      <strong>{province.name}</strong>
      <p className="popup-count">{count} thành viên</p>
      <ul>
        {members.map((m) => (
          <li key={m.id}>
            <span className="popup-name">{m.name}</span>
            {m.ward && <span className="popup-ward"> — {m.ward}</span>}
          </li>
        ))}
      </ul>
    </div>
  );

  if (count === 1) {
    return (
      <Marker position={[lat, lng]} icon={singleIcon}>
        <Popup>{popupContent}</Popup>
      </Marker>
    );
  }

  return (
    <Marker position={[lat, lng]} icon={clusterIcon(count)}>
      <Popup>{popupContent}</Popup>
    </Marker>
  );
}
