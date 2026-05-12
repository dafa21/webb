const fs = require('fs');

function addTransitions(file) {
  if (!fs.existsSync(file)) return;
  let text = fs.readFileSync(file, 'utf8');

  let modified = false;
  let parts = text.split('<motion.button');
  
  for (let i = 1; i < parts.length; i++) {
    let tagEndIndex = -1;
    let inQuotes = false;
    let quoteChar = null;
    let inBraces = 0;

    for (let j = 0; j < parts[i].length; j++) {
      const char = parts[i][j];
      if (inQuotes) {
        if (char === quoteChar && parts[i][j-1] !== '\\') {
          inQuotes = false;
        }
      } else if (char === '{') {
        inBraces++;
      } else if (char === '}') {
        inBraces--;
      } else if (char === '"' || char === "'" || char === '`') {
        inQuotes = true;
        quoteChar = char;
      } else if (char === '>' && inBraces === 0) {
        tagEndIndex = j;
        break;
      }
    }

    if (tagEndIndex !== -1) {
      let tagProps = parts[i].substring(0, tagEndIndex);
      let rest = parts[i].substring(tagEndIndex);

      let classMatch1 = tagProps.match(/className=(["'])(.*?)\1/s);
      let classMatch2 = tagProps.match(/className=\{`(.*?)`\}/s);
      
      if (classMatch1 || classMatch2) {
         if (!tagProps.includes('transition-all') || !tagProps.includes('duration-300')) {
             if (classMatch1) {
                 tagProps = tagProps.replace(/className=(["'])(.*?)\1/s, (m, p1, p2) => {
                     let classes = p2.split(/[\s\n]+/).filter(Boolean);
                     if (!classes.includes('transition-all')) classes.push('transition-all');
                     if (!classes.includes('duration-300')) classes.push('duration-300');
                     return `className=${p1}${classes.join(' ')}${p1}`;
                 });
             } else if (classMatch2) {
                 tagProps = tagProps.replace(/className=\{`(.*?)`\}/s, (m, p1) => {
                     let classes = p1.split(/[\s\n]+/).filter(Boolean);
                     if (!classes.includes('transition-all')) classes.push('transition-all');
                     if (!classes.includes('duration-300')) classes.push('duration-300');
                     return `className={\`${classes.join(' ')}\`}`;
                 });
             }
             modified = true;
         }
      } else {
        tagProps += ' className="transition-all duration-300"';
        modified = true;
      }
      parts[i] = tagProps + rest;
    }
  }

  if (modified) {
    fs.writeFileSync(file, parts.join('<motion.button'), 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`No changes needed in ${file}`);
  }
}

['src/App.tsx', 'src/components/Chatbot.tsx', 'src/components/ProgramMap.tsx'].forEach(addTransitions);
