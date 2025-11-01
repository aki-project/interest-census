import React, { useState, useEffect, useRef } from 'react';

interface DateBlockProps {
  initialValue: string;
}

const DateBlock: React.FC<DateBlockProps> = ({ initialValue }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [storedValue, setStoredValue] = useState(initialValue);
  const [newValue, setNewValue] = useState(initialValue);
  const editingRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    if (newValue.trim() === '') {
      setStoredValue(storedValue);
    } else {
      setStoredValue(newValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setStoredValue(storedValue);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (isEditing) {
      if (editingRef?.current) {
        editingRef.current.innerHTML = storedValue;
      }
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <div
        contentEditable="true"
        autoFocus
        suppressContentEditableWarning
        ref={editingRef}
        onInput={(e) => setNewValue(e.currentTarget.innerHTML)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
      >
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      dangerouslySetInnerHTML={{__html: storedValue}}
    >
    </div>
  );
}

export default DateBlock;
