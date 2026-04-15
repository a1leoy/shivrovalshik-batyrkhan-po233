const RU_UPPER = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
const RU_LOWER = RU_UPPER.toLowerCase();
const EN_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const EN_LOWER = EN_UPPER.toLowerCase();
const EN_36 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const RU_36 = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ012';

const MORSE_MAP = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---',
  K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-',
  U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
  'А': '.-', 'Б': '-...', 'В': '.--', 'Г': '--.', 'Д': '-..', 'Е': '.', 'Ё': '.', 'Ж': '...-', 'З': '--..',
  'И': '..', 'Й': '.---', 'К': '-.-', 'Л': '.-..', 'М': '--', 'Н': '-.', 'О': '---', 'П': '.--.', 'Р': '.-.',
  'С': '...', 'Т': '-', 'У': '..-', 'Ф': '..-.', 'Х': '....', 'Ц': '-.-.', 'Ч': '---.', 'Ш': '----',
  'Щ': '--.-', 'Ъ': '--.--', 'Ы': '-.--', 'Ь': '-..-', 'Э': '..-..', 'Ю': '..--', 'Я': '.-.-',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
  '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--', ':': '---...', ';': '-.-.-.',
  '(': '-.--.', ')': '-.--.-', '-': '-....-', '_': '..--.-', '"': '.-..-.', '@': '.--.-.', '/': '-..-.',
  '=': '-...-', '+': '.-.-.', '&': '.-...'
};

const MORSE_REVERSE_MULTI = Object.entries(MORSE_MAP).reduce((acc, [key, value]) => {
  acc[value] ??= [];
  acc[value].push(key);
  return acc;
}, {});

const CIPHER_INFO = {
  caesar: 'Сдвигает буквы русского и английского алфавита. Пробелы и знаки препинания сохраняются.',
  ascii: 'Показывает ASCII-коды. Поддерживает только символы с кодами 0–127. Русские буквы для ASCII не подходят.',
  koi8: 'Преобразование текста в байты KOI8-R и обратно. Подходит для русского и английского текста.',
  morse: 'Поддерживает русские и английские буквы, цифры и часть знаков препинания. Пробел отображается как /.',
  vigenere: 'Шифр с буквенным ключом. Работает отдельно для русского или английского текста за один проход.',
  bacon: 'Адаптированный шифр Бэкона: английский использует группы по 5 символов A/B, русский — по 6.',
  atbash: 'Зеркальный шифр для русского и английского алфавита. Пробелы и знаки сохраняются.',
  gronsfeld: 'Похож на Виженера, но использует цифровой ключ. Поддерживает русский и английский текст.',
  polybius: 'Квадрат Полибия выводит координаты. Для точного результата выберите язык вручную при расшифровке.',
  playfair: 'Шифр Плейфера использует матрицу 6×6. На выходе буквы приводятся к верхнему регистру, возможны служебные символы-заполнители.'
};

