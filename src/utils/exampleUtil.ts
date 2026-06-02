const MASK_CHAR = '•'
const MASKED_CURRENCY = `$${MASK_CHAR.repeat(6)}`

export const maskDigits = (text: string): string => text.replace(/\d/g, MASK_CHAR)

export const maskCurrency = (): string => MASKED_CURRENCY
