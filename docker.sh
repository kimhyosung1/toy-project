#!/bin/bash

# 통합 Docker Compose 관리 스크립트
# 사용법: ./docker.sh [환경] [명령어]

ENV=$1
shift

if [ -z "$ENV" ]; then
    echo "❌ 환경을 지정해주세요: dev, qa, prod"
    echo ""
    echo "사용법:"
    echo "  ./docker.sh dev up -d        # 개발 환경 시작"
    echo "  ./docker.sh dev gateway      # Gateway만 시작"
    echo "  ./docker.sh dev down         # 환경 중지"
    echo "  ./docker.sh dev logs gateway # 로그 확인"
    exit 1
fi

# 환경별 설정 파일
case $ENV in
    "dev")
        ENV_FILE="env/dev.env"
        ;;
    "qa")
        ENV_FILE="env/qa.env"
        ;;
    "prod")
        ENV_FILE="env/prod.env"
        ;;
    *)
        echo "❌ 지원하지 않는 환경: $ENV (dev, qa, prod만 가능)"
        exit 1
        ;;
esac

# 환경 파일 확인
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ 환경 파일을 찾을 수 없습니다: $ENV_FILE"
    exit 1
fi

# 명령어가 없으면 up -d 실행
if [ $# -eq 0 ]; then
    set -- "up" "-d"
fi

# 서비스명만 입력한 경우 up -d 추가
FIRST_ARG=$1
case $FIRST_ARG in
    "up"|"down"|"logs"|"ps"|"exec"|"restart"|"build"|"stop"|"start")
        # docker-compose 명령어는 그대로 실행
        ;;
    *)
        # 서비스명으로 간주하고 up -d 추가
        set -- "up" "-d" "$@"
        ;;
esac

echo "🚀 $ENV 환경 실행 중..."
echo "📁 설정 파일: $ENV_FILE"

# Docker Compose 실행
docker-compose --env-file "$ENV_FILE" "$@"