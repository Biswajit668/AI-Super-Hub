// Helper functions for Unicode fonts, upside-down text, and text transformations

// Upside down character map
const upsideDownMap: Record<string, string> = {
  a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ı', j: 'ɾ',
  k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ',
  u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z',
  A: '∀', B: 'q', C: 'Ɔ', D: 'p', E: 'Ǝ', F: 'Ⅎ', G: '⅁', H: 'H', I: 'I', J: 'ſ',
  K: 'ʞ', L: '˥', M: 'W', N: 'N', O: 'O', P: 'Ԁ', Q: 'Ό', R: 'ᴚ', S: 'S', T: '┴',
  U: '∩', V: 'Λ', W: 'M', X: 'X', Y: '⅄', Z: 'Z',
  '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6',
  '.': '˙', ',': '\'', '\'': ',', '"': '‚‚', '?': '¿', '!': '¡', '[': ']', ']': '[',
  '(': ')', ')': '(', '{': '}', '}': '{', '<': '>', '>': '<', '_': '‾'
};

export function toUpsideDown(text: string): string {
  return text.split('').map(c => upsideDownMap[c] || c).reverse().join('');
}

// Unicode Bold
export function toUnicodeBold(text: string): string {
  return text.replace(/[a-zA-Z0-9]/g, (char) => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d400 + (code - 65)); // A-Z
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1d41a + (code - 97)); // a-z
    if (code >= 48 && code <= 57) return String.fromCodePoint(0x1d7ce + (code - 48)); // 0-9
    return char;
  });
}

// Unicode Italic
export function toUnicodeItalic(text: string): string {
  return text.replace(/[a-zA-Z]/g, (char) => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1d434 + (code - 65)); // A-Z
    if (code >= 97 && code <= 122) {
      if (char === 'h') return 'ℎ'; // Special case for italic h
      return String.fromCodePoint(0x1d44e + (code - 97)); // a-z
    }
    return char;
  });
}

// Unicode Cursive Script
export function toUnicodeCursive(text: string): string {
  const cursiveMap: Record<string, string> = {
    A: '𝒜', B: 'ℬ', C: '𝒞', D: '𝒟', E: 'ℰ', F: 'ℱ', G: '𝒢', H: 'ℋ', I: 'ℐ', J: '𝒥',
    K: '𝒦', L: 'ℒ', M: 'ℳ', N: '𝒩', O: '𝒪', P: '𝒫', Q: '𝒬', R: 'ℛ', S: '𝒮', T: '𝒯',
    U: '𝒰', V: '𝒱', W: '𝒲', X: '𝒳', Y: '𝒴', Z: '𝒵',
    a: '𝒶', b: '𝒷', c: '𝒸', d: '𝒹', e: 'ℯ', f: '𝒻', g: 'ℊ', h: '𝒽', i: '𝒾', j: '𝒿',
    k: '𝓀', l: '𝓁', m: '𝓂', n: '𝓃', o: 'ℴ', p: '𝓅', q: '𝓆', r: '𝓇', s: '𝓈', t: '𝓉',
    u: '𝓊', v: '𝓋', w: '𝓌', x: '𝓍', y: '𝓎', z: '𝓏'
  };
  return text.split('').map(c => cursiveMap[c] || c).join('');
}

// Unicode Old English / Blackletter
export function toUnicodeOldEnglish(text: string): string {
  const oldEngMap: Record<string, string> = {
    A: '𝔄', B: '𝔅', C: 'ℭ', D: '𝔇', E: '𝔈', F: '𝔉', G: '𝔤', H: 'ℌ', I: 'ℑ', J: '𝔍',
    K: '𝔏', L: '𝔏', M: '𝔐', N: '𝔑', O: '𝔒', P: '𝔓', Q: '𝔔', R: 'ℜ', S: '𝔖', T: '𝔗',
    U: '𝔘', V: '𝔙', W: '𝔚', X: '𝔛', Y: '𝔜', Z: 'ℨ',
    a: '𝔞', b: '𝔟', c: '𝔠', d: '𝔡', e: '𝔢', f: '𝔣', g: '𝔤', h: '𝔥', i: '𝔦', j: '𝔧',
    k: '𝔨', l: '𝔩', m: '𝔪', n: '𝔫', o: '𝔬', p: '𝔭', q: '𝔮', r: '𝔯', s: '𝔰', t: '𝔱',
    u: '𝔲', v: '𝔳', w: '𝔴', x: '𝔵', y: '𝔶', z: '𝔷'
  };
  return text.split('').map(c => oldEngMap[c] || c).join('');
}

// Normalize Fancy Unicode back to standard ASCII
export function normalizeUnicodeText(text: string): string {
  return text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
}

// Pronounceable password generator
export function generatePronounceablePassword(length = 12): string {
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'z'];
  let res = '';
  for (let i = 0; i < length; i++) {
    if (i % 2 === 0) {
      res += consonants[Math.floor(Math.random() * consonants.length)];
    } else {
      res += vowels[Math.floor(Math.random() * vowels.length)];
    }
  }
  // Capitalize random letter & append numbers
  const randomNum = Math.floor(100 + Math.random() * 900);
  return res.charAt(0).toUpperCase() + res.slice(1) + '-' + randomNum;
}

// Username generator
export function generateUsernames(keyword = 'cyber', style = 'gaming', count = 8): string[] {
  const prefixes = ['The', 'Real', 'Super', 'Epic', 'Pro', 'Ultra', 'Hyper', 'Master', 'Alpha', 'Shadow', 'Neon'];
  const suffixes = ['Ninja', 'X', 'Dev', 'Gamer', 'HQ', 'Lab', 'Prime', 'Bot', 'Soul', 'Vibe', 'Zone'];
  const res: string[] = [];
  const base = keyword.trim().toLowerCase().replace(/\s+/g, '') || 'user';

  for (let i = 0; i < count; i++) {
    const pre = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suf = suffixes[Math.floor(Math.random() * suffixes.length)];
    const num = Math.floor(10 + Math.random() * 90);

    if (style === 'gaming') {
      res.push(`${pre}_${base}_${num}`);
    } else if (style === 'tech') {
      res.push(`${base}.${suf.toLowerCase()}`);
    } else if (style === 'aesthetic') {
      res.push(`${base}_${suf.toLowerCase()}`);
    } else {
      res.push(`${pre}${base}${num}`);
    }
  }
  return Array.from(new Set(res));
}

// Random word generator list
const sampleWordList = [
  'apple', 'mountain', 'horizon', 'whisper', 'galaxy', 'crystal', 'breeze', 'echo', 'fountain',
  'thunder', 'journey', 'velocity', 'spectrum', 'harmony', 'mirage', 'orchard', 'cascade', 'pioneer',
  'zenith', 'solitude', 'radiance', 'beacon', 'twilight', 'monarch', 'symphony', 'vortex', 'compass',
  'lunar', 'nebula', 'starlight', 'shadow', 'serenade', 'odyssey', 'sanctuary', 'eclipse', 'labyrinth'
];

export function getRandomWords(count = 5): string[] {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(sampleWordList[Math.floor(Math.random() * sampleWordList.length)]);
  }
  return words;
}
