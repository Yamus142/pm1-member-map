// Script: merge 63 old provinces → 34 new provinces (Nghị quyết 202/2025/QH15)
// Dùng topojson để merge đúng topology (không bị lỗi geometry)
// Run: node scripts/merge-provinces.mjs

import { readFileSync, writeFileSync } from 'fs';
import { topology } from 'topojson-server';
import { merge, feature } from 'topojson-client';

const geo = JSON.parse(readFileSync('./src/data/vn-provinces.json', 'utf8'));

// Mapping: tên tỉnh mới → các tỉnh cũ (tên trong GeoJSON)
const MERGE_MAP = {
  'Hà Nội':      ['Hà Nội', 'Hòa Bình', 'Vĩnh Phúc'],
  'Cao Bằng':    ['Cao Bằng', 'Bắc Kạn'],
  'Tuyên Quang': ['Tuyên Quang', 'Hà Giang'],
  'Điện Biên':   ['Điện Biên'],
  'Lai Châu':    ['Lai Châu'],
  'Sơn La':      ['Sơn La'],
  'Lào Cai':     ['Lào Cai', 'Yên Bái'],
  'Thái Nguyên': ['Thái Nguyên', 'Bắc Giang'],
  'Lạng Sơn':    ['Lạng Sơn'],
  'Quảng Ninh':  ['Quảng Ninh'],
  'Bắc Ninh':    ['Bắc Ninh'],
  'Phú Thọ':     ['Phú Thọ'],
  'Hải Phòng':   ['Hải Phòng', 'Hải Dương'],
  'Hưng Yên':    ['Hưng Yên', 'Hà Nam', 'Thái Bình'],
  'Ninh Bình':   ['Ninh Bình', 'Nam Định'],
  'Thanh Hóa':   ['Thanh Hóa'],
  'Nghệ An':     ['Nghệ An'],
  'Hà Tĩnh':     ['Hà Tĩnh', 'Quảng Bình'],
  'Quảng Trị':   ['Quảng Trị'],
  'Huế':         ['Thừa Thiên - Huế'],
  'Đà Nẵng':     ['Đà Nẵng', 'Quảng Nam'],
  'Quảng Ngãi':  ['Quảng Ngãi', 'Bình Định'],
  'Gia Lai':     ['Gia Lai', 'Kon Tum'],
  'Khánh Hòa':   ['Khánh Hòa', 'Phú Yên'],
  'Đắk Lắk':    ['Đắk Lắk', 'Đăk Nông'],
  'Lâm Đồng':   ['Lâm Đồng', 'Ninh Thuận', 'Bình Thuận'],
  'Đồng Nai':   ['Đồng Nai', 'Bình Dương', 'Bình Phước'],
  'Hồ Chí Minh':['Hồ Chí Minh city', 'Long An', 'Bà Rịa - Vũng Tàu'],
  'Tây Ninh':    ['Tây Ninh'],
  'Đồng Tháp':  ['Đồng Tháp', 'Tiền Giang'],
  'Vĩnh Long':   ['Vĩnh Long', 'Bến Tre', 'Trà Vinh'],
  'An Giang':    ['An Giang', 'Kiên Giang'],
  'Cần Thơ':     ['Cần Thơ', 'Hậu Giang', 'Sóc Trăng'],
  'Cà Mau':      ['Cà Mau', 'Bạc Liêu'],
};

// Gán nhóm vào mỗi feature
const nameToGroup = {};
for (const [newName, oldNames] of Object.entries(MERGE_MAP)) {
  for (const old of oldNames) nameToGroup[old] = newName;
}

// Kiểm tra tên không khớp
for (const f of geo.features) {
  if (!nameToGroup[f.properties.name]) {
    console.warn('UNMAPPED:', f.properties.name);
  }
}

// Chuyển sang TopoJSON
const topo = topology({ provinces: geo });
const topoProvinces = topo.objects.provinces;

// Merge từng nhóm
const newFeatures = [];
for (const [newName, oldNames] of Object.entries(MERGE_MAP)) {
  // Lấy các arcs của những feature thuộc nhóm này
  const groupFeatures = topoProvinces.geometries.filter(
    g => oldNames.includes(g.properties?.name)
  );

  if (groupFeatures.length === 0) {
    console.error('No geometry found for:', newName);
    continue;
  }

  // merge() trả về geometry, cần bọc thành Feature
  const geometry = merge(topo, groupFeatures);
  newFeatures.push({ type: 'Feature', properties: { name: newName }, geometry });
  console.log(`✓ ${newName} (${groupFeatures.length} tỉnh → 1)`);
}

const result = {
  type: 'FeatureCollection',
  features: newFeatures,
};

writeFileSync('./src/data/vn-34provinces.json', JSON.stringify(result));
console.log(`\nDone! ${newFeatures.length} provinces → src/data/vn-34provinces.json`);
