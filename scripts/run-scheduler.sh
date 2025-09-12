#!/bin/bash

# Scheduler 서비스 실행 스크립트
echo "🕒 Scheduler 서비스를 시작합니다..."

# Node.js 버전 확인 및 설정
if command -v nvm >/dev/null 2>&1; then
    echo "📦 Node.js 22 버전 사용 설정..."
    nvm use 22
fi

# Scheduler 서비스 실행
echo "🚀 Scheduler 서비스 실행 중..."
pnpm run start:dev:scheduler
