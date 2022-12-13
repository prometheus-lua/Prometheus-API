export enum FileSizeUnit {
  B,
  KB,
  MB,
}

export function getFileSize(unit: FileSizeUnit, size: number) {
  switch (unit) {
    case FileSizeUnit.B:
      return size;
    case FileSizeUnit.KB:
      return size / 1024;
    case FileSizeUnit.MB:
      return size / 1024 / 1024;
  }
}

export function getFileSizeFromString(content: string) {
  return Buffer.byteLength(content, 'utf8') || 0;
}