const DEFAULT_DOWNLOAD_BASENAME = 'resume-export';

export function sanitizeDownloadBasename(value: string) {
  const normalized = value
    .normalize('NFC')
    .replace(/[\u0000-\u001F\u007F<>:"/\\|?*]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/g, '')
    .replace(/^[-_. ]+|[-_. ]+$/g, '');

  return normalized || DEFAULT_DOWNLOAD_BASENAME;
}

export function buildAttachmentContentDisposition(filename: string) {
  const { basename, extension } = splitFilename(filename);
  const safeBasename = sanitizeDownloadBasename(basename);
  const safeExtension = sanitizeExtension(extension);
  const safeFilename = `${safeBasename}${safeExtension}`;
  const asciiBasename =
    buildAsciiFilenameFallback(safeBasename) || DEFAULT_DOWNLOAD_BASENAME;
  const asciiFilename = `${asciiBasename}${safeExtension}`;

  return `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeRFC5987ValueChars(safeFilename)}`;
}

export function extractFilenameFromContentDisposition(
  headerValue: string | null
) {
  if (!headerValue) {
    return '';
  }

  const filenameStarMatch = headerValue.match(/filename\*\s*=\s*([^;]+)/i);
  if (filenameStarMatch) {
    const encodedValue = stripQuotes(filenameStarMatch[1].trim());
    const encodedFilename = encodedValue.includes("''")
      ? encodedValue.split("''").slice(1).join("''")
      : encodedValue;

    try {
      return decodeURIComponent(encodedFilename);
    } catch {
      return encodedFilename;
    }
  }

  const filenameMatch = headerValue.match(/filename\s*=\s*([^;]+)/i);
  if (!filenameMatch) {
    return '';
  }

  return stripQuotes(filenameMatch[1].trim());
}

function buildAsciiFilenameFallback(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]+/g, '')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-_.]+|[-_.]+$/g, '');
}

function encodeRFC5987ValueChars(value: string) {
  return encodeURIComponent(value).replace(
    /['()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function stripQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function sanitizeExtension(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '')
    .trim();

  if (!normalized) {
    return '';
  }

  return normalized.startsWith('.') ? normalized : `.${normalized}`;
}

function splitFilename(value: string) {
  const trimmed = value.trim();
  const index = trimmed.lastIndexOf('.');

  if (index <= 0 || index === trimmed.length - 1) {
    return {
      basename: trimmed,
      extension: '',
    };
  }

  return {
    basename: trimmed.slice(0, index),
    extension: trimmed.slice(index),
  };
}
