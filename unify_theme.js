const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = walkSync(dirFile, filelist);
    } catch (err) {
      if (dirFile.endsWith('.tsx') || dirFile.endsWith('.ts')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const files = walkSync('./src/pages').concat(walkSync('./src/components'));

const replacements = [
  // Backgrounds
  { regex: /bg-slate-50/g, replacement: 'bg-[var(--panel-soft)]' },
  { regex: /bg-slate-100/g, replacement: 'bg-[var(--surface-hover)]' },
  { regex: /bg-slate-200/g, replacement: 'bg-[var(--muted)]' },
  { regex: /bg-\[\#F8FAFC\]/g, replacement: 'bg-background' },
  { regex: /bg-white/g, replacement: 'bg-card' },
  { regex: /bg-blue-50/g, replacement: 'bg-[var(--primary-light-bg)]' },
  { regex: /bg-blue-100/g, replacement: 'bg-[var(--primary-light-border)]' },
  
  // Borders
  { regex: /border-slate-100/g, replacement: 'border-[var(--border)]' },
  { regex: /border-slate-200/g, replacement: 'border-[var(--border)]' },
  { regex: /border-gray-200/g, replacement: 'border-[var(--border)]' },
  { regex: /border-blue-100/g, replacement: 'border-[var(--primary-light-border)]' },
  { regex: /border-blue-200/g, replacement: 'border-[var(--primary-light-border)]' },
  { regex: /border-border(?!\/|\])/g, replacement: 'border-[var(--border)]' }, // border-border to border-[var(--border)]

  // Text colors
  { regex: /text-slate-300/g, replacement: 'text-[var(--subtle-foreground)]' },
  { regex: /text-slate-400/g, replacement: 'text-[var(--subtle-foreground)]' },
  { regex: /text-slate-500/g, replacement: 'text-[var(--muted-foreground)]' },
  { regex: /text-slate-600/g, replacement: 'text-[var(--secondary-foreground)]' },
  { regex: /text-slate-700/g, replacement: 'text-[var(--secondary-foreground)]' },
  { regex: /text-slate-800/g, replacement: 'text-foreground' },
  { regex: /text-slate-900/g, replacement: 'text-foreground' },
  { regex: /text-gray-900/g, replacement: 'text-foreground' },
  { regex: /text-gray-500/g, replacement: 'text-[var(--muted-foreground)]' },
  { regex: /text-blue-500/g, replacement: 'text-primary' },
  { regex: /text-blue-600/g, replacement: 'text-primary' },
  { regex: /text-black/g, replacement: 'text-foreground' },
  
  // Shadows (Drop colorful shadows and standardize)
  { regex: /shadow-blue-50/g, replacement: '' },
  { regex: /shadow-blue-100/g, replacement: '' },
  { regex: /shadow-blue-200/g, replacement: '' },
  // Optional: mapping standard tailwind shadows to our custom vars if they look better, but typically custom vars are already set up in theme.css for shadow-sm etc. We will leave standard shadow-sm alone for now unless it's strictly required to use var. Actually, let's explicitly use var to ensure it uses the blue-tinted shadows from theme.css
  { regex: /shadow-sm(?!\])/g, replacement: 'shadow-[var(--shadow-sm)]' },
  { regex: /shadow-md(?!\])/g, replacement: 'shadow-[var(--shadow-md)]' },
  { regex: /shadow-lg(?!\])/g, replacement: 'shadow-[var(--shadow-lg)]' },
  { regex: /shadow-xl(?!\])/g, replacement: 'shadow-[var(--shadow-lg)]' }, // cap at lg
  { regex: /shadow-2xl(?!\])/g, replacement: 'shadow-[var(--shadow-lg)]' }, // cap at lg
  
  // Custom hex codes spotted earlier
  { regex: /#316BFF/ig, replacement: 'var(--primary)' },
  { regex: /#2454C8/ig, replacement: 'var(--primary-active-text)' },
  { regex: /#F8FAFC/ig, replacement: 'var(--background)' }
];

let totalChanges = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  replacements.forEach(({ regex, replacement }) => {
    content = content.replace(regex, replacement);
  });
  
  // Clean up multiple spaces that might have been created by removing colorful shadows
  content = content.replace(/ +/g, ' ');
  content = content.replace(/ "/g, '"');
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    totalChanges++;
    console.log(`Updated ${file}`);
  }
});

console.log(`\nCompleted. Modified ${totalChanges} files.`);
