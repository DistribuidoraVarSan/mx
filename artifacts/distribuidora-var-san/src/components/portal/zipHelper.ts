/**
 * Generador de archivos ZIP estándar (PKWare ZIP format) en TypeScript puro sin dependencias externas.
 * Produce archivos .zip válidos compatibles con Windows Explorer, macOS Finder y Linux.
 */

// Tabla CRC32 estándar
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[i] = c;
}

function crc32(buf: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export interface ZipFileEntry {
  name: string;
  content: string | Uint8Array;
}

export function createZipArchive(files: ZipFileEntry[]): Blob {
  const encoder = new TextEncoder();
  const fileRecords: {
    nameBytes: Uint8Array;
    contentBytes: Uint8Array;
    crc: number;
    offset: number;
  }[] = [];

  const localChunks: Uint8Array[] = [];
  let currentOffset = 0;

  // 1. Escribir Local File Headers + File Data
  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const contentBytes = typeof file.content === 'string' ? encoder.encode(file.content) : file.content;
    const fileCrc = crc32(contentBytes);
    const size = contentBytes.length;

    const localHeader = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(localHeader.buffer);

    // Local file header signature (0x04034b50)
    view.setUint32(0, 0x04034b50, true);
    // Version needed to extract (2.0 = 20)
    view.setUint16(4, 20, true);
    // General purpose bit flag
    view.setUint16(6, 0, true);
    // Compression method (0 = Store / uncompressed)
    view.setUint16(8, 0, true);
    // File last mod time & date
    view.setUint16(10, 0x5000, true);
    view.setUint16(12, 0x5821, true);
    // CRC-32
    view.setUint32(14, fileCrc, true);
    // Compressed size
    view.setUint32(18, size, true);
    // Uncompressed size
    view.setUint32(22, size, true);
    // File name length
    view.setUint16(26, nameBytes.length, true);
    // Extra field length
    view.setUint16(28, 0, true);

    localHeader.set(nameBytes, 30);

    localChunks.push(localHeader);
    localChunks.push(contentBytes);

    fileRecords.push({
      nameBytes,
      contentBytes,
      crc: fileCrc,
      offset: currentOffset,
    });

    currentOffset += localHeader.length + contentBytes.length;
  }

  // 2. Escribir Central Directory Headers
  const centralDirectoryOffset = currentOffset;
  const centralChunks: Uint8Array[] = [];
  let centralDirectorySize = 0;

  for (const record of fileRecords) {
    const centralHeader = new Uint8Array(46 + record.nameBytes.length);
    const view = new DataView(centralHeader.buffer);

    // Central file header signature (0x02014b50)
    view.setUint32(0, 0x02014b50, true);
    // Version made by (UNIX/DOS)
    view.setUint16(4, 20, true);
    // Version needed to extract (2.0)
    view.setUint16(6, 20, true);
    // General purpose bit flag
    view.setUint16(8, 0, true);
    // Compression method (0 = Store)
    view.setUint16(10, 0, true);
    // File last mod time & date
    view.setUint16(12, 0x5000, true);
    view.setUint16(14, 0x5821, true);
    // CRC-32
    view.setUint32(16, record.crc, true);
    // Compressed size
    view.setUint32(20, record.contentBytes.length, true);
    // Uncompressed size
    view.setUint32(24, record.contentBytes.length, true);
    // File name length
    view.setUint16(28, record.nameBytes.length, true);
    // Extra field length
    view.setUint16(30, 0, true);
    // File comment length
    view.setUint16(32, 0, true);
    // Disk number start
    view.setUint16(34, 0, true);
    // Internal file attributes
    view.setUint16(36, 0, true);
    // External file attributes
    view.setUint32(38, 0, true);
    // Relative offset of local header
    view.setUint32(42, record.offset, true);

    centralHeader.set(record.nameBytes, 46);
    centralChunks.push(centralHeader);
    centralDirectorySize += centralHeader.length;
  }

  // 3. End of Central Directory Record (EOCD)
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);

  // EOCD signature (0x06054b50)
  eocdView.setUint32(0, 0x06054b50, true);
  // Number of this disk
  eocdView.setUint16(4, 0, true);
  // Disk with start of central directory
  eocdView.setUint16(6, 0, true);
  // Total entries on this disk
  eocdView.setUint16(8, fileRecords.length, true);
  // Total entries in central directory
  eocdView.setUint16(10, fileRecords.length, true);
  // Size of central directory
  eocdView.setUint32(12, centralDirectorySize, true);
  // Offset of start of central directory
  eocdView.setUint32(16, centralDirectoryOffset, true);
  // ZIP comment length
  eocdView.setUint16(20, 0, true);

  return new Blob([...localChunks, ...centralChunks, eocd] as unknown as BlobPart[], { type: 'application/zip' });
}
