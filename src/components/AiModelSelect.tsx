import Select, { type GroupBase, type StylesConfig } from 'react-select';

export type AiModelSelectOption = {
  value: string;
  label: string;
};

type AiModelSelectProps = {
  id: string;
  label: string;
  options: AiModelSelectOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

const MENU_PORTAL_Z_INDEX = 9999;

const selectStyles: StylesConfig<AiModelSelectOption, false, GroupBase<AiModelSelectOption>> = {
  control: (base, state) => ({
    ...base,
    borderRadius: '0.75rem',
    borderColor: state.isFocused ? '#a5b4fc' : '#e2e8f0',
    backgroundColor: '#ffffff',
    minHeight: '40px',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#1e293b',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.3)' : 'none',
    '&:hover': {
      borderColor: '#cbd5e1',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '2px 12px',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#1e293b',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#94a3b8',
    fontWeight: 500,
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: MENU_PORTAL_Z_INDEX,
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.75rem',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1)',
    zIndex: MENU_PORTAL_Z_INDEX,
  }),
  menuList: (base) => ({
    ...base,
    padding: '4px',
    maxHeight: '220px',
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: '0.5rem',
    fontSize: '0.8125rem',
    fontWeight: state.isSelected ? 700 : 600,
    color: state.isSelected ? '#312e81' : '#334155',
    backgroundColor: state.isSelected ? '#eef2ff' : state.isFocused ? '#f8fafc' : '#ffffff',
    cursor: 'pointer',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: '#94a3b8',
    paddingRight: '10px',
    '&:hover': {
      color: '#64748b',
    },
  }),
};

export default function AiModelSelect({
  id,
  label,
  options,
  value,
  onChange,
  disabled = false,
  placeholder,
}: AiModelSelectProps) {
  const selected = options.find((option) => option.value === value) ?? null;

  return (
    <div>
      <label htmlFor={id} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
        {label}
      </label>
      <Select
        inputId={id}
        aria-label={label}
        options={options}
        value={selected}
        onChange={(option) => onChange(option?.value ?? '')}
        isDisabled={disabled}
        placeholder={placeholder}
        styles={selectStyles}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
        menuPosition="fixed"
        classNamePrefix="ai-model-select"
        isSearchable
      />
    </div>
  );
}
