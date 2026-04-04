import type { TrafficLogEntry } from './TrafficLogBuffer';

export function renderAdminLogsHtml(entries: readonly TrafficLogEntry[]): string {
  const rows = entries
    .map(
      (e) =>
        `<tr><td>${escapeHtml(e.timestamp)}</td><td>${escapeHtml(e.method)}</td><td>${escapeHtml(e.path)}</td><td>${e.statusCode}</td><td>${e.durationMs}</td></tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Dispatcher traffic log</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 1.5rem; background: #0f1419; color: #e7e9ea; }
    h1 { font-size: 1.25rem; margin-bottom: 1rem; }
    table { border-collapse: collapse; width: 100%; font-size: 0.875rem; }
    th, td { border: 1px solid #38444d; padding: 0.5rem 0.6rem; text-align: left; }
    th { background: #1e2732; }
    tr:nth-child(even) { background: #15202b; }
    .hint { color: #8b98a5; font-size: 0.8rem; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <h1>Dispatcher — traffic log (last ${entries.length} requests)</h1>
  <p class="hint">Send header <code>x-admin-token</code> to access JSON at <code>/gateway/admin/logs</code>.</p>
  <table>
    <thead><tr><th>Time (ISO)</th><th>Method</th><th>Path</th><th>Status</th><th>Duration ms</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="5">No entries yet.</td></tr>'}</tbody>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
