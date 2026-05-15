const fs = require('fs');

function processFile(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let count = 0;
  
  const result = content.replace(/(<(?:button|motion\.button)[^>]*className=)(["'{`].*?["'}])/g, (match, prefix, classString) => {
    if (classString.includes('active:scale-95')) return match;

    let newClassString = classString;
    
    let isTemplate = false;
    let isString = false;
    if (newClassString.startsWith('{`') && newClassString.endsWith('`}')) {
      isTemplate = true;
      newClassString = newClassString.slice(2, -2);
    } else if (newClassString.startsWith('"') && newClassString.endsWith('"')) {
      isString = true;
      newClassString = newClassString.slice(1, -1);
    } else if (newClassString.startsWith("'") && newClassString.endsWith("'")) {
      isString = true;
      newClassString = newClassString.slice(1, -1);
    } else {
      return match;
    }

    const classesToAdd = " transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95 ";
    newClassString += classesToAdd;
    
    newClassString = newClassString.replace(/\btransition-colors\b/g, '');
    newClassString = newClassString.replace(/\s+/g, ' ').trim();

    count++;
    if (isTemplate) {
      return `${prefix}{\`${newClassString}\`}`;
    } else {
      return `${prefix}"${newClassString}"`;
    }
  });

  if (count > 0) {
    fs.writeFileSync(file, result);
    console.log(`Updated ${count} buttons in ${file}`);
  }
}

const files = ['src/App.tsx', 'src/components/TwibbonModal.tsx', 'src/components/Chatbot.tsx', 'src/components/ProgramMap.tsx'];
files.forEach(file => processFile(file));
console.log('Done!');
