import React, { useState, useCallback, useMemo } from 'react';
import './App.css';
import DateBlock, { DateFragProps } from './components/DateBlock';
import EditableLabel from './components/EditableLabel';

interface Row {
  id: string;
  label: string;
}

interface Column {
  id: string;
  label: string;
}

// interest strength to hexcode map
interface ColorMap {
  [key: number]: string;
}

interface RowDateProp {
  label: string;
  props: DateFragProps[];
}

const colorMap : ColorMap = {
  0: "#FFFFFF",
  1: "#BBBBDD",
  2: "#8888BB",
  3: "#444499",
}

const getColor = (interestStrength: number): string => {
  if (interestStrength == null) {
    return "#FFFFFF"
  } else {
    return colorMap[interestStrength];
  }
}

const App: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([
    { id: crypto.randomUUID(), label: 'Label 1' },
    { id: crypto.randomUUID(), label: 'Label 2' },
  ]);

  const [columns, setColumns] = useState<Column[]>([
    { id: '2023', label: '2023' },
    { id: '2024', label: '2024' },
  ])

  const [rowDateProps, setRowDateProps] = useState<RowDateProp[]>([]);

  // map from row_col keys to interest strength
  const colorState = useMemo(() => {
    const newState : {[key: string]: number} = {}
    rowDateProps.forEach((rowDateProp) => {
      rowDateProp.props.forEach((dateFragProp) => {
        newState[`${rowDateProp.label}_${dateFragProp.year}`] =
              dateFragProp.isBold ? 3 : dateFragProp.isItalic ? 1 : 2;
      })
    })
    return newState;
  }, [columns, rows, rowDateProps])

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
    console.log("saving label: " + newLabel);
    setRows(prevRows => prevRows.map(row => row.id === rowId ? { ...row, label: newLabel } : row));
  }, []);

  const updateColumns = useCallback((newProps: DateFragProps[]) => {
    setColumns(previousColumns => {
      const oldMin = previousColumns.map((col) => parseInt(col.id)).reduce((x, y) => x < y ? x : y)
      const oldMax = previousColumns.map((col) => parseInt(col.id)).reduce((x, y) => x < y ? y : x)
      const fragMin = newProps.map((prop) => prop.year).reduce((x, y) => x < y ? x : y)
      const fragMax = newProps.map((prop) => prop.year).reduce((x, y) => x < y ? y : x)
      const newLeft = fragMin < oldMin ? [ ...Array(oldMin - fragMin).keys()].map((i) => ({ id: String(i + fragMin), label: String(i + fragMin)})) : [];
      const newRight = fragMax > oldMax ? [ ...Array(fragMax - oldMax).keys()].map((i) => ({ id: String(i + oldMax + 1), label: String(i + oldMax + 1)})) : [];
      console.log("newLeft: ")
      console.log(newLeft)
      console.log("newRight: ")
      console.log(newRight)
      return [...newLeft, ...previousColumns, ...newRight]
    });
  }, []);

  const registerFrags = useCallback((rowLabel: string, newProps: DateFragProps[]) => {
    updateColumns(newProps);
    let rowLabelFound = false;
    const newRowDateProps = rowDateProps.map(
      (row) => {
        if (row.label == rowLabel) {
          rowLabelFound = true;
          return { label: rowLabel, props: newProps }
        }
        else {
          return row;
        }
      }
    )
    if (!rowLabelFound) {
      newRowDateProps.push({label: rowLabel, props: newProps })
    }
    setRowDateProps(newRowDateProps);
  }, [rowDateProps])

  return (
    <>
    <h1>Text Interest Census</h1>
    <table>
      <thead>
        <tr>
          <th>header</th>
          <th></th>
          {columns.map((col) => (
            <th key={col.id}>
              <div style = {{transform: "rotate(-70deg)"}}>
                {col.id}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
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
              <div style={{ width: '400px' }}>
                <DateBlock
                initialValue="2025"
                registerNewDates={(dateFragProps) => registerFrags(row.id, dateFragProps)}
                />
              </div>
            </td>
            {columns.map((col) => (
              <td
              key={col.id}
              style={{
                width: "fit-content",
                backgroundColor: getColor(colorState[`${row.id}_${col.id}`])
              }}>
              </td>
            ))}
          </tr>
        ))}
        <tr>
          <td>
            <button onClick={handleAddRow}>Add Row</button>
          </td>
        </tr>
      </tbody>
    </table>
    </>
  )
}

export default App
