/**
 * Git Auto-Sync Watcher
 * Watches for file changes and automatically syncs to GitHub
 */
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Directories to watch
const WATCH_DIRS = ['src', 'prisma', 'public', 'logs'];

// Debounce timer
let syncTimeout = null;
const DEBOUNCE_MS = 5000; // Wait 5 seconds after last change

// Track if sync is in progress
let isSyncing = false;

console.log('👀 Git Auto-Sync Watcher started...');
console.log('📁 Watching directories:', WATCH_DIRS.join(', '));
console.log('⏱️  Sync delay: 5 seconds after last change\n');

/**
 * Execute git sync
 */
function gitSync() {
  if (isSyncing) {
    console.log('⏳ Sync already in progress, skipping...');
    return;
  }

  isSyncing = true;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const message = `Auto-sync: ${new Date().toLocaleString()}`;

  console.log('\n🔄 Starting sync...');

  // Check for changes first
  exec('git status --porcelain', (err, stdout) => {
    if (err) {
      console.error('❌ Git status error:', err.message);
      isSyncing = false;
      return;
    }

    if (!stdout.trim()) {
      console.log('✨ No changes to sync.');
      isSyncing = false;
      return;
    }

    console.log('📝 Changes detected:');
    console.log(stdout);

    // Add, commit, and push
    exec(`git add . && git commit -m "${message}" && git push`, (err, stdout, stderr) => {
      isSyncing = false;

      if (err) {
        console.error('❌ Sync failed:', err.message);
        return;
      }

      console.log('✅ Sync completed successfully!');
      console.log(stdout);
    });
  });
}

/**
 * Handle file change
 */
function onFileChange(eventType, filename, dir) {
  if (!filename) return;

  // Ignore certain files
  if (filename.endsWith('.db-journal') || filename.startsWith('.git')) {
    return;
  }

  console.log(`📄 ${eventType}: ${dir}/${filename}`);

  // Debounce - wait for changes to settle
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  syncTimeout = setTimeout(() => {
    gitSync();
  }, DEBOUNCE_MS);
}

// Watch each directory
WATCH_DIRS.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  
  if (fs.existsSync(fullPath)) {
    fs.watch(fullPath, { recursive: true }, (eventType, filename) => {
      onFileChange(eventType, filename, dir);
    });
    console.log(`✓ Watching: ${dir}/`);
  } else {
    console.log(`⚠ Directory not found: ${dir}/`);
  }
});

// Also watch root files
const rootFiles = ['.gitignore', 'package.json', 'README.md'];
rootFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    fs.watch(fullPath, (eventType) => {
      onFileChange(eventType, file, '.');
    });
  }
});

console.log('\n✅ Watcher ready. Press Ctrl+C to stop.\n');

// Keep process running
process.on('SIGINT', () => {
  console.log('\n👋 Watcher stopped.');
  process.exit(0);
});
