import { describe, it, expect } from 'vitest'
import { maskDigits, maskCurrency } from '../exampleUtil'

describe('maskDigits', () => {
  it('replaces all digits with bullet characters', () => {
    expect(maskDigits('Cuenta 012345678901234567')).toBe('Cuenta ••••••••••••••••••')
  })

  it('preserves letters, spaces and special characters', () => {
    expect(maskDigits('CLABE - Banco 99')).toBe('CLABE - Banco ••')
  })

  it('returns the same string when there are no digits', () => {
    expect(maskDigits('Cuenta Principal')).toBe('Cuenta Principal')
  })

  it('masks all characters when string is only digits', () => {
    expect(maskDigits('123456')).toBe('••••••')
  })

  it('handles empty string', () => {
    expect(maskDigits('')).toBe('')
  })
})

describe('maskCurrency', () => {
  it('returns a fixed masked currency value', () => {
    expect(maskCurrency()).toBe('$••••••')
  })
})
