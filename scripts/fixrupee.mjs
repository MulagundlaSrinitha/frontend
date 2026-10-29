import fs from 'fs'; const p='src/app/(tabs)/index.tsx'; let c=fs.readFileSync(p,'utf8'); c=c.replace(/\u20B9/g,'Rs '); fs.writeFileSync(p,c); console.log('done');
