#!/bin/bash
# analyze-bundle.sh - Analyze bundle size and identify large files

echo "🔍 ANALYZING BUNDLE SIZE..."
echo "================================"

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Total sizes
echo -e "\n${BLUE}📊 TOTAL SIZES:${NC}"
echo "dist directory:"
du -sh dist/ 2>/dev/null | awk '{print "  Total: " $1}'

echo -e "\nServer bundle:"
du -sh dist/server/ 2>/dev/null | awk '{print "  Size: " $1}'
du -sh dist/server/server.js 2>/dev/null | awk '{print "  server.js: " $1}'

echo -e "\nClient bundle:"
du -sh dist/client/ 2>/dev/null | awk '{print "  Size: " $1}'

# Step 2: Largest files
echo -e "\n${BLUE}📦 LARGEST FILES (Top 10):${NC}"
find dist -type f -size +100k | sort -k1 -hr | head -10 | while read file; do
  size=$(du -h "$file" | cut -f1)
  echo "  $size  $file"
done

# Step 3: File counts
echo -e "\n${BLUE}📁 FILE COUNTS:${NC}"
echo "  Total JS files: $(find dist -name '*.js' | wc -l)"
echo "  Total CSS files: $(find dist -name '*.css' | wc -l)"
echo "  Total HTML files: $(find dist -name '*.html' | wc -l)"
echo "  Total assets: $(find dist/client/assets -type f 2>/dev/null | wc -l)"

# Step 4: Check if over 2GB
echo -e "\n${BLUE}⚠️  VERCEL LIMITS CHECK:${NC}"
DIST_SIZE=$(du -sb dist/server/server.js 2>/dev/null | cut -f1)
LIMIT=$((2048 * 1024 * 1024))

if [ "$DIST_SIZE" -gt "$LIMIT" ]; then
  OVER=$((($DIST_SIZE - $LIMIT) / 1024 / 1024))
  echo -e "${RED}❌ OVER LIMIT by ${OVER}MB${NC}"
  echo "   Current: $(numfmt --to=iec-i --suffix=B $DIST_SIZE 2>/dev/null || echo $((DIST_SIZE/1024/1024))MB)"
  echo "   Limit:   2GB"
  echo "   Action:  Run optimizations or upgrade to Pro"
else
  SIZE_MB=$((DIST_SIZE / 1024 / 1024))
  REMAINING=$((($LIMIT - $DIST_SIZE) / 1024 / 1024))
  echo -e "${GREEN}✅ Within limit (${SIZE_MB}MB / 2048MB)${NC}"
  echo "   Remaining: ${REMAINING}MB"
fi

# Step 5: Dependencies breakdown
echo -e "\n${BLUE}📚 DEPENDENCIES BREAKDOWN:${NC}"
echo "  Node modules size:"
du -sh node_modules/ 2>/dev/null | awk '{print "    " $1}'

# Check for heavy deps
echo -e "\n${BLUE}⚠️  POTENTIALLY HEAVY PACKAGES:${NC}"
for pkg in recharts @radix-ui tailwindcss react react-dom; do
  size=$(du -sh node_modules/$pkg 2>/dev/null | awk '{print $1}')
  if [ ! -z "$size" ]; then
    echo "  $pkg: $size"
  fi
done

# Step 6: Recommendations
echo -e "\n${BLUE}💡 RECOMMENDATIONS:${NC}"

if [ "$DIST_SIZE" -gt "$LIMIT" ]; then
  echo -e "${YELLOW}1. Enable minification in vite.config.ts${NC}"
  echo -e "${YELLOW}2. Disable source maps (sourcemap: false)${NC}"
  echo -e "${YELLOW}3. Remove unused dependencies${NC}"
  echo -e "${YELLOW}4. Split large chunks${NC}"
  echo -e "${YELLOW}5. Or upgrade to Vercel Pro ($20/month)${NC}"
  echo -e "${YELLOW}6. Or deploy to Cloudflare (free, no limits)${NC}"
else
  echo -e "${GREEN}✅ Bundle size is good!${NC}"
  echo "   You should be able to deploy to Vercel Hobby plan."
fi

echo -e "\n================================"
echo "✅ Analysis complete"
