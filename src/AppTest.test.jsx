import { test, expect } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { within } from '@testing-library/dom'
import React from 'react'
import App from './App'

test.beforeEach(cleanup)

test('page renders', async () => {
  render(<App />)
  expect(screen.getByText(/^Interest Tracker$/)).toBeTruthy()
})

test('negative date range test', async () => {
  const { container } = render(<App />)

  await userEvent.click(screen.getAllByText('2025').at(0))
  const editable = container.querySelector('[contenteditable="true"]')
  expect(editable).toBeTruthy()
  expect(editable).toHaveTextContent(/^2025$/)

  editable.innerHTML = '2022-2024'
  fireEvent.input(editable)
  fireEvent.keyDown(editable, { key: 'Enter', code: 'Enter' })
  expect(screen.getByText('2022-2024')).toBeTruthy()

  await userEvent.click(screen.getAllByText('2022-2024').at(0))
  const editable2 = container.querySelector('[contenteditable="true"]')
  editable2.innerHTML = '2022-2018'
  fireEvent.input(editable2)
  fireEvent.keyDown(editable2, { key: 'Enter', code: 'Enter' })
  expect(screen.getByText('-')).toBeTruthy()
})

test('text edit + click edit + text edit works correctly', async () => {
  const { container } = render(<App />)

  // Step 1: Edit the DateBlock to enter a range of years
  await userEvent.click(screen.getAllByText('2025').at(0))
  let editable = container.querySelector('[contenteditable="true"]')
  expect(editable).toBeTruthy()

  editable.innerHTML = '2020, 2021, 2022'
  fireEvent.input(editable)
  fireEvent.keyDown(editable, { key: 'Enter', code: 'Enter' })

  // Verify the text was saved
  expect(screen.getByText('2020-2022')).toBeTruthy()

  // Click on 2021 cell to cycle to 'heavy' (bold)
  const cells = container.querySelectorAll('.year-header-cell')
  console.log(cells)
  const year2021CellIndex = Array.from(cells).findIndex(
    (cell) => cell.textContent === '21'
  )
  expect(year2021CellIndex).toBeGreaterThanOrEqual(0)
  const label1Row = screen.getByRole("row", { name: /Label 1/ } )
  await(userEvent.click(within(label1Row).getAllByRole("cell").at(year2021CellIndex + 1)))
  expect(screen.getByText(/2020/)).toBeTruthy()

  await userEvent.click(screen.getAllByText(/^2020|2021|2022/).at(0))
  editable = container.querySelector('[contenteditable="true"]')
  expect(editable).toBeTruthy()

  expect(editable.textContent).toEqual('2020, 2021, 2022')

  // Edit to add another year
  editable.innerHTML = '<i>2021</i>, 2020, 2022, 2023'
  fireEvent.input(editable)
  fireEvent.keyDown(editable, { key: 'Enter', code: 'Enter' })

  // Verify the final state includes all years
  expect(screen.getByRole("cell", { name: /2020, 2021, 2022-2023/ })).toBeTruthy()
})
