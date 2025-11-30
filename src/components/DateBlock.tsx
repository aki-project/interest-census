import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'isomorphic-dompurify';

interface DateBlockProps {
  initialValue: string;
  registerNewDates: (newValue: DateFragProps[]) => void;
}

export interface DateFragProps {
  year: number;
  isBold: boolean;
  isItalic: boolean;
}

const DateBlock: React.FC<DateBlockProps> = ({ initialValue, registerNewDates }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [storedValue, setStoredValue] = useState(initialValue);
  const [newValue, setNewValue] = useState(initialValue);
  const editingRef = useRef<HTMLDivElement>(null);

  const setAndSanitizeStoredValue = (unsanitizedHTML: string) => {
    const clean = DOMPurify.sanitize(
      unsanitizedHTML,
      {
        ALLOWED_TAGS: ['b', 'i'],
        ALLOWED_ATTR: [],
      })
    console.log(parseYearString(clean));
    registerNewDates(parseYearString(clean));
    setStoredValue(clean);
  }

  const parseYearString = (str: string) : DateFragProps[] => {
    const results = [];
    let isBold = false;
    let isItalic = false;

    const regex = /(<b>)|(<\/b>)|(<i>)|(<\/i>)|(\d{4})(\-(\d{4}))?/g;

    let match;
    while ((match = regex.exec(str)) !== null) {
      console.log(match);

      if (match[1]) {
        isBold = true;
      } else if (match[2]) {
        isBold = false;
      } else if (match[3]) {
        isItalic = true;
      } else if (match[4]) {
        isItalic = false;
      } else if (match[5] && match[6]) {
        const startYear = parseInt(match[5]);
        if (startYear < 1970 || startYear > (new Date().getFullYear() + 2)) {
          continue;
        }
        const endYear = parseInt(match[7]);
        if (endYear < 1970 || endYear > (new Date().getFullYear() + 2)) {
          continue;
        }
        for (let year = startYear; year <= endYear; year++) {
          results.push({
            year: year,
            isBold: isBold,
            isItalic: isItalic
          });
        }
      } else if (match[5]) {
        const year = parseInt(match[5]);
        if (year < 1970 || year > (new Date().getFullYear() + 2)) {
          continue;
        }
        results.push({
          year: year,
          isBold: isBold,
          isItalic: isItalic
        });
      }
    }
    return results;
  }

  // keep a running tag of whether the current index is bold or not.
  // triple: b (boolean), i (boolean), datestring.
  // const dateFragmenter = (rawDateFragments: string[]): DateFragProps[] => {
  //   let currentlyBold = false;
  //   let currentlyItalic = false;
  //   for (const rawDateFragment of rawDateFragments) {

  //   }
  // }

  const handleSave = () => {
    if (newValue.trim() === '') {
      setAndSanitizeStoredValue(storedValue);
    } else {
      setAndSanitizeStoredValue(newValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setAndSanitizeStoredValue(storedValue);
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
