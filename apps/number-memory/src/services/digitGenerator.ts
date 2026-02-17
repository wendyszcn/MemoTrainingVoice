/**
 * Generate a random digit sequence of specified length
 * @param length - Number of digits to generate
 * @returns String of random digits
 */
export function generateDigits(length: number): string {
  if (length < 1) {
    throw new Error('Digit length must be at least 1')
  }

  let result = ''
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString()
  }
  return result
}

/**
 * Validate user answer against correct digits
 * @param userAnswer - User's input
 * @param correctDigits - The correct digit sequence
 * @returns True if answer matches
 */
export function validateAnswer(userAnswer: string, correctDigits: string): boolean {
  return userAnswer === correctDigits
}

/**
 * Filter input to only contain digits
 * @param input - Raw user input
 * @returns String containing only digits
 */
export function filterDigits(input: string): string {
  return input.replace(/\D/g, '')
}
