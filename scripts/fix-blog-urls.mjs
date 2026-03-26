import fs from 'fs';
import path from 'path';

const dir = 'C:/Users/joria/CascadeProjects/agensea_website/src/content/blog';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

let changedFiles = 0;

const urlMappings = [
    // Old Zee-Zicht URLs -> New Agensea URLs
    { from: /\]\(\/diensten\/website-laten-maken\/?\)/g, to: '](/diensten/websites)' },
    { from: /\]\(\/diensten\/webshop-laten-maken\/?\)/g, to: '](/diensten/websites)' },
    { from: /\]\(\/diensten\/seo-in-zeeland\/?\)/g, to: '](/diensten/marketing)' },
    { from: /\]\(\/diensten\/online-marketing\/?\)/g, to: '](/diensten/marketing)' },
    { from: /\]\(\/diensten\/boekingssysteem\/?\)/g, to: '](/diensten/software)' },
    { from: /\]\(\/diensten\/maatwerk-applicaties\/?\)/g, to: '](/diensten/software)' },
    { from: /\]\(\/portfolio\/?\)/g, to: '](/#cases)' },
    { from: /\]\(\/demo-ontvangen\/?\)/g, to: '](/contact)' },
    { from: /\]\(\/gratis-website-scan\/?\)/g, to: '](/contact)' },
    { from: /\]\(\/contact\/?\)/g, to: '](/contact)' },
    { from: /\]\(https:\/\/zee-zicht\.nl\//g, to: '](https://agensea.nl/' },
    { from: /\]\(https:\/\/www\.zee-zicht\.nl\//g, to: '](https://agensea.nl/' },
];

for (const file of files) {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    let newContent = content;

    for (const mapping of urlMappings) {
        newContent = newContent.replace(mapping.from, mapping.to);
    }

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf-8');
        changedFiles++;
        console.log(`Updated URLs in: ${file}`);
    }
}

console.log(`\nFinished checking URLs. Updated ${changedFiles} files.`);
