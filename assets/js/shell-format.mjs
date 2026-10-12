export function formatSnippet(source, shell = 'powershell') {
  if (shell === 'bash') return source;
  return source.split('\n').map(line => {
    if (/^\s*#/.test(line)) return shell === 'cmd' ? line.replace(/^(\s*)#\s?/, '$1REM ') : line;
    let quote = null; let output = '';
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if ((char === '"' || char === "'") && line[i - 1] !== '\\' && line[i - 1] !== '`') quote = quote === char ? null : quote || char;
      if (!quote && char === '#' && (i === 0 || /\s/.test(line[i - 1])) && shell === 'cmd') break;
      if (!quote && char === '&' && line[i + 1] === '&' && shell === 'powershell') {
        output += '\n# Run the next command only if the preceding command succeeds.\n'; i++; continue;
      }
      output += char;
    }
    return output.trimEnd();
  }).join('\n');
}
