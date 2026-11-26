// Compact ISO/IEC 18004 QR Code (Versions 1-6, ECC Level L, Byte Mode) SVG renderer.
// Supports URLs up to 134 UTF-8 bytes offline with zero external dependencies.

const VERSIONS = [
  { size: 21, totalData: 19, blocks: 1, dataPerBlock: 19, ecPerBlock: 7 },
  { size: 25, totalData: 34, blocks: 1, dataPerBlock: 34, ecPerBlock: 10 },
  { size: 29, totalData: 55, blocks: 1, dataPerBlock: 55, ecPerBlock: 15 },
  { size: 33, totalData: 80, blocks: 1, dataPerBlock: 80, ecPerBlock: 20 },
  { size: 37, totalData: 108, blocks: 1, dataPerBlock: 108, ecPerBlock: 26 },
  { size: 41, totalData: 136, blocks: 2, dataPerBlock: 68, ecPerBlock: 18 }
];

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
{
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
}

function gfMul(a, b) {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsGeneratorPoly(degree) {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    const factor = GF_EXP[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], factor);
    }
    poly = next;
  }
  return poly;
}

function rsComputeEc(data, ecCount) {
  const gen = rsGeneratorPoly(ecCount);
  const rem = new Uint8Array(ecCount);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ rem[0];
    for (let j = 0; j < ecCount - 1; j++) {
      rem[j] = rem[j + 1] ^ gfMul(gen[j + 1], factor);
    }
    rem[ecCount - 1] = gfMul(gen[ecCount], factor);
  }
  return rem;
}

function encodeCodewords(text) {
  const bytes = new TextEncoder().encode(text);
  const versionIndex = VERSIONS.findIndex(v => bytes.length + 2 <= v.totalData);
  if (versionIndex === -1) return null;

  const spec = VERSIONS[versionIndex];
  const bits = [];
  const pushBits = (value, length) => {
    for (let i = length - 1; i >= 0; i--) {
      bits.push((value >>> i) & 1);
    }
  };

  // Byte mode (0100) + 8-bit length (for versions 1-9)
  pushBits(0b0100, 4);
  pushBits(bytes.length, 8);
  for (const b of bytes) pushBits(b, 8);

  const capacityBits = spec.totalData * 8;
  const terminator = Math.min(4, capacityBits - bits.length);
  pushBits(0, terminator);
  while (bits.length % 8 !== 0) bits.push(0);

  const data = new Uint8Array(spec.totalData);
  for (let i = 0; i < bits.length / 8; i++) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i * 8 + j];
    data[i] = byte;
  }

  let padIndex = bits.length / 8;
  let padByte = 0xec;
  while (padIndex < spec.totalData) {
    data[padIndex++] = padByte;
    padByte = padByte === 0xec ? 0x11 : 0xec;
  }

  const dataBlocks = [];
  const ecBlocks = [];
  for (let b = 0; b < spec.blocks; b++) {
    const slice = data.subarray(
      b * spec.dataPerBlock,
      (b + 1) * spec.dataPerBlock
    );
    dataBlocks.push(slice);
    ecBlocks.push(rsComputeEc(slice, spec.ecPerBlock));
  }

  const codewords = [];
  for (let i = 0; i < spec.dataPerBlock; i++) {
    for (let b = 0; b < spec.blocks; b++) codewords.push(dataBlocks[b][i]);
  }
  for (let i = 0; i < spec.ecPerBlock; i++) {
    for (let b = 0; b < spec.blocks; b++) codewords.push(ecBlocks[b][i]);
  }

  return { size: spec.size, version: versionIndex + 1, codewords };
}

function formatBitsForMask(mask) {
  // ECC Level L = 01
  const data = (0b01 << 3) | mask;
  let rem = data << 10;
  for (let i = 14; i >= 10; i--) {
    if (rem & (1 << i)) rem ^= 0x537 << (i - 10);
  }
  return ((data << 10) | rem) ^ 0x5412;
}

const MASK_FNS = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (_, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0
];

function computePenalty(grid, size) {
  let score = 0;
  let dark = 0;

  for (let r = 0; r < size; r++) {
    let runRow = 1;
    let runCol = 1;
    for (let c = 0; c < size; c++) {
      if (grid[r][c]) dark++;
      if (c > 0) {
        if (grid[r][c] === grid[r][c - 1]) {
          runRow++;
          if (runRow === 5) score += 3;
          else if (runRow > 5) score += 1;
        } else {
          runRow = 1;
        }

        if (grid[c][r] === grid[c - 1][r]) {
          runCol++;
          if (runCol === 5) score += 3;
          else if (runCol > 5) score += 1;
        } else {
          runCol = 1;
        }
      }
      if (r < size - 1 && c < size - 1) {
        const v = grid[r][c];
        if (v === grid[r][c + 1] && v === grid[r + 1][c] && v === grid[r + 1][c + 1]) {
          score += 3;
        }
      }
    }
  }

  const ratio = Math.abs(Math.round((dark * 100) / (size * size)) - 50);
  score += Math.floor(ratio / 5) * 10;
  return score;
}

