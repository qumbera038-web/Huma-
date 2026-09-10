#!/bin/bash
OUTPUT="haider_sanitary_full_code.txt"
echo "HAIDER SANITARY POS SYSTEM - FULL SOURCE CODE BUNDLE" > $OUTPUT
echo "Generated on: $(date)" >> $OUTPUT
echo "====================================================" >> $OUTPUT

find src -maxdepth 10 -not -path '*/.*' -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.css" -o -name "*.js" -o -name "*.jsx" \) | while read file; do
    echo "" >> $OUTPUT
    echo "FILE: $file" >> $OUTPUT
    echo "----------------------------------------------------" >> $OUTPUT
    cat "$file" >> $OUTPUT
    echo "" >> $OUTPUT
    echo "====================================================" >> $OUTPUT
done

# Move to public folder
mkdir -p public
mv $OUTPUT public/$OUTPUT

# Create Source TAR
echo "Creating source tarball..."
tar --exclude="node_modules" --exclude="dist" --exclude=".aistudio" -czvf public/haider_sanitary_pos_source.tar.gz src package.json tsconfig.json public index.html vite.config.ts server.ts .env.example vercel.json netlify.toml metadata.json *.md

# Create Master Bundle (APK + Source + Docs)
echo "Creating master bundle..."
tar -czvf public/haider_sanitary_master_bundle.tar.gz public/haider_sanitary_pos.apk public/haider_sanitary_pos_source.tar.gz public/haider_sanitary_complete_documentation.pdf public/haider_sanitary_pos_single_file.html

echo "Code bundled into public/$OUTPUT and public/haider_sanitary_pos_source.tar.gz"
