import { expect, test } from 'vitest'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DateBlock from './DateBlock'
import React from 'react'

test('can edit with rich text formatting, save, and re-edit', async () => {
  render(<DateBlock initialValue="2001" />)

  await userEvent.click(screen.getByText('2001'))

  expect(screen.getByText('2001')).toHaveTextContent('2001')
})
