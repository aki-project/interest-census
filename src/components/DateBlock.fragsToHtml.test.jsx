import { test, expect } from 'vitest'
import { fragsToHtml } from './DateBlock'

test('empty frags returns empty string', () => {
  expect(fragsToHtml([])).toBe('')
})

test('single year without formatting', () => {
  const frags = [{ year: 1999, isBold: false, isItalic: false }]
  expect(fragsToHtml(frags)).toBe('1999')
})

test('consecutive years with same formatting become range', () => {
  const frags = [
    { year: 1999, isBold: true, isItalic: false },
    { year: 2000, isBold: true, isItalic: false },
    { year: 2001, isBold: true, isItalic: false },
  ]
  expect(fragsToHtml(frags)).toBe('<b>1999-2001</b>')
})

test('mixed formatting splits groups correctly', () => {
  const frags = [
    { year: 1999, isBold: false, isItalic: false },
    { year: 2000, isBold: true, isItalic: false },
    { year: 2001, isBold: true, isItalic: false },
    { year: 2003, isBold: false, isItalic: true },
  ]
  expect(fragsToHtml(frags)).toBe('1999, <b>2000-2001</b>, <i>2003</i>')
})

test('bold and italic together nest correctly (bold outside italic)', () => {
  const frags = [{ year: 2005, isBold: true, isItalic: true }]
  expect(fragsToHtml(frags)).toBe('<b><i>2005</i></b>')
})
