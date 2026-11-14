require('esbuild').buildSync({
  entryPoints: ['src/infinity/director.mjs'],
  bundle: true,
  format: 'iife',
  target: ['es2022'],
  minify: true,
  outfile: 'js/infinity.bundle.js',
  legalComments: 'eof'
});
// Give every changed browser asset a new URL, including the unbundled interaction/audio code.
const fs=require('node:fs'),crypto=require('node:crypto');
const html=fs.readFileSync('index.html','utf8').replace(/((?:src|href)=")([^"?#]+\.(?:js|css))(?:\?[^"\s]*)?"/g,(match,prefix,file)=>{
  if(!fs.existsSync(file))return match;
  const hash=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0,12);
  return `${prefix}${file}?v=${hash}"`;
});
fs.writeFileSync('index.html',html);
