import React, { useState, useCallback, useMemo } from 'react';
import './App.css';
import DateBlock, { DateFragProps, fragsToHtml } from './components/DateBlock';
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

/* eslint-disable @typescript-eslint/no-unused-vars */
const pureColor = 0x0000ff;
const pureColorRef = "#0x0000ff";
const pureWhite = 0xffffff;

const reduceColor = (baseColor: number, factor: number): number => {
  const r = (baseColor & 0xff0000) >> 16;
  const g = (baseColor & 0x00ff00) >> 8;
  const b = baseColor & 0x0000ff;
  return (Math.floor(r / factor) << 16)
      + (Math.floor(g / factor) << 8)
      + (Math.floor(b / factor));
}

const refColorMap : ColorMap = {
  0: "#ffffff",
  1: "#CCCCDD",
  2: "#9999B2",
  3: "#666699",
}

const colorMap : ColorMap = {
  0: "#" + (pureColor.toString(16)),
  1: "#" + (0xcccccc + reduceColor(pureColor, 15)).toString(16),
  2: "#" + (0x999999 + reduceColor(pureColor, 10)).toString(16),
  3: "#" + (0x666666 + reduceColor(pureColor, 5)).toString(16),
}

const getColor = (interestStrength: number): string => {
  if (interestStrength == null) {
    return "#FFFFFF"
  } else {
    return colorMap[interestStrength];
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */

const App: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([
    { id: "initial-label-1", label: 'Label 1' },
    { id: "initial-label-2", label: 'Label 2' },
  ]);

  const [columns, setColumns] = useState<Column[]>([
    { id: '2023', label: '2023' },
    { id: '2024', label: '2024' },
    { id: '2025', label: '2025' },
  ])

  const [rowDateProps, setRowDateProps] = useState<RowDateProp[]>([
    { label: "initial-label-1", props: [{ year: 2025, isBold: false, isItalic: false }] },
    { label: "initial-label-2", props: [{ year: 2025, isBold: false, isItalic: false }] },
  ]);

  // Computed map from row_col keys to interest strength
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
    const newRowId = crypto.randomUUID();
    const newRow: Row = {
      id: newRowId,
      label: `New Label`,
    };
    setRows(prevRows => [...prevRows, newRow]);
    registerFrags(newRowId, [{ year: 2025, isBold: false, isItalic: false }] );
  }, [rows, rowDateProps]);

  const handleTrimDates = useCallback(() => {
    setColumns(prevColumns => {
      const minYear = rowDateProps.map(
        (row) => row.props.map(
          (dateFragProp) => dateFragProp.year
        )
      ).flat().reduce((x, y) => x < y ? x : y);
      const maxYear = rowDateProps.map(
        (row) => row.props.map(
          (dateFragProp) => dateFragProp.year
        )
      ).flat().reduce((x, y) => x < y ? y : x);
      return prevColumns.filter(col => parseInt(col.id) >= minYear && parseInt(col.id) <= maxYear);
    })
  }, [columns]);

  const handleRemoveRow = useCallback((rowId: string) => {
    setRows(prevRows => prevRows.filter(row => row.id !== rowId));
  }, []);

  const handleUpdateRowLabel = useCallback((rowId: string, newLabel: string) => {
    console.log("saving label: " + newLabel);
    setRows(prevRows => prevRows.map(row => row.id === rowId ? { ...row, label: newLabel } : row));
  }, []);

  const updateColumns = useCallback((newProps: DateFragProps[]) => {
    if(newProps.length == 0) {
      return;
    }
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
    <h1>Interest Tracker</h1>
    <table className="full-table">
      <thead>
        <tr>
          <th>
            <button onClick={handleAddRow}>Add Row</button>
          </th>
          {columns.map((col) => (
            <th key={col.id} className="year-header-cell">
              <div style = {{transform: "rotate(-70deg)", width: "10px", fontSize: "12px"}}>
                {col.id.substring(2, 4)}
              </div>
            </th>
          ))}
          <th>
            <button onClick={handleTrimDates} className="trim-time-dates-button">
              Trim Dates
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="interest-row">
            <td style={{ display: "flex" }} className="interest-label">
              <EditableLabel
                initialValue={row.label}
                onSave={(newLabel) => handleUpdateRowLabel(row.id, newLabel)}
              />
              <div style={{ width: '5px' }}></div>
              <button
                onClick={() => handleRemoveRow(row.id)}
                aria-label={`Remove row ${row.label}`}
                className="remove-row-btn"
              >
                X
              </button>
            </td>
            <FusedDateSelector
              row={row}
              columns={columns}
              registerFrags={registerFrags}
              colorState={colorState}
              initialValue="2025"
            />
          </tr>
        ))}
      </tbody>
    </table>
    </>
  )
}

