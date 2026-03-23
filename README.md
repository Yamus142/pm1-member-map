# Bản đồ Đồng Hương PM1

> Web app tương tác giúp thành viên phòng Product Management 1 khám phá quê quán của nhau trên bản đồ Việt Nam.

**Live:** [pm1-member-map.vercel.app](https://pm1-member-map.vercel.app/)

---

## Giới thiệu

**Bản đồ Đồng Hương PM1** là một ứng dụng web cho phép các thành viên trong phòng Product Management 1 đăng ký quê quán và xem bản đồ phân bố đồng hương trên toàn lãnh thổ Việt Nam.

### Vấn đề giải quyết

Trong một team lớn, mọi người thường không biết ai là đồng hương của mình. Ứng dụng này giúp:

- Kết nối những người cùng quê, tạo gắn kết nội bộ
- Trực quan hóa sự đa dạng vùng miền trong team
- Tạo chủ đề trò chuyện, phá băng giữa các thành viên

### Tính năng chính

- **Bản đồ tương tác** — Bản đồ Việt Nam 34 tỉnh/thành (theo Nghị quyết 202/2025/QH15), zoom/pan bằng chuột, hiển thị mật độ thành viên bằng màu sắc
- **Thêm thành viên** — Đăng ký nhanh với tên, tỉnh/thành, quận/huyện
- **Top 5 tỉnh** — Bảng xếp hạng tỉnh có nhiều thành viên nhất
- **Danh sách thành viên** — Xem toàn bộ thành viên, click để focus vào tỉnh trên bản đồ
- **Tooltip chi tiết** — Click vào tỉnh để xem danh sách thành viên ở đó
- **Realtime sync** — Dữ liệu đồng bộ ngay lập tức qua Firebase Firestore
- **Đảo & quần đảo** — Hiển thị Hoàng Sa, Trường Sa trên bản đồ

---

## Tech Stack

| Phần | Công nghệ |
|------|-----------|
| Frontend | React 19 + Vite 8 |
| Bản đồ | D3.js (d3-geo, d3-zoom, d3-selection) |
| Database | Firebase Firestore (realtime) |
| Địa lý | TopoJSON, GeoJSON 34 tỉnh hợp nhất |
| Styling | CSS thuần, font Be Vietnam Pro |
| Deploy | Vercel |

---

## Cài đặt & Chạy

```bash
# Clone repo
git clone https://github.com/Yamus142/pm1-member-map.git
cd pm1-member-map

# Cài dependencies
npm install

# Tạo file .env từ template
cp .env.example .env
# Điền Firebase config vào .env

# Chạy dev server
npm run dev
```

---

## Cấu trúc dự án

```
src/
├── components/
│   ├── VietnamMap.jsx         # Bản đồ D3.js chính
│   ├── AddMemberModal.jsx     # Modal thêm thành viên
│   ├── MemberList.jsx         # Danh sách thành viên
│   └── Top10.jsx              # Top 5 tỉnh nhiều thành viên
├── data/
│   ├── provinceCoords.js      # Tọa độ 34 tỉnh + quận/huyện
│   ├── vn-34provinces.json    # GeoJSON 34 tỉnh hợp nhất
│   └── vn-provinces.json      # GeoJSON 63 tỉnh gốc
├── services/
│   ├── firebase.js            # Firebase config
│   └── storage.js             # Firestore CRUD operations
├── App.jsx                    # Component chính
└── main.jsx                   # Entry point
```

---

## Tiến trình phát triển

### Phase 1 — Setup & Bản đồ cơ bản
- Khởi tạo project React + Vite
- Tích hợp D3.js render bản đồ Việt Nam từ GeoJSON
- Zoom, pan, double-click reset view

### Phase 2 — Hợp nhất tỉnh thành
- Viết script merge 63 tỉnh cũ → 34 tỉnh mới (theo Nghị quyết 202/2025/QH15)
- Sử dụng TopoJSON để merge geometry chính xác
- Cập nhật tọa độ trung tâm và danh sách quận/huyện cho 34 tỉnh

### Phase 3 — Firebase & Dữ liệu
- Tích hợp Firebase Firestore làm database
- Realtime sync với onSnapshot
- Seed ~280 thành viên mẫu để test

### Phase 4 — Giao diện & Tương tác
- Thiết kế dark theme (navy/cyan)
- Modal thêm thành viên (chọn tỉnh → cascading dropdown quận/huyện)
- Bảng xếp hạng Top 5 tỉnh
- Danh sách thành viên (click để focus trên bản đồ)
- Tooltip hiển thị thành viên theo tỉnh
- Choropleth coloring theo mật độ thành viên

### Phase 5 — Deploy
- Build production với Vite
- Deploy lên Vercel
- Live tại [pm1-member-map.vercel.app](https://pm1-member-map.vercel.app/)

---

## Tác giả

Phòng Product Management 1
