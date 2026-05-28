const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Find start and end of dampak section
const startDampakStr = "{/* Visualisasi Dampak: Jangkauan & Efektivitas */}";
const endDampakStr = "</section>\n\n      {/* Program Yang Sedang Berlangsung */}";

const startIdx = content.indexOf(startDampakStr);
const endIdx = content.indexOf(endDampakStr);

if (startIdx !== -1 && endIdx !== -1) {
    const dampakSection = content.substring(startIdx, endIdx + 11); // +11 to include </section>\n\n
    // Remove it from current position
    content = content.substring(0, startIdx) + content.substring(endIdx + 11);
    
    // Find where to insert it: right after <div id="beranda"> ends.
    const insertSubStr = "</div>\n      </div>\n\n      {/* Kategori Program Sedekah */}";
    const insertIdx = content.indexOf(insertSubStr);
    
    if (insertIdx !== -1) {
        content = content.substring(0, insertIdx + 17) + "\n      " + dampakSection + "\n" + content.substring(insertIdx + 17);
        fs.writeFileSync('src/App.tsx', content);
        console.log("Successfully moved the block");
    } else {
        console.log("Could not find insert position");
    }
} else {
    console.log("Could not find start/end limits");
}
