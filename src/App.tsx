import React, { useState, useCallback } from 'react';
import './App.css';
import DateBlock from './components/DateBlock';
import EditableLabel from './components/EditableLabel';

interface Row {
  id: string;
  label: string;
}

const App: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([
    { id: crypto.randomUUID(), label: 'Label 1' },
    { id: crypto.randomUUID(), label: 'Label 2' },
  ]);

  const handleAddRow = useCallback(() => {
    const newRow: Row = {
      id: crypto.randomUUID(),
      label: `New Label`,
    };
    setRows(prevRows => [...prevRows, newRow]);
  }, []);

  const handleRemoveRow = useCallback((rowId: string) => {
    setRows(prevRows => prevRows.filter(row => row.id !== rowId));
  }, []);

  const handleUpdateRowLabel = useCallback((rowId: string, newLabel: string) => {
    setRows(prevRows => prevRows.map(row => row.id === rowId ? { ...row, label: newLabel } : row));
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>header</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr>
            <td style={{ display: "flex" }}>
              <EditableLabel
                initialValue={row.label}
                onSave={(newLabel) => handleUpdateRowLabel(row.id, newLabel)}
              />
              <button
                onClick={() => handleRemoveRow(row.id)}
                aria-label={`Remove row ${row.label}`}
              >
                X
              </button>
            </td>
            <td>
            <div>
              <DateBlock initialValue="2025" />
            </div></td>
          </tr>
        ))}
        <tr>
          <td>
            <button onClick={handleAddRow}>Add Row</button>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default App
