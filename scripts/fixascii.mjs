import fs from 'fs'; const p='src/app/(tabs)/index.tsx'; let c=fs.readFileSync(p,'utf8'); c=c.replace(/[^\\x00-\\x7F]/g,' '); fs.writeFileSync(p,c);