function showError(message) {
  throw new Error(message);
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function isRussianChar(ch) {
  return RU_UPPER.includes(ch) || RU_LOWER.includes(ch);
}

function isEnglishChar(ch) {
  return EN_UPPER.includes(ch) || EN_LOWER.includes(ch);
}

function detectTextLanguage(text) {
  let hasRu = false;
  let hasEn = false;
  for (const ch of text) {
    if (isRussianChar(ch)) hasRu = true;
    if (isEnglishChar(ch)) hasEn = true;
  }
  if (hasRu && hasEn) return 'mixed';
  if (hasRu) return 'ru';
  if (hasEn) return 'en';
  return 'unknown';
}

function shiftInAlphabet(ch, alphabetUpper, alphabetLower, shift) {
  const upperIndex = alphabetUpper.indexOf(ch);
  if (upperIndex !== -1) return alphabetUpper[mod(upperIndex + shift, alphabetUpper.length)];
  const lowerIndex = alphabetLower.indexOf(ch);
  if (lowerIndex !== -1) return alphabetLower[mod(lowerIndex + shift, alphabetLower.length)];
  return ch;
}

function mirrorInAlphabet(ch, alphabetUpper, alphabetLower) {
  const upperIndex = alphabetUpper.indexOf(ch);
  if (upperIndex !== -1) return alphabetUpper[alphabetUpper.length - 1 - upperIndex];
  const lowerIndex = alphabetLower.indexOf(ch);
  if (lowerIndex !== -1) return alphabetLower[alphabetLower.length - 1 - lowerIndex];
  return ch;
}

function caesarCipher(text, shift, decrypt = false) {
  const actualShift = decrypt ? -shift : shift;
  return [...text].map((ch) => {
    if (isRussianChar(ch)) return shiftInAlphabet(ch, RU_UPPER, RU_LOWER, actualShift);
    if (isEnglishChar(ch)) return shiftInAlphabet(ch, EN_UPPER, EN_LOWER, actualShift);
    return ch;
  }).join('');
}

function atbashCipher(text) {
  return [...text].map((ch) => {
    if (isRussianChar(ch)) return mirrorInAlphabet(ch, RU_UPPER, RU_LOWER);
    if (isEnglishChar(ch)) return mirrorInAlphabet(ch, EN_UPPER, EN_LOWER);
    return ch;
  }).join('');
}

function asciiEncrypt(text) {
  const codes = [];
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code > 127) {
      showError('ASCII поддерживает только символы с кодами от 0 до 127.');
    }
    codes.push(String(code));
  }
  return codes.join(' ');
}

function asciiDecrypt(text) {
  const tokens = text.trim().match(/\d+/g);
  if (!tokens || !tokens.length) showError('Введите ASCII-коды через пробел.');
  return tokens.map((token) => {
    const code = Number(token);
    if (Number.isNaN(code) || code < 0 || code > 127) {
      showError(`Недопустимый ASCII-код: ${token}`);
    }
    return String.fromCharCode(code);
  }).join('');
}

function createKoi8Mapper() {
  if (typeof TextDecoder === 'undefined') return null;
  try {
    const decoder = new TextDecoder('koi8-r');
    const byteToChar = {};
    const charToByte = {};
    for (let i = 0; i < 256; i++) {
      const char = decoder.decode(Uint8Array.of(i));
      byteToChar[i] = char;
      if (!(char in charToByte)) {
        charToByte[char] = i;
      }
    }
    return { decoder, byteToChar, charToByte };
  } catch {
    return null;
  }
}

const KOI8_MAPPER = createKoi8Mapper();

function koi8Encrypt(text) {
  if (!KOI8_MAPPER) showError('Ваш браузер не поддерживает KOI8-R.');
  const bytes = [];
  for (const ch of text) {
    const byte = KOI8_MAPPER.charToByte[ch];
    if (byte === undefined) showError(`Символ «${ch}» не поддерживается в KOI8-R.`);
    bytes.push(String(byte));
  }
  return bytes.join(' ');
}

function koi8Decrypt(text) {
  if (!KOI8_MAPPER) showError('Ваш браузер не поддерживает KOI8-R.');
  const tokens = text.trim().match(/\d+/g);
  if (!tokens || !tokens.length) showError('Введите байты KOI8-R через пробел.');
  const bytes = tokens.map((token) => {
    const value = Number(token);
    if (Number.isNaN(value) || value < 0 || value > 255) {
      showError(`Недопустимый байт KOI8-R: ${token}`);
    }
    return value;
  });
  return KOI8_MAPPER.decoder.decode(new Uint8Array(bytes));
}

function morseEncrypt(text) {
  const tokens = [];
  for (const ch of text) {
    if (ch === ' ') {
      tokens.push('/');
      continue;
    }
    const upper = ch.toUpperCase();
    tokens.push(MORSE_MAP[upper] || ch);
  }
  return tokens.join(' ');
}

