// Split text into visible characters for the handwriting animation.
// A plain split would break emoji such as ❤️ (a heart plus an invisible
// "show as emoji" marker) into two pieces; this keeps them together.
export function splitGraphemes(text) {
  return Array.from(text.matchAll(/.️?/gsu), (match) => match[0])
}

/**
 * Split text into words for line wrapping, keeping an emoji on the same line
 * as the word before it ("LOVE ❤️" never leaves the heart alone on a line).
 */
export function splitWords(text) {
  const words = []
  for (const word of text.split(' ')) {
    if (words.length > 0 && /^\p{Extended_Pictographic}/u.test(word)) {
      words[words.length - 1] += ` ${word}`
    } else {
      words.push(word)
    }
  }
  return words
}
