
// thanks microsoft <3
// https://github.com/microsoft/vscode/blob/3cf529d506f977a4b7a7941175da90d190fed14e/src/vs/base/node/encoding.ts

const iconv = require('iconv-lite')
const jschardet = require('jschardet')

const UTF8 = 'utf8'
const UTF8WithBom = 'utf8bom'
const UTF16be = 'utf16be'
const UTF16le = 'utf16le'

const UTF16beBOM = [0xFE, 0xFF]
const UTF16leBOM = [0xFF, 0xFE]
const UTF8_BOM = [0xEF, 0xBB, 0xBF]

const ZERO_BYTE_DETECTION_BUFFER_MAX_LEN = 512 // number of bytes to look at to decide about a file being binary or not
const AUTO_ENCODING_GUESS_MAX_BYTES = 512 * 128 // set an upper limit for the number of bytes we pass on to jschardet

function toNodeEncoding (enc) {
  if (enc === UTF8WithBom || enc === null) {
    return UTF8 // iconv does not distinguish UTF 8 with or without BOM, so we need to help it
  }

  return enc
}

function detectEncodingByBOMFromBuffer (buffer) {
  if (!buffer || buffer.length < UTF16beBOM.length) {
    return null
  }

  const b0 = buffer.readUInt8(0)
  const b1 = buffer.readUInt8(1)

  // UTF-16 BE
  if (b0 === UTF16beBOM[0] && b1 === UTF16beBOM[1]) {
    return UTF16be
  }

  // UTF-16 LE
  if (b0 === UTF16leBOM[0] && b1 === UTF16leBOM[1]) {
    return UTF16le
  }

  if (buffer.length < UTF8_BOM.length) {
    return null
  }

  const b2 = buffer.readUInt8(2)

  // UTF-8
  if (b0 === UTF8_BOM[0] && b1 === UTF8_BOM[1] && b2 === UTF8_BOM[2]) {
    return UTF8WithBom
  }

  return null
}

// we explicitly ignore a specific set of encodings from auto guessing
// - ASCII: we never want this encoding (most UTF-8 files would happily detect as
//          ASCII files and then you could not type non-ASCII characters anymore)
// - UTF-16: we have our own detection logic for UTF-16
// - UTF-32: we do not support this encoding in VSCode
const IGNORE_ENCODINGS = ['ascii', 'utf-16', 'utf-32']

/**
 * Guesses the encoding from buffer.
 */
async function guessEncodingByBuffer (buffer) {
  // ensure to limit buffer for guessing due to https://github.com/aadsm/jschardet/issues/53
  const guessed = jschardet.detect(buffer.slice(0, AUTO_ENCODING_GUESS_MAX_BYTES))
  if (!guessed || !guessed.encoding) {
    return null
  }

  const enc = guessed.encoding.toLowerCase()
  if (IGNORE_ENCODINGS.includes(enc)) {
    return null // see comment above why we ignore some encodings
  }

  return toIconvLiteEncoding(guessed.encoding)
}

const JSCHARDET_TO_ICONV_ENCODINGS = {
  ibm866: 'cp866',
  big5: 'cp950'
}

function toIconvLiteEncoding (encodingName) {
  const normalizedEncodingName = encodingName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  const mapped = JSCHARDET_TO_ICONV_ENCODINGS[normalizedEncodingName]

  return mapped || normalizedEncodingName
}

function detectEncodingFromBuffer (buffer, autoGuessEncoding) {
  // Always first check for BOM to find out about encoding
  let encoding = detectEncodingByBOMFromBuffer(buffer)

  // Detect 0 bytes to see if file is binary or UTF-16 LE/BE
  // unless we already know that this file has a UTF-16 encoding
  let seemsBinary = false
  if (encoding !== UTF16be && encoding !== UTF16le && buffer) {
    let couldBeUTF16LE = true // e.g. 0xAA 0x00
    let couldBeUTF16BE = true // e.g. 0x00 0xAA
    let containsZeroByte = false

    // This is a simplified guess to detect UTF-16 BE or LE by just checking if
    // the first 512 bytes have the 0-byte at a specific location. For UTF-16 LE
    // this would be the odd byte index and for UTF-16 BE the even one.
    // Note: this can produce false positives (a binary file that uses a 2-byte
    // encoding of the same format as UTF-16) and false negatives (a UTF-16 file
    // that is using 4 bytes to encode a character).
    for (let i = 0; i < buffer.length && i < ZERO_BYTE_DETECTION_BUFFER_MAX_LEN; i++) {
      const isEndian = (i % 2 === 1) // assume 2-byte sequences typical for UTF-16
      const isZeroByte = (buffer.readInt8(i) === 0)

      if (isZeroByte) {
        containsZeroByte = true
      }

      // UTF-16 LE: expect e.g. 0xAA 0x00
      if (couldBeUTF16LE && ((isEndian && !isZeroByte) || (!isEndian && isZeroByte))) {
        couldBeUTF16LE = false
      }

      // UTF-16 BE: expect e.g. 0x00 0xAA
      if (couldBeUTF16BE && ((isEndian && isZeroByte) || (!isEndian && !isZeroByte))) {
        couldBeUTF16BE = false
      }

      // Return if this is neither UTF16-LE nor UTF16-BE and thus treat as binary
      if (isZeroByte && !couldBeUTF16LE && !couldBeUTF16BE) {
        break
      }
    }

    // Handle case of 0-byte included
    if (containsZeroByte) {
      if (couldBeUTF16LE) {
        encoding = UTF16le
      } else if (couldBeUTF16BE) {
        encoding = UTF16be
      } else {
        seemsBinary = true
      }
    }
  }

  // Auto guess encoding if configured
  if (autoGuessEncoding && !seemsBinary && !encoding && buffer) {
    return guessEncodingByBuffer(buffer.slice(0, ZERO_BYTE_DETECTION_BUFFER_MAX_LEN)).then(guessedEncoding => {
      return {
        seemsBinary: false,
        encoding: guessedEncoding
      }
    })
  }

  return { seemsBinary, encoding }
}

exports.decode = function decode (buffer, encoding) {
  return iconv.decode(buffer, toNodeEncoding(encoding))
}

exports.encode = function encode (string, encoding) {
  return iconv.encode(string, toNodeEncoding(encoding))
}

exports.encodingExists = function encodingExists (encoding) {
  return iconv.encodingExists(toNodeEncoding(encoding))
}
exports.detectEncodingFromBuffer = detectEncodingFromBuffer
