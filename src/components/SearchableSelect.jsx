import { useState, useRef, useEffect } from 'react';

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = '-- Chọn --',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Normalize tiếng Việt để tìm kiếm không dấu
  const normalize = (str) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');

  const filtered = options.filter((opt) => {
    if (!search.trim()) return true;
    return normalize(opt).includes(normalize(search));
  });

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input khi mở dropdown
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (opt) => {
    onChange(opt);
    setIsOpen(false);
    setSearch('');
  };

  const handleOpen = () => {
    if (!disabled) {
      setIsOpen(true);
      setSearch('');
    }
  };

  const displayValue = value || placeholder;

  return (
    <div className="searchable-select" ref={containerRef}>
      {/* Nút mở dropdown */}
      <button
        type="button"
        className={`searchable-select-trigger ${disabled ? 'disabled' : ''} ${value ? 'has-value' : ''}`}
        onClick={handleOpen}
        disabled={disabled}
      >
        <span>{displayValue}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="searchable-select-dropdown">
          {/* Ô tìm kiếm */}
          <div className="searchable-select-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsOpen(false);
                  setSearch('');
                }
                if (e.key === 'Enter' && filtered.length === 1) {
                  handleSelect(filtered[0]);
                }
              }}
            />
          </div>

          {/* Danh sách options */}
          <ul className="searchable-select-options">
            {filtered.length === 0 ? (
              <li className="searchable-select-empty">Không tìm thấy</li>
            ) : (
              filtered.map((opt) => (
                <li
                  key={opt}
                  className={`searchable-select-option ${opt === value ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt)}
                >
                  {opt}
                  {opt === value && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="3">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
