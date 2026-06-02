/**
 * Mock function for generating a Blob object with dummy receipt content.
 * Use this utility in tests or mocks when a Blob needs to be returned
 * (for example, to simulate a file response in download or file-related APIs).
 *
 * @param {string} id - The instruction ID to include in the mock receipt content.
 * @returns {Blob} A Blob representing a mock text file for the specified instruction ID.
 */
export const getBaseBlob = (id: string): Blob => {
  const mockContent = `Receipts for Instruction #${id}

Date: ${new Date().toISOString()}
Status: Generated

This is a mock receipt file for testing purposes.
Instruction ID: ${id}
Generated at: ${new Date().toLocaleString()}

--- End of Receipt ---
`

  return new Blob([mockContent], { type: 'text/plain' })
}