interface FusedDateSelectorProps {
  row: Row;
  columns: Column[];
  registerFrags: (rowLabel: string, newProps: DateFragProps[]) => void;
  colorState: { [key: string]: number };
  initialValue: string;
}

const FusedDateSelector: React.FC<FusedDateSelectorProps> = ({ row, columns, registerFrags, colorState, initialValue }) => {
  // previously stored value before editing
  const [storedValue, setStoredValue] = useState(initialValue);
  // value of what the user is currently editing
  const [newValue, setNewValue] = useState(initialValue);

  const handleCellClick = (colId: string) => {
    const currentStrength = colorState[`${row.id}_${colId}`];
    const year = parseInt(colId);

    // Parse current storedValue HTML back into DateFragProps
    const htmlToFrags = (html: string): DateFragProps[] => {
      const results: DateFragProps[] = [];
      let isBold = false;
      let isItalic = false;

      const regex = /(<b>)|(<\/b>)|(<i>)|(<\/i>)|(\d{4})(\-(\d{4}))?/g;
      let match;
      while ((match = regex.exec(html)) !== null) {
        if (match[1]) {
          isBold = true;
        } else if (match[2]) {
          isBold = false;
        } else if (match[3]) {
          isItalic = true;
        } else if (match[4]) {
          isItalic = false;
        } else if (match[5] && match[6]) {
          // Year range: match[5] is start, match[7] is end
          const startYear = parseInt(match[5]);
          const endYear = parseInt(match[7]);
          for (let y = startYear; y <= endYear; y++) {
            results.push({ year: y, isBold, isItalic });
          }
        } else if (match[5]) {
          // Single year
          const singleYear = parseInt(match[5]);
          results.push({ year: singleYear, isBold, isItalic });
        }
      }
      return results;
    };

    // Get all frags from current storedValue
    let allFrags = htmlToFrags(storedValue);

    // Determine next state and update frags
    let nextState: 'none' | 'light' | 'medium' | 'heavy';
    if (currentStrength === undefined) {
      nextState = 'light';
    } else if (currentStrength === 1) {
      nextState = 'medium';
    } else if (currentStrength === 2) {
      nextState = 'heavy';
    } else {
      nextState = 'none';
    }

    // Update allFrags: remove current year and add new formatting if not 'none'
    allFrags = allFrags.filter((frag) => frag.year !== year);

    if (nextState !== 'none') {
      const isBold = nextState === 'heavy';
      const isItalic = nextState === 'light';
      allFrags.push({ year, isBold, isItalic });
    }

    // Regenerate HTML from updated frags using fragsToHtml
    const updatedHtml = fragsToHtml(allFrags);
    setStoredValue(updatedHtml);
    setNewValue(updatedHtml);

    // Register the new frags with the parent App
    registerFrags(row.id, allFrags);
  };

  // series of table cells representing interest-year intersections followed by date selector
  return (
    <>
    {columns.map((col) => (
      <td
      key={col.id}
      style={{
        width: "fit-content",
        backgroundColor: getColor(colorState[`${row.id}_${col.id}`])
      }}
      className="interest-cell"
      onClick={() => handleCellClick(col.id)}>
      </td>
    ))}
    <td>
      <div style={{ width: '200px' }}>
        <DateBlock
        registerNewDates={(dateFragProps) => registerFrags(row.id, dateFragProps)}
        storedValue={storedValue}
        setStoredValue={setStoredValue}
        newValue={newValue}
        setNewValue={setNewValue}
        />
      </div>
    </td>
    </>
  )
}

export default App
