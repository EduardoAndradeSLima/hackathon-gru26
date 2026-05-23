function escapeCsv(value) {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = Array.isArray(value) ? value.join('; ') : String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function toCsv(rows) {
  if (!rows.length) {
    return '';
  }

  const headers = Object.keys(rows[0]);
  const lines = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(','))
  ];

  return lines.join('\n');
}

module.exports = { toCsv };
