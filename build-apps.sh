#!/bin/bash

# 빌드 스크립트 - 특정 앱들을 빌드하거나 모든 앱을 빌드
# 사용법: ./build-apps.sh "gateway,board" 또는 ./build-apps.sh

set -e

TARGET_APPS="$1"

echo "🚀 Starting build process..."

if [ -n "$TARGET_APPS" ]; then
    echo "📦 Building specific apps: $TARGET_APPS"
    
    # 쉼표로 구분된 앱 목록을 배열로 변환
    IFS=',' read -ra APPS <<< "$TARGET_APPS"
    
    for app in "${APPS[@]}"; do
        # 공백 제거
        app=$(echo "$app" | xargs)
        echo "🔨 Building $app..."
        
        # 앱이 존재하는지 확인
        if [ ! -d "apps/$app" ]; then
            echo "❌ Error: App '$app' does not exist in apps/ directory"
            exit 1
        fi
        
        # SWC를 사용하여 빌드
        pnpm run build "$app" --builder swc
        
        if [ $? -eq 0 ]; then
            echo "✅ Successfully built $app"
        else
            echo "❌ Failed to build $app"
            exit 1
        fi
    done
else
    echo "📦 Building all applications..."
    
    # 모든 앱 빌드
    pnpm run build:all:swc
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully built all applications"
    else
        echo "❌ Failed to build applications"
        exit 1
    fi
fi

echo "🎉 Build process completed successfully!"

# 빌드 결과 확인
echo ""
echo "📋 Build results:"
if [ -d "dist/apps" ]; then
    ls -la dist/apps/
else
    echo "❌ No build output found in dist/apps/"
    exit 1
fi
