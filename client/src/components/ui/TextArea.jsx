import { useState } from 'react';

export default function TextArea({ value, onChange, placeholder, minLength = 0, maxLength = 50000, rows = 8, label, className = '', ...props }) {
  const charCount = value ? value.length : 0;
  const isOverLimit = maxLength && charCount > maxLength;
  const isUnderMin = minLength && charCount > 0 && charCount < minLength;

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full rounded-lg border px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-y ${
          isOverLimit || isUnderMin ? 'border-red-300' : 'border-gray-300'
        }`}
        {...props}
      />
      <div className="flex justify-between mt-1">
        <span className={`text-xs ${isUnderMin ? 'text-red-500' : 'text-gray-400'}`}>
          {isUnderMin ? `Minimum ${minLength} characters` : ''}
        </span>
        <span className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
          {charCount.toLocaleString()}{maxLength ? ` / ${maxLength.toLocaleString()}` : ''}
        </span>
      </div>
    </div>
  );
}