function morseDecrypt(text, selectedLanguage = 'auto') {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return '';
  return tokens.map((token) => {
    if (token === '/') return ' ';
    const variants = MORSE_REVERSE_MULTI[token];
    if (!variants || !variants.length) return token;
    if (selectedLanguage === 'ru') {
      return variants.find((ch) => isRussianChar(ch)) || variants[0];
    }
    if (selectedLanguage === 'en') {
      return variants.find((ch) => isEnglishChar(ch)) || variants[0];
    }
    return variants.find((ch) => isEnglishChar(ch)) || variants[0];
  }).join('');
}

function getAlphabetByLanguage(language) {
  if (language === 'ru') {
    return { upper: RU_UPPER, lower: RU_LOWER };
  }
  if (language === 'en') {
    return { upper: EN_UPPER, lower: EN_LOWER };
  }
  showError('Нужно выбрать русский или английский язык.');
}

function resolveLanguage(text, selectedLanguage, requireSingle = true) {
  if (selectedLanguage !== 'auto') return selectedLanguage;
  const detected = detectTextLanguage(text);
  if (requireSingle && detected === 'mixed') {
    showError('Для этого шифра используйте текст только на одном языке за раз.');
  }
  if (detected === 'unknown') {
    showError('Не удалось определить язык текста. Выберите язык вручную.');
  }
  if (detected === 'mixed') {
    return detected;
  }
  return detected;
}

function filterKeyByAlphabet(key, alphabetUpper, alphabetLower) {
  const letters = [...key].filter((ch) => alphabetUpper.includes(ch) || alphabetLower.includes(ch));
  if (!letters.length) showError('Ключ должен содержать буквы выбранного алфавита.');
  return letters;
}

function vigenereCipher(text, key, selectedLanguage, decrypt = false) {
  const language = resolveLanguage(text, selectedLanguage, true);
  const { upper, lower } = getAlphabetByLanguage(language);
  const cleanKey = filterKeyByAlphabet(key, upper, lower).map((ch) => ch.toUpperCase());
  let keyIndex = 0;
  return [...text].map((ch) => {
    const upperIndex = upper.indexOf(ch);
    const lowerIndex = lower.indexOf(ch);
    if (upperIndex === -1 && lowerIndex === -1) return ch;
    const keyChar = cleanKey[keyIndex % cleanKey.length];
    const shift = upper.indexOf(keyChar);
    keyIndex += 1;
    if (upperIndex !== -1) return upper[mod(upperIndex + (decrypt ? -shift : shift), upper.length)];
    return lower[mod(lowerIndex + (decrypt ? -shift : shift), lower.length)];
  }).join('');
}

function gronsfeldCipher(text, digitsKey, decrypt = false) {
  const cleanDigits = String(digitsKey).replace(/\D/g, '');
  if (!cleanDigits.length) showError('Для шифра Гронсфельда нужен цифровой ключ.');
  let index = 0;
  return [...text].map((ch) => {
    if (!isRussianChar(ch) && !isEnglishChar(ch)) return ch;
    const shift = Number(cleanDigits[index % cleanDigits.length]);
    index += 1;
    if (isRussianChar(ch)) return shiftInAlphabet(ch, RU_UPPER, RU_LOWER, decrypt ? -shift : shift);
    return shiftInAlphabet(ch, EN_UPPER, EN_LOWER, decrypt ? -shift : shift);
  }).join('');
}

function buildBaconMaps() {
  const enEncrypt = {};
  const enDecrypt = {};
  [...EN_UPPER].forEach((ch, index) => {
    const token = index.toString(2).padStart(5, '0').replace(/0/g, 'A').replace(/1/g, 'B');
    enEncrypt[ch] = token;
    enDecrypt[token] = ch;
  });

  const ruEncrypt = {};
  const ruDecrypt = {};
  [...RU_UPPER].forEach((ch, index) => {
    const token = index.toString(2).padStart(6, '0').replace(/0/g, 'A').replace(/1/g, 'B');
    ruEncrypt[ch] = token;
    ruDecrypt[token] = ch;
  });

  return { enEncrypt, enDecrypt, ruEncrypt, ruDecrypt };
}

