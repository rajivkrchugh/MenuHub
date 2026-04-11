/**
 * Parse a Markdown table string into structured data.
 * Returns { headers: string[], rows: string[][] } or null if no table found.
 */
export function parseMarkdownTable(text) {
  if (!text) return null;

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const tableLines = [];
  let inTable = false;

  for (const line of lines) {
    if (line.startsWith('|') && line.endsWith('|')) {
      inTable = true;
      tableLines.push(line);
    } else if (inTable) {
      break; // table ended
    }
  }

  if (tableLines.length < 3) return null; // need header + separator + at least 1 row

  const parse = (row) =>
    row
      .split('|')
      .slice(1, -1) // remove empty first/last from leading/trailing pipes
      .map((cell) => cell.trim());

  const headers = parse(tableLines[0]);
  // Skip separator line (index 1)
  const rows = tableLines.slice(2).map(parse);

  return { headers, rows };
}

/**
 * Split AI response into text parts and table parts for rendering.
 * Returns an array of { type: 'text'|'table', content: string|object }
 */
export function splitResponse(text) {
  if (!text) return [];

  const parts = [];
  const lines = text.split('\n');
  let buffer = [];
  let tableBuffer = [];
  let inTable = false;

  const flushText = () => {
    if (buffer.length) {
      const content = buffer.join('\n').trim();
      if (content) parts.push({ type: 'text', content });
      buffer = [];
    }
  };

  const flushTable = () => {
    if (tableBuffer.length >= 3) {
      const tableText = tableBuffer.join('\n');
      const parsed = parseMarkdownTable(tableText);
      if (parsed) {
        parts.push({ type: 'table', content: parsed });
      } else {
        buffer.push(...tableBuffer);
      }
    } else {
      buffer.push(...tableBuffer);
    }
    tableBuffer = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    const isTableLine = trimmed.startsWith('|') && trimmed.endsWith('|');

    if (isTableLine) {
      if (!inTable) {
        flushText();
        inTable = true;
      }
      tableBuffer.push(trimmed);
    } else {
      if (inTable) {
        flushTable();
        inTable = false;
      }
      buffer.push(line);
    }
  }

  if (inTable) flushTable();
  flushText();

  return parts;
}
