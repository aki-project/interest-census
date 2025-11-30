import React, { useState, useEffect, useRef } from 'react';

interface EditableLabelProps {
  initialValue: string;
  onSave: (newValue: string) => void;
}

const EditableLabel: React.FC<EditableLabelProps> = ({ initialValue, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (value.trim() === '') {
      setValue(initialValue);
    } else {
      onSave(value);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setValue(initialValue);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
      />
    );
  }

  const labelClasses = "";

  return (
    <div
      onClick={() => setIsEditing(true)}
    >
      <span className={labelClasses}>{value}</span>
    </div>
  );
};

export default EditableLabel;
