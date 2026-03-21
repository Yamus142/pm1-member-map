import { useState, useEffect, useRef, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { zoom as d3zoom, zoomIdentity } from 'd3-zoom';
import { select } from 'd3-selection';
import { PROVINCES } from '../data/provinceCoords';
import geoData from '../data/vn-34provinces.json';

const HOANG_SA  = { lng: 112.0, lat: 16.5, name: 'Đặc khu Hoàng Sa',  province: 'Đà Nẵng' };
const TRUONG_SA = { lng: 113.5, lat: 9.0,  name: 'Đặc khu Trường Sa', province: 'Khánh Hòa' };

function getChoroplethFill(count, maxCount) {
  if (count === 0 || maxCount === 0) return 'rgba(14, 40, 80, 0.15)';
  const t = Math.min(count / maxCount, 1);
  if (t <= 0.5) {
    const s = t / 0.5;
    return `rgba(${Math.round(14+s*20)},${Math.round(40+s*100)},${Math.round(80+s*120)},${(0.15+s*0.25).toFixed(2)})`;
  }
  const s = (t - 0.5) / 0.5;
  return `rgba(${Math.round(34)},${Math.round(140+s*57)},${Math.round(200-s*106)},${(0.4+s*0.25).toFixed(2)})`;
}

function getProvinceStroke(count) {
  return count === 0 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(56, 189, 248, 0.55)';
}

const VietnamMap = forwardRef(function VietnamMap({ members }, ref) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const zoomerRef = useRef(null);
  const [dims, setDims] = useState({
    w: Math.max(window.innerWidth - 310, 400),
    h: Math.max(window.innerHeight - 52, 400),
  });
  const [zoomTransform, setZoomTransform] = useState('');
  const [tooltip, setTooltip] = useState(null);
  const [focusedProvince, setFocusedProvince] = useState(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) setDims({ w: Math.round(width), h: Math.round(height) });
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, []);

  const projection = useMemo(() => {
    if (!dims.w || !dims.h) return null;
    return geoMercator().fitExtent(
      [[20, 20], [dims.w - 20, dims.h - 20]],
      { type: 'FeatureCollection', features: geoData.features }
    );
  }, [dims]);

  const pathGen = useMemo(
    () => (projection ? geoPath().projection(projection) : null),
    [projection]
  );

  const byProvince = useMemo(() => {
    const map = {};
    members.forEach((m) => {
      if (!map[m.province]) map[m.province] = [];
      map[m.province].push(m);
    });
    return map;
  }, [members]);

  const maxCount = useMemo(() => {
    return Math.max(1, ...Object.values(byProvince).map(arr => arr.length));
  }, [byProvince]);

  const getProvinceNameFromFeature = useCallback((feature) => {
    return feature.properties?.name || feature.properties?.Name || '';
  }, []);

  const provincePaths = useMemo(() => {
    if (!pathGen) return [];
    return geoData.features.map((f, i) => {
      const d = pathGen(f);
      const name = getProvinceNameFromFeature(f);
      const count = byProvince[name]?.length || 0;
      return { id: i, d, name, count, fill: getChoroplethFill(count, maxCount), stroke: getProvinceStroke(count) };
    });
  }, [pathGen, byProvince, maxCount, getProvinceNameFromFeature]);

  useEffect(() => {
    if (!svgRef.current || !dims.w) return;
    const svg = select(svgRef.current);
    const zoomer = d3zoom()
      .scaleExtent([0.8, 15])
      .on('zoom', (e) => {
        setTooltip(null);
        const { x, y, k } = e.transform;
        setZoomTransform(`translate(${x},${y}) scale(${k})`);
      });
    zoomerRef.current = zoomer;
    svg.call(zoomer);
    svg.on('dblclick.zoom', () => {
      svg.transition().duration(400).call(zoomer.transform, zoomIdentity);
      setFocusedProvince(null);
    });
    return () => svg.on('.zoom', null);
  }, [dims.w]);

  // Expose focusProvince to parent via ref
  useImperativeHandle(ref, () => ({
    focusProvince(provinceName) {
      if (!projection || !svgRef.current || !zoomerRef.current) return;
      const prov = PROVINCES.find(p => p.name === provinceName);
      if (!prov) return;

      const pt = projection([prov.lng, prov.lat]);
      if (!pt) return;

      const svg = select(svgRef.current);
      const scale = 5;
      const tx = dims.w / 2 - pt[0] * scale;
      const ty = dims.h / 2 - pt[1] * scale;

      svg.transition().duration(600).call(
        zoomerRef.current.transform,
        zoomIdentity.translate(tx, ty).scale(scale)
      );

      setFocusedProvince(provinceName);
      // Show tooltip at center
      const pMembers = byProvince[provinceName] || [];
      if (pMembers.length > 0) {
        setTimeout(() => {
          setTooltip({
            x: dims.w / 2 + 30,
            y: dims.h / 2 - 20,
            province: provinceName,
            members: pMembers,
            isFixed: true,
          });
        }, 650);
      }
    },
    resetZoom() {
      if (!svgRef.current || !zoomerRef.current) return;
      const svg = select(svgRef.current);
      svg.transition().duration(400).call(zoomerRef.current.transform, zoomIdentity);
      setFocusedProvince(null);
      setTooltip(null);
    }
  }), [projection, dims, byProvince]);

  const markers = useMemo(() => {
    if (!projection) return [];
    return PROVINCES.map((p) => {
      const pt = projection([p.lng, p.lat]);
      if (!pt) return null;
      const pMembers = byProvince[p.name] || [];
      return { ...p, x: pt[0], y: pt[1], pMembers, hasMembers: pMembers.length > 0 };
    }).filter(Boolean);
  }, [projection, byProvince]);

  const hoangSaPt = useMemo(() => projection ? projection([HOANG_SA.lng, HOANG_SA.lat]) : null, [projection]);
  const truongSaPt = useMemo(() => projection ? projection([TRUONG_SA.lng, TRUONG_SA.lat]) : null, [projection]);
  const hoangSaMembers = useMemo(() => (byProvince['Đà Nẵng'] || []).filter((m) => m.ward === 'Đặc khu Hoàng Sa'), [byProvince]);
  const truongSaMembers = useMemo(() => (byProvince['Khánh Hòa'] || []).filter((m) => m.ward === 'Đặc khu Trường Sa'), [byProvince]);

  const handleMarkerClick = useCallback((e, m) => {
    e.stopPropagation();
    if (m.hasMembers) setTooltip({ x: e.clientX, y: e.clientY, province: m.name, members: m.pMembers });
  }, []);

  const handleIslandClick = useCallback((e, name, islandMembers) => {
    e.stopPropagation();
    if (islandMembers.length > 0) setTooltip({ x: e.clientX, y: e.clientY, province: name, members: islandMembers });
  }, []);

  const IslandMarker = ({ pt, islandMembers, label, province, onClick }) => {
    if (!pt) return null;
    const [x, y] = pt;
    const hasM = islandMembers.length > 0;
    return (
      <g style={{ cursor: hasM ? 'pointer' : 'default' }} onClick={onClick}>
        <circle cx={x - 5} cy={y - 3} r={1.8} fill="rgba(56,189,248,0.4)" />
        <circle cx={x + 3} cy={y - 6} r={1.4} fill="rgba(56,189,248,0.3)" />
        <circle cx={x + 6} cy={y + 1} r={1.6} fill="rgba(56,189,248,0.35)" />
        <circle cx={x - 2} cy={y + 4} r={1.2} fill="rgba(56,189,248,0.25)" />
        <circle cx={x + 1} cy={y + 7} r={1.0} fill="rgba(56,189,248,0.2)" />
        {hasM && (
          <>
            <circle cx={x} cy={y} r={14} fill="rgba(56,189,248,0.04)" />
            <circle cx={x} cy={y} r={8}  fill="rgba(56,189,248,0.1)" filter="url(#glow-lg)" />
            <circle cx={x} cy={y} r={4}  fill="rgba(56,189,248,0.45)" filter="url(#glow-xl)" />
            <circle cx={x} cy={y} r={2}  fill="rgba(125,211,252,0.9)" />
            <circle cx={x} cy={y} r={0.8} fill="white" />
            {islandMembers.length > 1 && (
              <text x={x} y={y - 18} textAnchor="middle"
                fill="#7dd3fc" fontSize={8} fontWeight="bold" fontFamily="'Fira Code', monospace"
                filter="url(#glow-sm)">{islandMembers.length}</text>
            )}
          </>
        )}
        <text x={x + 10} y={y - 4} textAnchor="start"
          fill="rgba(125,211,252,0.7)" fontSize={7.5} fontWeight="bold" fontFamily="'Be Vietnam Pro', sans-serif"
          filter="url(#glow-sm)">{label}</text>
        <text x={x + 10} y={y + 6} textAnchor="start"
          fill="rgba(100,116,139,0.6)" fontSize={6} fontFamily="'Be Vietnam Pro', sans-serif">({province})</text>
      </g>
    );
  };

  return (
    <div ref={containerRef} className="vn-map-container" onClick={() => { setTooltip(null); setFocusedProvince(null); }}>
      <div className="map-title">PRODUCT MANAGEMENT 1</div>
      <div className="zoom-hint">Scroll để zoom · Kéo để di chuyển · Double-click để reset</div>

      <div className="map-legend">
        <div className="map-legend-title">Mật độ thành viên</div>
        <div className="map-legend-scale">
          <span className="map-legend-label">0</span>
          <div className="map-legend-bar" />
          <span className="map-legend-label">{maxCount}</span>
        </div>
      </div>

      <svg ref={svgRef} width={dims.w} height={dims.h}
        style={{ display: 'block', position: 'absolute', top: 0, left: 0, cursor: 'grab' }}
        role="img" aria-label="Bản đồ Việt Nam hiển thị vị trí thành viên theo tỉnh thành">
        <defs>
          <radialGradient id="bgGrad" cx="45%" cy="33%" r="68%">
            <stop offset="0%" stopColor="#0f2847" />
            <stop offset="55%" stopColor="#081b35" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
          <filter id="glow-xl" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-lg" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-sm" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Highlight pulse for focused province */}
          <filter id="glow-focus" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="8" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect width={dims.w} height={dims.h} fill="url(#bgGrad)" />

        <g transform={zoomTransform || undefined}>
          {provincePaths.map(({ id, d, name, fill, stroke, count }) =>
            d ? (
              <path key={id} d={d}
                fill={focusedProvince === name ? 'rgba(56, 189, 248, 0.35)' : fill}
                stroke={focusedProvince === name ? 'rgba(125, 211, 252, 0.9)' : stroke}
                strokeWidth={focusedProvince === name ? 1.8 : (count > 0 ? 0.8 : 0.5)}
                strokeLinejoin="round"
                style={{ transition: 'fill 300ms ease, stroke 300ms ease, stroke-width 300ms ease' }}
              />
            ) : null
          )}

          <IslandMarker pt={hoangSaPt} islandMembers={hoangSaMembers} label="HOÀNG SA" province="Đà Nẵng"
            onClick={(e) => handleIslandClick(e, 'Đặc khu Hoàng Sa', hoangSaMembers)} />
          <IslandMarker pt={truongSaPt} islandMembers={truongSaMembers} label="TRƯỜNG SA" province="Khánh Hòa"
            onClick={(e) => handleIslandClick(e, 'Đặc khu Trường Sa', truongSaMembers)} />

          {markers.map((m) =>
            m.hasMembers ? (
              <g key={m.id} style={{ cursor: 'pointer' }} onClick={(e) => handleMarkerClick(e, m)}
                role="button" tabIndex={0} aria-label={`${m.name}: ${m.pMembers.length} thành viên`}
                onKeyDown={(e) => { if (e.key === 'Enter') handleMarkerClick(e, m); }}>
                <circle cx={m.x} cy={m.y} r={focusedProvince === m.name ? 28 : 22} fill="rgba(56,189,248,0.04)"
                  style={{ transition: 'r 300ms ease' }} />
                <circle cx={m.x} cy={m.y} r={focusedProvince === m.name ? 16 : 13} fill="rgba(56,189,248,0.1)"
                  filter={focusedProvince === m.name ? 'url(#glow-focus)' : 'url(#glow-lg)'}
                  style={{ transition: 'r 300ms ease' }} />
                <circle cx={m.x} cy={m.y} r={7} fill="rgba(56,189,248,0.4)" filter="url(#glow-xl)" />
                <circle cx={m.x} cy={m.y} r={3.5} fill="rgba(125,211,252,0.9)" filter="url(#glow-lg)" />
                <circle cx={m.x} cy={m.y} r={1.5} fill="white" />
                {m.pMembers.length > 1 && (
                  <text x={m.x} y={m.y - 26} textAnchor="middle"
                    fill="#7dd3fc" fontSize={9} fontWeight="bold" fontFamily="'Fira Code', monospace"
                    filter="url(#glow-sm)">{m.pMembers.length}</text>
                )}
              </g>
            ) : null
          )}
        </g>
      </svg>

      {tooltip && (
        <div className="map-tooltip"
          style={{
            left: tooltip.isFixed ? undefined : tooltip.x + 14,
            top: tooltip.isFixed ? undefined : tooltip.y - 12,
            ...(tooltip.isFixed ? { right: 24, top: 60 } : {}),
          }}
          onClick={(e) => e.stopPropagation()}>
          <div className="tooltip-header">{tooltip.province}</div>
          <div className="tooltip-count">{tooltip.members.length} thành viên</div>
          <ul className="tooltip-list">
            {tooltip.members.map((member) => (
              <li key={member.id}>
                <span className="tooltip-name">{member.name}</span>
                {member.ward && <span className="tooltip-ward"> · {member.ward}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

export default VietnamMap;
