import { mkdirSync, copyFileSync, cpSync, existsSync, writeFileSync, rmSync } from 'node:fs';
rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
for (const file of ['index.html', 'favicon.svg']) copyFileSync(file, `dist/${file}`);
for (const directory of ['assets', 'src']) if (existsSync(directory)) cpSync(directory, `dist/${directory}`, { recursive: true });
writeFileSync('dist/.nojekyll', '');
console.log('BUILD: only public site files copied into dist; planning, tests and source-control metadata excluded.');
