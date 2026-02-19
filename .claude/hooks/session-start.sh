#!/bin/bash

CURRENT_TIME=$(date "+%Y-%m-%d %H:%M")
TEMP=$(curl -s "wttr.in/Kyoto?format=%t" 2>/dev/null || echo "N/A")

IDX=$((RANDOM % 5))

case $IDX in
  0) read -r -d '' ART << 'EOF'
    /\_____/\
   /  o   o  \
  ( ==  ^  == )
   )         (
  (           )
 ( (  )   (  ) )
(__(__)___(__)__)
EOF
  ;;
  1) read -r -d '' ART << 'EOF'
  |\_/|
  | @ @   Woof!
  |   <>
  |  _/\------____
  |               `\
  |       |       |
 /_)      |      (_\
EOF
  ;;
  2) read -r -d '' ART << 'EOF'
      __
    _( oo)_
   '_ `  _ )
   (/ `--' \)
    \|    |/
     |    |
     m    m
EOF
  ;;
  3) read -r -d '' ART << 'EOF'
   *    .  *    .
  .  *    .   *
     .  *   .
  *    .  *    .
   .     *   .
EOF
  ;;
  4) read -r -d '' ART << 'EOF'
  .--.
 |o_o |
 |:_/ |
//   \ \
(|     | )
/'\_   _/`\
\___)=(___/
EOF
  ;;
esac

MESSAGE="${ART}
  ${CURRENT_TIME}  |  Kyoto ${TEMP}"

JSON_MESSAGE=$(echo "$MESSAGE" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | awk '{printf "%s\\n", $0}' | sed 's/\\n$//')

cat <<EOF
{
  "systemMessage": "${JSON_MESSAGE}"
}
EOF

exit 0