function buildMatrix(text) {
  const encoded = encodeCodewords(text);
  if (!encoded) return null;

  const { size, version, codewords } = encoded;
  const grid = Array.from({ length: size }, () => new Uint8Array(size));
  const isFn = Array.from({ length: size }, () => new Uint8Array(size));

  const setFn = (r, c, dark) => {
    if (r < 0 || c < 0 || r >= size || c >= size) return;
    grid[r][c] = dark ? 1 : 0;
    isFn[r][c] = 1;
  };

  // Finder patterns + separators
  const centers = [
    [3, 3],
    [3, size - 4],
    [size - 4, 3]
  ];
  for (const [cr, cc] of centers) {
    for (let dr = -4; dr <= 4; dr++) {
      for (let dc = -4; dc <= 4; dc++) {
        const dist = Math.max(Math.abs(dr), Math.abs(dc));
        setFn(cr + dr, cc + dc, dist !== 2 && dist !== 4);
      }
    }
  }

  // Alignment pattern (Versions 2-6 have a single non-overlapping pattern at size - 7)
  if (version >= 2) {
    const pos = size - 7;
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const dist = Math.max(Math.abs(dr), Math.abs(dc));
        setFn(pos + dr, pos + dc, dist !== 1);
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    setFn(6, i, i % 2 === 0);
    setFn(i, 6, i % 2 === 0);
  }

  // Reserve format info + fixed dark module
  for (let i = 0; i <= 8; i++) {
    if (!isFn[8][i]) setFn(8, i, false);
    if (!isFn[i][8]) setFn(i, 8, false);
  }
  for (let i = size - 8; i < size; i++) {
    setFn(8, i, false);
  }
  for (let i = size - 7; i < size; i++) {
    setFn(i, 8, false);
  }
  setFn(size - 8, 8, true);

  // Place data bits in standard zigzag order
  let bitIndex = 0;
  const totalBits = codewords.length * 8;
  let upward = true;

  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let step = 0; step < size; step++) {
      const r = upward ? size - 1 - step : step;
      for (let offset = 0; offset < 2; offset++) {
        const c = right - offset;
        if (isFn[r][c]) continue;
        let bit = 0;
        if (bitIndex < totalBits) {
          bit = (codewords[bitIndex >>> 3] >>> (7 - (bitIndex & 7))) & 1;
        }
        grid[r][c] = bit;
        bitIndex++;
      }
    }
    upward = !upward;
  }

  const writeFormat = (target, mask) => {
    const bits = formatBitsForMask(mask);
    const b = i => (bits >>> i) & 1;
    // Copy 1 around top-left finder
    const coords1 = [
      [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
      [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]
    ];
    for (let i = 0; i < 15; i++) {
      const [r, c] = coords1[i];
      target[r][c] = b(14 - i);
    }
    // Copy 2 across bottom-left and top-right finders
    for (let i = 0; i < 7; i++) {
      target[size - 1 - i][8] = b(14 - i);
    }
    for (let i = 0; i < 8; i++) {
      target[8][size - 8 + i] = b(7 - i);
    }
  };

  let bestGrid = null;
  let bestScore = Infinity;

  for (let mask = 0; mask < 8; mask++) {
    const candidate = grid.map(row => new Uint8Array(row));
    const maskFn = MASK_FNS[mask];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!isFn[r][c] && maskFn(r, c)) {
          candidate[r][c] ^= 1;
        }
      }
    }
    writeFormat(candidate, mask);
    const score = computePenalty(candidate, size);
    if (score < bestScore) {
      bestScore = score;
      bestGrid = candidate;
    }
  }

  return { size, grid: bestGrid };
}

export function qrSvg(text, label = "QR code") {
  const result = buildMatrix(text);
  if (!result) return "";

  const { size, grid } = result;
  const quiet = 4;
  const total = size + quiet * 2;
  let path = "";

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c]) {
        path += `M${c + quiet},${r + quiet}h1v1h-1z`;
      }
    }
  }

  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 ${total} ${total}"
      shape-rendering="crispEdges"
      role="img"
      aria-label="${label}"
      class="qr-svg"
    >
      <rect width="${total}" height="${total}" fill="#ffffff" />
      <path d="${path}" fill="#0f172a" />
    </svg>
  `;
}
