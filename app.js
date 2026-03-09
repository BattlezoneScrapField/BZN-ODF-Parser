const fileInput = document.getElementById('fileInput');
const fileNameEl = document.getElementById('fileName');
const uniqueCountEl = document.getElementById('uniqueCount');
const totalCountEl = document.getElementById('totalCount');
const resultsBody = document.getElementById('resultsBody');
const statusEl = document.getElementById('status');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');

let currentFileName = '';
let currentResults = [];

function setStatus(message, isSuccess = false) {
  statusEl.textContent = message;
  statusEl.className = isSuccess ? 'status success' : 'status';
}

function extractObjClasses(text) {
  const regex = /objClass\s*=\s*(?:\"([^\"]+)\"|'([^']+)'|([^\s\r\n;]+))/gi;
  const counts = new Map();
  let match;

  while ((match = regex.exec(text)) !== null) {
    const value = (match[1] || match[2] || match[3] || '').trim();
    if (!value) continue;
    counts.set(value, (counts.get(value) || 0) + 1);
  }

  return Array.from(counts.entries()).map(([objClass, count]) => ({ objClass, count }));
}

function getVisibleRows() {
  const filter = searchInput.value.trim().toLowerCase();
  const mode = sortSelect.value;
  let rows = [...currentResults];

  if (filter) {
    rows = rows.filter(row => row.objClass.toLowerCase().includes(filter));
  }

  rows.sort((a, b) => {
    switch (mode) {
      case 'count-asc':
        return a.count - b.count || a.objClass.localeCompare(b.objClass);
      case 'name-asc':
        return a.objClass.localeCompare(b.objClass);
      case 'name-desc':
        return b.objClass.localeCompare(a.objClass);
      case 'count-desc':
      default:
        return b.count - a.count || a.objClass.localeCompare(b.objClass);
    }
  });

  return rows;
}

function renderTable() {
  const rows = getVisibleRows();

  if (!rows.length) {
    resultsBody.innerHTML = '<tr><td colspan="2" class="empty-row">No matching objClass values found.</td></tr>';
    return;
  }

  resultsBody.innerHTML = rows.map(row => `
    <tr>
      <td>${row.objClass}</td>
      <td>${row.count}</td>
    </tr>
  `).join('');
}

function updateStats() {
  uniqueCountEl.textContent = String(currentResults.length);
  totalCountEl.textContent = String(
    currentResults.reduce((sum, row) => sum + row.count, 0)
  );
}

function updateButtons() {
  const enabled = currentResults.length > 0;
  copyBtn.disabled = !enabled;
  downloadBtn.disabled = !enabled;
}

function escapeCsv(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

fileInput.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  currentFileName = file.name;
  fileNameEl.textContent = currentFileName;
  setStatus('Reading file...');

  try {
    const text = await file.text();
    currentResults = extractObjClasses(text);
    updateStats();
    renderTable();
    updateButtons();

    if (currentResults.length === 0) {
      setStatus('No objClass entries were found. Make sure the file is an ASCII .BZN file.');
    } else {
      const total = currentResults.reduce((sum, row) => sum + row.count, 0);
      setStatus(`Found ${total} objClass entries across ${currentResults.length} unique values.`, true);
    }
  } catch (error) {
    currentResults = [];
    updateStats();
    renderTable();
    updateButtons();
    setStatus('Could not read the file: ' + error.message);
  }
});

searchInput.addEventListener('input', renderTable);
sortSelect.addEventListener('change', renderTable);

copyBtn.addEventListener('click', async () => {
  const text = getVisibleRows()
    .map(row => `${row.objClass}: ${row.count}`)
    .join('\n');

  try {
    await navigator.clipboard.writeText(text);
    setStatus('Results copied to clipboard.', true);
  } catch (error) {
    setStatus('Copy failed: ' + error.message);
  }
});

downloadBtn.addEventListener('click', () => {
  const rows = getVisibleRows();
  const csv = ['objClass,Quantity', ...rows.map(row => `${escapeCsv(row.objClass)},${row.count}`)].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const baseName = currentFileName.replace(/\.[^.]+$/, '') || 'bzn_results';

  link.href = url;
  link.download = `${baseName}_objclass_counts.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});
