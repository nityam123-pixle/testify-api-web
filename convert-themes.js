const fs = require('fs');
const path = require('path');
const { convertTheme } = require('monaco-vscode-textmate-theme-converter');

const themesDir = path.join(__dirname, 'public', 'themes');

const themes = [
  'OneDark-Pro.json',
  'Bearded-Theme.json',
  'Coffee-Theme.json'
];

themes.forEach(themeFile => {
  const inputPath = path.join(themesDir, themeFile);
  const outputPath = path.join(themesDir, themeFile.replace('.json', '.monaco.json'));
  
  if (fs.existsSync(inputPath)) {
    const rawTheme = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    const convertedTheme = convertTheme(rawTheme);
    fs.writeFileSync(outputPath, JSON.stringify(convertedTheme, null, 2));
    console.log(`Converted ${themeFile} -> ${path.basename(outputPath)}`);
  } else {
    console.warn(`File not found: ${inputPath}`);
  }
});
