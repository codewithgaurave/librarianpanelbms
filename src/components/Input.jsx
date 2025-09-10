import React, { useState, useRef, useEffect } from 'react'

function Input({ label, type, error, ...props }) {
  const [isActive, setIsActive] = useState(false)
  const [hasValue, setHasValue] = useState(!!props.value)
  const inputRef = useRef(null)

  const handleFocus = () => setIsActive(true)
  const handleBlur = (e) => {
    setIsActive(false)
    setHasValue(!!e.target.value)
  }
  const handleChange = (e) => {
    setHasValue(!!e.target.value)
    if (props.onChange) props.onChange(e)
  }

  useEffect(() => {
    setHasValue(!!props.value); // re-check when value prop changes
  }, [props.value]);


  const shouldFloat = isActive || hasValue
  const isError = !!error

  return (
    <div className="relative my-4 group">
      <div 
        className={`border rounded relative transition-all duration-300 ${
          isError 
            ? 'border-red-500' 
            : isActive 
              ? 'border-violet-600 ring-2 ring-violet-100' 
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        <label
          className={`absolute left-3 pointer-events-none transition-all duration-300 ${
            shouldFloat
              ? 'text-violet-600 transform -translate-y-3.5 scale-90 bg-white px-1'
              : 'text-gray-500 top-3'
          } ${isError ? 'text-red-500' : ''}`}
        >
          {label}
          {props.required && <span className="text-red-500"> *</span>}
        </label>
        
        <input
          ref={inputRef}
          type={type}
          className={`w-full px-3 py-3 outline-none bg-transparent rounded-lg text-gray-800 ${
            shouldFloat ? 'pt-4 pb-2' : 'py-3'
          } `}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />
      </div>
      
      {isError && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

export default Input