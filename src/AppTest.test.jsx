import { test, expect } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import App from './App'

test.beforeEach(cleanup)

test('page renders', async () => {
  render(<App />)
  expect(screen.getByText(/^Text Interest Census$/)).toBeTruthy()
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
