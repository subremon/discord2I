const fs = require('fs');
const path = require('path');

const functionsDir = path.join(__dirname, ['functions', 'tools', 'moneyger']); // 関数ファイルがあるディレクトリ
const combinedFunctions = [];

// ディレクトリ内のファイルを読み込む
fs.readdir(functionsDir, (err, files) => {
   if (err) throw err;

   files.forEach(file => {
       if (path.extname(file) === '.js') {
           const functionPath = path.join(functionsDir, file);
           const func = require(functionPath);
           combinedFunctions.push(func); // 関数を配列に追加
       }
   });

   // まとめた関数をエクスポートするための新しいモジュールを作成
   const outputPath = path.join(__dirname, 'combinedFunctions.js');
   const content = `
       module.exports = {
           functions: ${JSON.stringify(combinedFunctions.map((f, index) => `function${index + 1}`))}
       };
   `;

   fs.writeFile(outputPath, content, err => {
       if (err) throw err;
       console.log('Functions combined into combinedFunctions.js');
   });
});
