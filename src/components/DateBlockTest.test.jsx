import { expect, test } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DateBlock from './DateBlock'
import React, { useState } from 'react';

test.beforeEach(cleanup)

const DateBlockShell = ({ initialValue }) => {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [newValue, setNewValue] = useState(initialValue);

  return (
    <>
    <DateBlock
      storedValue={storedValue}
      setStoredValue={setStoredValue}
      newValue={newValue}
      setNewValue={setNewValue}
    />
    </>
  )
}

test('edit and re-edit plain text with enter / blur', async () => {
  const { container } = render(<DateBlockShell initialValue="2001" />)

  // Enter edit mode
  await userEvent.click(screen.getByText('2001'))
  const editable = container.querySelector('[contenteditable="true"]')
  expect(editable).toBeTruthy()
  expect(editable).toHaveTextContent(/^2001$/)

  // Simulate edit with enter
  editable.innerHTML = '2002'
  fireEvent.input(editable)
  fireEvent.keyDown(editable, { key: 'Enter', code: 'Enter' })
  expect(screen.getByText('2002')).toBeTruthy()
  expect(container.querySelector('[contenteditable="true"]')).toBeNull()

  // Enter edit mode
  await userEvent.click(screen.getByText('2002'))
  const editable2 = container.querySelector('[contenteditable="true"]')
  expect(editable2).toBeTruthy()
  expect(editable2).toHaveTextContent(/^2002$/)

  // Simulate edit with blur
  editable.innerHTML = '2003'
  fireEvent.input(editable2)
  fireEvent.blur(editable2)
  expect(screen.getByText('2003')).toBeTruthy()
  expect(container.querySelector('[contenteditable="true"]')).toBeNull()
})

test('edit and re-edit rich text with enter / blur', async () => {
  const { container } = render(<DateBlockShell initialValue="2001" />)

  // Enter edit mode
  await userEvent.click(screen.getByText('2001'))
  const editable = container.querySelector('[contenteditable="true"]')
  expect(editable).toBeTruthy()
  expect(editable).toHaveTextContent(/^2001$/)

  // Simulate edit with enter
  editable.innerHTML = '2002 <b>apples</b> test 2003'
  fireEvent.input(editable)
  fireEvent.keyDown(editable, { key: 'Enter', code: 'Enter' })
  expect(editable).toBeTruthy()
  expect(editable).toHaveTextContent(/^2002-2003$/)
  expect(container.querySelector('[contenteditable="true"]')).toBeNull()

  // Enter edit mode
  await userEvent.click(screen.getByText('2002-2003', {exact: false}))
  const editable2 = container.querySelector('[contenteditable="true"]')
  expect(editable2).toBeTruthy()
  expect(editable2).toHaveTextContent(/^2002-2003$/)

  // Simulate edit with blur
  fireEvent.input(editable2)
  fireEvent.blur(editable2)
  expect(editable2).toBeTruthy()
  expect(editable2).toHaveTextContent(/^2002-2003$/)
  expect(editable2).toContainHTML('2002-2003')
  expect(container.querySelector('[contenteditable="true"]')).toBeNull()
})

test('test empty and esc reversion', async () => {
  const { container } = render(<DateBlockShell initialValue="1999" />)

  // Empty string reversion
  await userEvent.click(screen.getByText('1999'))
  const editable = container.querySelector('[contenteditable="true"]')
  expect(editable).toBeTruthy()
  editable.innerHTML = ''
  fireEvent.input(editable)
  fireEvent.blur(editable)

  expect(screen.getByText('1999')).toBeTruthy()
  expect(container.querySelector('[contenteditable="true"]')).toBeNull()

  // Re-enter and press Escape to cancel edits
  await userEvent.click(screen.getByText('1999'))
  const editable2 = container.querySelector('[contenteditable="true"]')
  expect(editable2).toBeTruthy()
  editable2.innerHTML = '3000'
  fireEvent.input(editable2)
  fireEvent.keyDown(editable2, { key: 'Escape', code: 'Escape' })

  expect(screen.getByText('1999')).toBeTruthy()
  expect(container.querySelector('[contenteditable="true"]')).toBeNull()
})
