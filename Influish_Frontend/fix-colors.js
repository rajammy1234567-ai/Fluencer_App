const fs = require('fs');
const path = require('path');

function getAllJsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        getAllJsxFiles(filePath, fileList);
      }
    } else if (file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

const frontendDir = 'c:\\Users\\HP\\Desktop\\influish\\Influish_Frontend';
const jsxFiles = getAllJsxFiles(frontendDir);

let totalReplaced = 0;

jsxFiles.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Replace purple references
    content = content.replace(/COLORS\.purple\[50\]/g, 'COLORS.blue[50]');
    content = content.replace(/COLORS\.purple\[100\]/g, 'COLORS.gray[100]');
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`✓ Fixed: ${path.basename(file)}`);
      totalReplaced++;
    }
  } catch (err) {
    console.error(`Error processing ${file}:`, err.message);
  }
});

console.log(`\n✅ Total files fixed: ${totalReplaced}`);
