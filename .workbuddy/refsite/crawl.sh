#!/usr/bin/env bash
# 批量抓取原站后台页面结构与资源清单
AB_DIR="/c/Users/ysc02/.workbuddy/binaries/node/ab"
AB="$AB_DIR/node_modules/.bin/agent-browser --session manual"
BASE="/c/Users/ysc02/Desktop/xuanshiai-admin/.workbuddy/refsite"
JS=$(cat "$BASE/extract.js")

while IFS= read -r path; do
  [ -z "$path" ] && continue
  slug=$(echo "$path" | sed 's#^/##; s#/#_#g')
  out="$BASE/pages/$slug.json"
  if [ -s "$out" ]; then echo "SKIP $slug"; continue; fi
  url="https://www.xuanshiai.com$path"
  timeout 60 $AB open "$url" >/dev/null 2>&1
  sleep 2
  timeout 60 $AB eval "$JS" > "$out" 2>&1
  timeout 60 $AB screenshot "$BASE/pages/$slug.png" >/dev/null 2>&1
  echo "OK $slug $(wc -c < "$out")"
done < "$BASE/urls.txt"
echo "CRAWL DONE"
