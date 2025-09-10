import React, { useState, useRef, useEffect } from 'react'

function Select({ label = "Select", options = [], error, ...props }) {
  const [isActive, setIsActive] = useState(false)
  const [hasValue, setHasValue] = useState(false)
  const selectRef = useRef(null)

  useEffect(() => {
    // Set hasValue when value changes from outside
    setHasValue(!!props.value)
  }, [props.value])

  const handleFocus = () => setIsActive(true)
  const handleBlur = (e) => {
    setIsActive(false)
    setHasValue(!!e.target.value)
  }
  const handleChange = (e) => {
    setHasValue(!!e.target.value)
    if (props.onChange) props.onChange(e)
  }

  const shouldFloat = isActive || hasValue
  const isError = !!error

  return (
    <div className="relative my-4 group">
      <div 
        className={`border rounded relative transition-all duration-500 ${
          isError 
            ? 'border-red-500' 
            : isActive 
              ? 'border-violet-600 ring-2 ring-violet-100' 
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={() => selectRef.current?.focus()}
      >
        <label
          className={`absolute left-3 pointer-events-none transition-all duration-300 ${
            shouldFloat
              ? 'text-violet-600 transform -translate-y-3.5 scale-90 bg-white px-1 top-0'
              : 'text-gray-500 top-3'
          } ${isError ? 'text-red-500' : ''}`}
        >
          {label}
          {props.required && <span className="text-red-500"> *</span>}
        </label>
        
        <select
          ref={selectRef}
          className={`w-full px-3 outline-none bg-transparent rounded-lg text-gray-800 appearance-none ${
            shouldFloat ? 'pt-5 pb-2' : 'py-3'
          }`}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        >
          <option value=""></option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isActive ? 'rotate-180 text-violet-600' : ''
            }`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {isError && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

export default Select
