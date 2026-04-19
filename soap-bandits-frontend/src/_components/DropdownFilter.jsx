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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format the trigger text to be more helpful
  const getTriggerText = () => {
    if (selected.length === 0) return label;
    if (selected.length === 1) return `${label}: ${selected[0]}`;
    return `${label}: ${selected.length}`;
  };

  return (
    <div className={`dropdown-filter ${fullWidth ? 'u-w-full' : ''}`} ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`dropdown-trigger ${open || selected.length > 0 ? 'active' : ''} ${fullWidth ? 'u-w-full' : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="u-truncate">{getTriggerText()}</span>
        <span className={`dropdown-arrow ${open ? 'open' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="dropdown-panel" role="listbox">
          {options.map((opt) => {
            const isChecked = selected.includes(opt);
            return (
              <div
                key={opt}
                role="option"
                aria-selected={isChecked}
                className="toggle-row"
                onClick={() => onToggle(opt)}
              >
                <span className="toggle-label">{opt}</span>
                <div className={`toggle-switch ${isChecked ? 'on' : ''}`}>
                  <div className="toggle-knob" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

DropdownFilter.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  selected: PropTypes.array.isRequired,
  onToggle: PropTypes.func.isRequired,
  fullWidth: PropTypes.bool,
};

export default DropdownFilter;
