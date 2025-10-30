#!/usr/bin/env node
/**
 * Simple build script for a plain Node.js (ESM) project.
 * - Cleans dist/
 * - Copies runtime JS, JSON, .env example, and SQL/migration assets
 * - Performs a syntax check on each copied .js file
 * - Writes a build manifest
 */
import { rmSync, mkdirSync, cpSync, readdirSync, statSync, writeFileSync } from 'fs';
import { resolve, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const projectRoot = resolve(__dirname, '..');
const distDir = resolve(projectRoot, 'dist');

function log(msg){
  process.stdout.write(`[build] ${msg}\n`);
}

function clean(){
  rmSync(distDir, { recursive: true, force: true });
  mkdirSync(distDir, { recursive: true });
  log('Cleaned dist/');
}

const includeDirs = [
  'controller',
  'models',
  'routes',
  'server',
  'utils',
  'procedures',
  'migrations',
  'seeds'
];

const includeRootFiles = [
  'index.js',
  'db.js',
  'knexfile.cjs',
  '.env.example'
];

function copyDir(src, dest){
  mkdirSync(dest, { recursive: true });
  for(const entry of readdirSync(src)){
    const s = resolve(src, entry);
    const d = resolve(dest, entry);
    const st = statSync(s);
    if(st.isDirectory()){
      copyDir(s,d);
    } else {
      cpSync(s,d);
    }
  }
}

function copy(){
  for(const dir of includeDirs){
    const src = resolve(projectRoot, dir);
    try {
      const st = statSync(src);
      if(st.isDirectory()){
        copyDir(src, resolve(distDir, dir));
        log(`Copied ${dir}/`);
      }
    } catch{/* ignore missing */}
  }
  for(const f of includeRootFiles){
    try {
      cpSync(resolve(projectRoot, f), resolve(distDir, f));
      log(`Copied ${f}`);
    } catch{/* ignore missing */}
  }
}

async function syntaxCheck(){
  const checked = [];
  function walk(p){
    const st = statSync(p);
    if(st.isDirectory()){
      for(const e of readdirSync(p)) walk(resolve(p,e));
    } else if(extname(p) === '.js' || p.endsWith('.cjs')) {
      checked.push(p);
    }
  }
  walk(distDir);
  for(const file of checked){
    // Use a child process to check syntax
    const { spawnSync } = await import('child_process');
    const r = spawnSync(process.execPath, ['--check', file]);
    if(r.status !== 0){
      process.stderr.write(r.stderr.toString());
      throw new Error(`Syntax error in ${file}`);
    }
  }
  log(`Syntax validated for ${checked.length} files.`);
}

function writeManifest(){
  const manifest = { builtAt: new Date().toISOString() };
  writeFileSync(resolve(distDir,'build-manifest.json'), JSON.stringify(manifest,null,2));
  log('Wrote build-manifest.json');
}

(async function run(){
  try {
    log('Starting build');
    clean();
    copy();
    await syntaxCheck();
    writeManifest();
    log('Build complete');
  } catch(err){
    console.error('[build] Failed:', err.message);
    process.exit(1);
  }
})();
