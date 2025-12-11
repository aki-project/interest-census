import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'isomorphic-dompurify';

interface DateBlockProps {
  initialValue: string;
  registerNewDates: (newValue: DateFragProps[]) => void;
  storedValue: string;
  setStoredValue: (val: string) => void;
  newValue: string;
  setNewValue: (val: string) => void;
}

export interface DateFragProps {
  year: number;
  isBold: boolean;
  isItalic: boolean;
}

export const fragsToHtml = (frags: DateFragProps[]): string => {
  if (frags.length == 0) return "";

  const sortedFrags = [...frags].sort((a, b) => a.year - b.year);
  const parts: string[] = [];

  let i = 0;
  const len = sortedFrags.length;
  while (i < len) {
    const startFrag = sortedFrags[i];
    let j = i;

    while (
      j + 1 < len &&
      sortedFrags[j + 1].year === sortedFrags[j].year + 1 &&
      sortedFrags[j + 1].isBold === startFrag.isBold &&
      sortedFrags[j + 1].isItalic === startFrag.isItalic
    ) {
      j++;
    }

    const endYear = sortedFrags[j].year;
    const text = i === j ? `${startFrag.year}` : `${startFrag.year}-${endYear}`;

    let wrapped = text;
    if (startFrag.isItalic) wrapped = `<i>${wrapped}</i>`;
    if (startFrag.isBold) wrapped = `<b>${wrapped}</b>`;

    parts.push(wrapped);

    i = j + 1;
  }

  return parts.join(', ');
}

const DateBlock: React.FC<DateBlockProps> = ({ initialValue, registerNewDates, storedValue, setStoredValue, newValue, setNewValue }) => {
  const [isEditing, setIsEditing] = useState(false);
  const editingRef = useRef<HTMLDivElement>(null);

  const setAndSanitizeStoredValue = (unsanitizedHTML: string) => {
    const clean = DOMPurify.sanitize(
      unsanitizedHTML,
      {
        ALLOWED_TAGS: ['b', 'i'],
        ALLOWED_ATTR: [],
      })
    const dateFrags = htmlToFrags(clean);
    console.log(dateFrags);
    // console.log(registerNewDates);
    registerNewDates?.(dateFrags);
    const reextracted = fragsToHtml(dateFrags);
    setStoredValue(reextracted);
  }

  const htmlToFrags = (str: string): DateFragProps[] => {
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
      dangerouslySetInnerHTML={{ __html: storedValue == "" ? "-" : storedValue }}
    >
    </div>
  );
}

export default DateBlock;
