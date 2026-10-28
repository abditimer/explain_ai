import { readFile, writeFile } from 'node:fs/promises';

const sourcePath = new URL('../docs/code/teaching_transformer.py', import.meta.url);
const outputPath = new URL('../public/implementation.html', import.meta.url);
const source = await readFile(sourcePath, 'utf8');
const escaped = source.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const sourceLines = escaped.split('\n');
const rawLines = source.split('\n');
const lines = sourceLines.map((line, index) => {
  const region = rawLines[index].match(/^# region ([\w-]+)$/)?.[1];
  const anchor = region ? `<span id="region-${region}"></span><span id="region-${region}-L${index + 2}"></span>` : '';
  return `${anchor}<span id="L${index + 1}" class="line"><span class="number" aria-hidden="true">${index + 1}</span>${line || ' '}</span>`;
}).join('\n');

const chapters = [
  ['imports', 'Imports and setup', 'Shared tokenizer and dependencies'],
  ['data-prep', 'Prepare examples', 'Text splits and shifted context-target windows'],
  ['model', 'Represent the sentence', 'Token and position embeddings, repeated blocks, final output scores'],
  ['attention', 'Connect positions', 'Query, key, and value projections; causal attention'],
  ['feedforward', 'Transform each position', 'Expansion, GELU, and projection back to model width'],
  ['block', 'Repeat the block', 'Pre-normalized attention and feed-forward residual paths'],
  ['generation', 'Continue the sentence', 'Temperature, optional top-k, selection, append, and decode'],
  ['training', 'How learning works', 'Cross-entropy, gradients, optimizer steps, and evaluation'],
];
const chapterLinks = chapters.map(([id, title, description]) =>
  `<li><a href="#region-${id}">${title}</a><span>${description}</span></li>`
).join('');

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Complete canonical Python source for the GPT-2 Small–style teaching implementation.">
<title>Complete teaching implementation</title>
<style>
body{margin:0;background:#f8f7f3;color:#173b35;font:16px/1.55 system-ui,sans-serif}main{max-width:1000px;margin:auto;padding:2rem 1.25rem 5rem}a{color:#57488b}nav{margin:2rem 0 2.5rem;padding:1.25rem 1.5rem;background:#fff;border:1px solid #d8e0da;border-radius:12px}nav h2{margin-top:0;font-size:1.15rem}nav ol{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:.75rem 2rem;padding-left:1.25rem}nav li{padding:.25rem 0}nav li span{display:block;color:#47594f;font-size:.9rem}pre{overflow:auto;padding:1.25rem;background:#182522;color:#f4f1e9;border-radius:12px;font:13px/1.6 ui-monospace,monospace}.line{display:block;min-height:1.6em}.number{display:inline-block;width:3.5em;padding-right:1em;text-align:right;color:#9aa9a2;user-select:none}.line:target{background:#54466b;color:#fff}
</style></head><body><main><p><a href="./">← Back to the story</a></p><h1>Complete teaching implementation</h1><p>Canonical source for the code excerpts used in the story. This educational implementation uses random initial weights, a 256-token context, and an untied output projection. It does not load a trained GPT-2 checkpoint.</p><nav aria-label="Implementation chapters"><h2>Follow the implementation</h2><ol>${chapterLinks}</ol></nav><pre><code>${lines}</code></pre></main></body></html>`;
await writeFile(outputPath, html);
console.log(`Generated ${outputPath.pathname} from ${sourcePath.pathname}`);
