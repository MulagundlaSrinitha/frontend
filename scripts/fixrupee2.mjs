import fs from 'fs'; const p='src/app/(tabs)/index.tsx'; let c=fs.readFileSync(p,'utf8'); c=c.replace(/[\u20B9\u00A0]/g,' '); fs.writeFileSync(p,c);