const BACON_MAPS = buildBaconMaps();

function baconEncrypt(text, selectedLanguage) {
  const language = resolveLanguage(text, selectedLanguage, true);
  const tokens = [];
  const source = language === 'ru' ? BACON_MAPS.ruEncrypt : BACON_MAPS.enEncrypt;
  for (const ch of text) {
    if (ch === ' ') {
      tokens.push('/');
      continue;
    }
    const upper = ch.toUpperCase();
    if (source[upper]) {
      tokens.push(source[upper]);
    } else {
      tokens.push(ch);
    }
  }
  return tokens.join(' ');
}

function baconDecrypt(text, selectedLanguage) {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return '';
  let language = selectedLanguage;
  if (language === 'auto') {
    const firstGroup = tokens.find((token) => /^[AB]+$/i.test(token));
    if (!firstGroup) showError('Не найдено групп A/B для расшифровки Бэкона.');
    if (firstGroup.length === 5) language = 'en';
    else if (firstGroup.length === 6) language = 'ru';
    else showError('Не удалось определить язык для шифра Бэкона. Выберите его вручную.');
  }
  const source = language === 'ru' ? BACON_MAPS.ruDecrypt : BACON_MAPS.enDecrypt;
  return tokens.map((token) => {
    if (token === '/') return ' ';
    const normalized = token.toUpperCase();
    return source[normalized] || token;
  }).join('');
}

function buildPolybiusMatrix(language) {
  const alphabet = language === 'ru' ? RU_36 : EN_36;
  const matrix = [];
  const map = {};
  let idx = 0;
  for (let row = 1; row <= 6; row++) {
    const rowArray = [];
    for (let col = 1; col <= 6; col++) {
      const ch = alphabet[idx++];
      rowArray.push(ch);
      map[ch] = `${row}${col}`;
    }
    matrix.push(rowArray);
  }
  return { matrix, map };
}

function polybiusEncrypt(text, selectedLanguage) {
  const language = resolveLanguage(text, selectedLanguage, true);
  const { map } = buildPolybiusMatrix(language);
  const tokens = [];
  for (const ch of text) {
    if (ch === ' ') {
      tokens.push('/');
      continue;
    }
    const upper = ch.toUpperCase();
    tokens.push(map[upper] || ch);
  }
  return tokens.join(' ');
}

function polybiusDecrypt(text, selectedLanguage) {
  const language = selectedLanguage === 'auto' ? 'en' : selectedLanguage;
  const { matrix } = buildPolybiusMatrix(language);
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return '';
  return tokens.map((token) => {
    if (token === '/') return ' ';
    if (/^[1-6]{2}$/.test(token)) {
      const row = Number(token[0]) - 1;
      const col = Number(token[1]) - 1;
      return matrix[row][col];
    }
    return token;
  }).join('');
}

function buildPlayfairMatrix(language, key = '') {
  const baseAlphabet = language === 'ru' ? RU_36 : EN_36;
  const filteredKey = [...key.toUpperCase()].filter((ch) => baseAlphabet.includes(ch));
  const used = new Set();
  const combined = [...filteredKey, ...baseAlphabet].filter((ch) => {
    if (used.has(ch)) return false;
    used.add(ch);
    return true;
  });

  const matrix = [];
  const positions = {};
  for (let row = 0; row < 6; row++) {
    const rowArray = [];
    for (let col = 0; col < 6; col++) {
      const ch = combined[row * 6 + col];
      rowArray.push(ch);
      positions[ch] = [row, col];
    }
    matrix.push(rowArray);
  }
  return { matrix, positions, alphabet: baseAlphabet };
}

function preparePlayfairPairs(text, alphabet, filler) {
  const chars = [...text.toUpperCase()].filter((ch) => alphabet.includes(ch));
  const pairs = [];
  let i = 0;
  while (i < chars.length) {
    const a = chars[i];
    const b = chars[i + 1];
    if (!b) {
      pairs.push([a, filler]);
      i += 1;
    } else if (a === b) {
      pairs.push([a, filler]);
      i += 1;
    } else {
      pairs.push([a, b]);
      i += 2;
    }
  }
  return pairs;
}

