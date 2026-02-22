export default function TextArea({ value, onChange, placeholder, rows = 8, label, className = '', ...props }) {
  const charCount = value ? value.length : 0;

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="glass-input w-full px-4 py-3 resize-y"
        {...props}
      />
      <div className="flex justify-end mt-1">
        <span className="text-xs text-gray-500">{charCount.toLocaleString()} characters</span>
      </div>
    </div>
  );
}
