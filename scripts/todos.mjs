import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Scan UTF-8 source files in stable order. Never scan the generated list itself.
export function collectTodos(root = projectRoot) {
  const rows = [];
  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile() && entry.name !== 'PLACEHOLDERS.md' && /\.(?:ts|tsx|js|jsx|mjs|css|json|md|html)$/.test(entry.name)) {
        readFileSync(path, 'utf8').split(/\r?\n/).forEach((line, index) => {
          // Include incomplete markers too, so an unfinished TODO cannot disappear.
          for (const match of line.matchAll(/\[TODO[^\]\r\n]*(?:\]|$)/g)) {
            rows.push({ file: relative(root, path).split('\\').join('/'), line: index + 1, text: match[0] });
          }
        });
      }
    }
  }
  visit(join(root, 'src'));
  return rows;
}

export function renderTodos(rows) {
  const cell = (text) => text.replace(/\|/g, '\\|').replace(/`/g, '\\`');
  return '# Thông tin chờ tác giả xác nhận\n\n'
    + 'Tự động tạo bằng `npm run todos`; không sửa trực tiếp. Quét `[TODO` trong `src/`, bỏ qua chính file này.\n\n'
    + `Tổng số placeholder: **${rows.length}**. Mỗi dòng là một lần xuất hiện; có thể cùng nhắc một thông tin.\n\n`
    + '| File | Dòng | Thông tin tác giả cần bổ sung |\n| --- | ---: | --- |\n'
    + rows.map(row => `| ${cell(row.file)} | ${row.line} | ${cell(row.text)} |`).join('\n') + '\n';
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const rows = collectTodos();
  writeFileSync(join(projectRoot, 'src/content/PLACEHOLDERS.md'), renderTodos(rows));
  console.log(`Đã cập nhật src/content/PLACEHOLDERS.md: ${rows.length} placeholder cần xác nhận.`);
}
