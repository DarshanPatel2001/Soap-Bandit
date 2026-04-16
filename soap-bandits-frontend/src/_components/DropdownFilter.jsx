import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const DropdownFilter = ({
  label,
  options,
  selected,
  onToggle,
  fullWidth = false,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`dropdown-filter ${fullWidth ? 'u-w-full' : ''}`} ref={ref}>
      <button
        type="button"
        className={`dropdown-trigger ${open || selected.length > 0 ? 'active' : ''} ${fullWidth ? 'u-w-full' : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="u-truncate">
          {selected.length > 0 ? `${label}: ${selected.length}` : label}
        </span>
        <span className="dropdown-arrow">▾</span>
      </button>
      {open && (
        <div className="dropdown-panel">
          {options.map((opt) => (
            <label
              key={opt}
              className="toggle-row"
              onClick={() => onToggle(opt)}
            >
              <span className="toggle-label">{opt}</span>
              <div
                className={`toggle-switch ${selected.includes(opt) ? 'on' : ''}`}
              >
                <div className="toggle-knob" />
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

DropdownFilter.propTypes = {
  label: PropTypes.string,
  options: PropTypes.array,
  selected: PropTypes.array,
  onToggle: PropTypes.func,
  fullWidth: PropTypes.bool,
};

export default DropdownFilter;
