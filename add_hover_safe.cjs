const fs = require('fs');

function processFile(file) {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  let result = '';
  let i = 0;

  const classesToAdd = " transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95 ";

  while (i < content.length) {
    // Check for <button or <motion.button
    const strFromI = content.slice(i);
    const isButton = strFromI.startsWith('<button') && (strFromI[7] === ' ' || strFromI[7] === '\\n' || strFromI[7] === '>');
    const isMotionButton = strFromI.startsWith('<motion.button') && (strFromI[14] === ' ' || strFromI[14] === '\\n' || strFromI[14] === '>');
    
    if (isButton || isMotionButton) {
      const tagLen = isButton ? 7 : 14;
      let startIdx = i;
      let j = i + tagLen;
      let braceDepth = 0;
      let inString = null;

      while (j < content.length) {
        const char = content[j];
        if (inString) {
          if (char === inString) {
             inString = null;
          }
        } else {
          if (char === '"' || char === "'") { // we ignore backticks here for simplicity or add it
             inString = char;
          } else if (char === '{') {
             braceDepth++;
          } else if (char === '}') {
             braceDepth--;
          } else if (char === '>' && braceDepth === 0) {
             // Found the end of the tag!
             break;
          }
        }
        j++;
      }

      const tagStartToClose = content.slice(startIdx, j + 1); // includes > at end
      if (!tagStartToClose.includes('active:scale-95')) {
        // We need to inject or modify className
        let newTag = tagStartToClose;

        // Try replacing existing className="..."
        // only replace the first occurrence of className="..."
        let replaced = false;
        newTag = newTag.replace(/className=(['"])(.*?)\1/, (match, quote, clsString) => {
            replaced = true;
            let newClsString = clsString + classesToAdd;
            newClsString = newClsString.replace(/\\btransition-colors\\b/g, '');
            newClsString = newClsString.replace(/\\s+/g, ' ').trim();
            return `className=${quote}${newClsString}${quote}`;
        });

        if (!replaced) {
            // Try replacing className={`...`}
            newTag = newTag.replace(/className=\\{\`([\s\S]*?)\`\\}/, (match, clsString) => {
                replaced = true;
                let newClsString = clsString + classesToAdd;
                newClsString = newClsString.replace(/\\btransition-colors\\b/g, '');
                newClsString = newClsString.replace(/\\s+/g, ' ').trim();
                return `className={\`${newClsString}\`}`;
            });
        }

        if (!replaced) {
             // Didn't find className, so add it
             newTag = newTag.slice(0, -1) + ` className="${classesToAdd.trim()}">`;
        }
        
        result += newTag;
        i = j + 1;
        continue;
      }
    }

    result += content[i];
    i++;
  }

  if (result !== content) {
    fs.writeFileSync(file, result, 'utf8');
    console.log('Processed ' + file);
  }
}

const files = ['src/App.tsx', 'src/components/TwibbonModal.tsx', 'src/components/Chatbot.tsx', 'src/components/ProgramMap.tsx'];
for(let f of files) {
  processFile(f);
}
console.log('Done!');
