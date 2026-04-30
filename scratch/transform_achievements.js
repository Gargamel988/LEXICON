const fs = require('fs');
const path = 'c:/Users/garga/project/Game/constants/achievements.ts';
let file = fs.readFileSync(path, 'utf8');
file = file.replace(/\s*rewardNameTagId:\s*['"].*?['"],/g, '');
fs.writeFileSync(path, file);
console.log('Removed rewardNameTagId from achievements.ts');
