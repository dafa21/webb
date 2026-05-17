const fs = require('fs');

const file = 'src/components/AmaliyahPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Find the start of Garden
const gardenStart = content.indexOf('  const Garden = () => {');
if (gardenStart === -1) {
    console.error('Garden start not found');
    process.exit(1);
}

// Find the end of Garden (from gardenStart, search for `  };\n` or similar)
let gardenEnd = content.indexOf('\n  };\n\n  const { totalPoints', gardenStart);
if (gardenEnd === -1) {
    console.error('Garden end not found');
    process.exit(1);
}
gardenEnd += '\n  };\n'.length;

const gardenFunc = content.slice(gardenStart, gardenEnd);

// Prepare the new Garden function
let newGardenFunc = gardenFunc.replace('const Garden = () => {', 'const Garden = ({ todayDeeds }: { todayDeeds: Record<string, boolean> }) => {');

// Remove indentation of 2 spaces
newGardenFunc = newGardenFunc.split('\n').map(line => line.startsWith('  ') ? line.slice(2) : line).join('\n');

// Delete it from inside the component
content = content.slice(0, gardenStart) + content.slice(gardenEnd);

// Add it Above export default function AmaliyahPage
const importIdx = content.indexOf('export default function AmaliyahPage() {');
content = content.slice(0, importIdx) + newGardenFunc + '\n' + content.slice(importIdx);

// Update invocation:
content = content.replace(/<Garden \/>/g, '<Garden todayDeeds={todayDeeds} />');

fs.writeFileSync(file, content);
console.log('Successfully extracted Garden');