function preparePlayfairDecryptPairs(text, alphabet) {
  const chars = [...text.toUpperCase()].filter((ch) => alphabet.includes(ch));
  if (chars.length % 2 !== 0) {
    showError('Для расшифровки Плейфера количество символов должно быть чётным.');
  }
  const pairs = [];
  for (let i = 0; i < chars.length; i += 2) {
    pairs.push([chars[i], chars[i + 1]]);
  }
  return pairs;
}

function playfairTransformPair(a, b, matrix, positions, decrypt = false) {
  const [rowA, colA] = positions[a];
  const [rowB, colB] = positions[b];
  const shift = decrypt ? -1 : 1;

  if (rowA === rowB) {
    return [matrix[rowA][mod(colA + shift, 6)], matrix[rowB][mod(colB + shift, 6)]];
  }
  if (colA === colB) {
    return [matrix[mod(rowA + shift, 6)][colA], matrix[mod(rowB + shift, 6)][colB]];
  }
  return [matrix[rowA][colB], matrix[rowB][colA]];
}

function cleanupPlayfairDecryption(text, filler) {
  let result = text;
  const middlePattern = new RegExp(`(.?)${filler}(?=\\1)`, 'g');
  result = result.replace(middlePattern, '$1');
  if (result.endsWith(filler)) result = result.slice(0, -1);
  return result;
}

function playfairCipher(text, key, selectedLanguage, decrypt = false) {
  const language = decrypt ? (selectedLanguage === 'auto' ? 'en' : selectedLanguage) : resolveLanguage(text, selectedLanguage, true);
  const filler = language === 'ru' ? 'Х' : 'X';
  const { matrix, positions, alphabet } = buildPlayfairMatrix(language, key);
  const pairs = decrypt ? preparePlayfairDecryptPairs(text, alphabet) : preparePlayfairPairs(text, alphabet, filler);
  const transformed = pairs.flatMap(([a, b]) => playfairTransformPair(a, b, matrix, positions, decrypt)).join('');
  if (decrypt) return cleanupPlayfairDecryption(transformed, filler);
  return transformed.match(/.{1,2}/g)?.join(' ') || transformed;
}

function runCipher({ cipher, action, text, language, shift, key, digitsKey }) {
  if (!text.trim()) return '';

  switch (cipher) {
    case 'caesar':
      return caesarCipher(text, Number(shift) || 0, action === 'decrypt');
    case 'ascii':
      return action === 'encrypt' ? asciiEncrypt(text) : asciiDecrypt(text);
    case 'koi8':
      return action === 'encrypt' ? koi8Encrypt(text) : koi8Decrypt(text);
    case 'morse':
      return action === 'encrypt' ? morseEncrypt(text) : morseDecrypt(text, language);
    case 'vigenere':
      return vigenereCipher(text, key, language, action === 'decrypt');
    case 'bacon':
      return action === 'encrypt' ? baconEncrypt(text, language) : baconDecrypt(text, language);
    case 'atbash':
      return atbashCipher(text);
    case 'gronsfeld':
      return gronsfeldCipher(text, digitsKey, action === 'decrypt');
    case 'polybius':
      return action === 'encrypt' ? polybiusEncrypt(text, language) : polybiusDecrypt(text, language);
    case 'playfair':
      return playfairCipher(text, key, language, action === 'decrypt');
    default:
      showError('Неизвестный шифр.');
  }
}

