#!/bin/bash

# Скрипт для диагностики проблем с Composer автозагрузкой

echo "=== Composer Autoload Diagnostic ==="
echo

# Проверяем наличие файлов
echo "1. Checking files existence:"
echo -n "   composer.json: "
[ -f "backend/composer.json" ] && echo "✅ EXISTS" || echo "❌ MISSING"

echo -n "   composer.lock: "
[ -f "backend/composer.lock" ] && echo "✅ EXISTS" || echo "❌ MISSING"

echo -n "   vendor/autoload.php: "
[ -f "backend/vendor/autoload.php" ] && echo "✅ EXISTS" || echo "❌ MISSING"

echo -n "   vendor/composer/autoload_classmap.php: "
[ -f "backend/vendor/composer/autoload_classmap.php" ] && echo "✅ EXISTS" || echo "❌ MISSING"

echo

# Проверяем права доступа
echo "2. Checking permissions:"
echo -n "   backend/ directory: "
[ -r "backend/" ] && [ -w "backend/" ] && echo "✅ RW" || echo "❌ NO ACCESS"

echo -n "   vendor/ directory: "
[ -r "backend/vendor/" ] && [ -w "backend/vendor/" ] && echo "✅ RW" || echo "❌ NO ACCESS"

echo

# Проверяем размеры файлов
echo "3. Checking file sizes:"
if [ -f "backend/vendor/autoload.php" ]; then
    size=$(stat -c%s "backend/vendor/autoload.php" 2>/dev/null || echo "0")
    echo "   autoload.php: ${size} bytes"
    [ "$size" -gt 100 ] && echo "   ✅ Size OK" || echo "   ❌ File too small"
else
    echo "   autoload.php: ❌ MISSING"
fi

echo

# Проверяем timestamps
echo "4. Checking timestamps:"
if [ -f "backend/composer.json" ] && [ -f "backend/vendor/autoload.php" ]; then
    if [ "backend/composer.json" -nt "backend/vendor/autoload.php" ]; then
        echo "   ⚠️  composer.json is newer than autoload.php"
        echo "   → Run 'composer dump-autoload'"
    else
        echo "   ✅ Autoload is up to date"
    fi
fi

echo

# Проверяем содержимое composer.json
echo "5. Checking composer.json content:"
if [ -f "backend/composer.json" ]; then
    echo "   PSR-4 autoload entries:"
    grep -A 10 '"autoload"' backend/composer.json | grep -A 5 '"psr-4"' || echo "   ❌ No PSR-4 autoload found"
else
    echo "   ❌ composer.json not found"
fi

echo
echo "=== End Diagnostic ==="
