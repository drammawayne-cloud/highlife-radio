// SDK 57's query-string uses require(); the patched decoder is ESM.
// Keep the upstream security fix and bridge its default export for Metro/Node.
const fs = require('node:fs');
const path = require.resolve('query-string');
const source = fs.readFileSync(path, 'utf8');
const before = "const decodeComponent = require('decode-uri-component');";
const after = "const decoderModule = require('decode-uri-component');\nconst decodeComponent = decoderModule.default || decoderModule;";
if (source.includes(before)) fs.writeFileSync(path, source.replace(before, after));
else if (!source.includes(after)) throw new Error('query-string changed; review the decoder compatibility patch before building.');