function getOptionsTemplate(cipher) {
  const languageField = `
    <label>
      <span>Язык</span>
      <select id="languageSelect">
        <option value="auto">Авто</option>
        <option value="ru">Русский</option>
        <option value="en">English</option>
      </select>
    </label>
  `;

  if (cipher === 'caesar') {
    return `
      <div class="inline-options">
        <label>
          <span>Сдвиг</span>
          <input id="shiftInput" type="number" value="3" />
        </label>
        <p class="hint">Можно использовать отрицательный сдвиг.</p>
      </div>
    `;
  }

  if (cipher === 'vigenere' || cipher === 'playfair') {
    return `
      <div class="inline-options">
        ${languageField}
        <label>
          <span>Ключ</span>
          <input id="keyInput" type="text" placeholder="Введите ключ" />
        </label>
      </div>
    `;
  }

  if (cipher === 'gronsfeld') {
    return `
      <div class="inline-options">
        <label>
          <span>Цифровой ключ</span>
          <input id="digitsKeyInput" type="text" value="31415" placeholder="Например: 31415" />
        </label>
      </div>
    `;
  }

  if (cipher === 'bacon' || cipher === 'polybius' || cipher === 'morse') {
    return `
      <div class="inline-options">
        ${languageField}
      </div>
    `;
  }

  return '<p class="hint">Для выбранного шифра дополнительные параметры не нужны.</p>';
}

function copyToClipboard(text) {
  if (!text) return Promise.reject(new Error('Нет результата для копирования.'));
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return Promise.reject(new Error('Буфер обмена недоступен в этом браузере.'));
}

if (typeof document !== 'undefined') {
  const cipherSelect = document.getElementById('cipherSelect');
  const actionSelect = document.getElementById('actionSelect');
  const optionsPanel = document.getElementById('optionsPanel');
  const cipherInfo = document.getElementById('cipherInfo');
  const inputText = document.getElementById('inputText');
  const outputText = document.getElementById('outputText');
  const runBtn = document.getElementById('runBtn');
  const clearBtn = document.getElementById('clearBtn');
  const copyBtn = document.getElementById('copyBtn');
  const swapBtn = document.getElementById('swapBtn');
  const toast = document.getElementById('toast');

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  function renderOptions() {
    const cipher = cipherSelect.value;
    optionsPanel.innerHTML = getOptionsTemplate(cipher);
    cipherInfo.textContent = CIPHER_INFO[cipher];
  }

  function collectOptions() {
    return {
      cipher: cipherSelect.value,
      action: actionSelect.value,
      text: inputText.value,
      language: document.getElementById('languageSelect')?.value || 'auto',
      shift: document.getElementById('shiftInput')?.value || '0',
      key: document.getElementById('keyInput')?.value || '',
      digitsKey: document.getElementById('digitsKeyInput')?.value || ''
    };
  }

  function execute() {
    try {
      outputText.value = runCipher(collectOptions());
    } catch (error) {
      showToast(error.message || 'Произошла ошибка.');
    }
  }

  cipherSelect.addEventListener('change', renderOptions);
  runBtn.addEventListener('click', execute);
  inputText.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      execute();
    }
  });
  clearBtn.addEventListener('click', () => {
    inputText.value = '';
    outputText.value = '';
  });
  copyBtn.addEventListener('click', async () => {
    try {
      await copyToClipboard(outputText.value);
      showToast('Результат скопирован.');
    } catch (error) {
      showToast(error.message || 'Не удалось скопировать результат.');
    }
  });
  swapBtn.addEventListener('click', () => {
    const currentInput = inputText.value;
    inputText.value = outputText.value;
    outputText.value = currentInput;
    actionSelect.value = actionSelect.value === 'encrypt' ? 'decrypt' : 'encrypt';
  });

  renderOptions();
}

if (typeof module !== 'undefined') {
  module.exports = {
    runCipher,
    caesarCipher,
    asciiEncrypt,
    asciiDecrypt,
    koi8Encrypt,
    koi8Decrypt,
    morseEncrypt,
    morseDecrypt,
    vigenereCipher,
    baconEncrypt,
    baconDecrypt,
    atbashCipher,
    gronsfeldCipher,
    polybiusEncrypt,
    polybiusDecrypt,
    playfairCipher,
    detectTextLanguage
  };
}
