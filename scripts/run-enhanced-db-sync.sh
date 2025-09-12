#!/bin/bash

# 🚀 Enhanced Database Sync Runner
# 
# DB 스키마를 분석해서 TypeORM Entity와 Repository를 자동 생성합니다.
#
# 사용법: ./run-enhanced-db-sync.sh [environment] [options]
# 예시: ./run-enhanced-db-sync.sh dev --dry-run
#
# 환경: dev, qa, prod (기본값: dev)
# 옵션: --dry-run, --overwrite, --skip-entities, --skip-repositories, --skip-procedures

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🚀 Enhanced Database Sync Runner${NC}"
echo -e "${CYAN}==================================${NC}"

# 기본 설정
ENVIRONMENT=${1:-dev}
OUTPUT_DIR="libs/database/src"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_ANALYZER_DIR="$SCRIPT_DIR/db-analyzer"

# 환경 검증
if [[ ! "$ENVIRONMENT" =~ ^(dev|qa|prod)$ ]]; then
    echo -e "${RED}❌ 잘못된 환경: $ENVIRONMENT${NC}"
    echo -e "${YELLOW}사용 가능한 환경: dev, qa, prod${NC}"
    exit 1
fi

echo -e "${BLUE}🌍 환경: $ENVIRONMENT${NC}"
echo -e "${BLUE}📁 출력 디렉토리: $OUTPUT_DIR${NC}"

# 필수 도구 확인
echo -e "\n${YELLOW}🔍 필수 도구 확인 중...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js가 설치되지 않았습니다${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"

if ! command -v ts-node &> /dev/null; then
    echo -e "${YELLOW}⚠️ ts-node 설치 중...${NC}"
    npm install -g ts-node typescript
fi
echo -e "${GREEN}✅ TypeScript: $(tsc --version)${NC}"

# 환경 파일 로드
echo -e "\n${YELLOW}🔧 환경 설정 로드 중...${NC}"

ENV_FILE="env/${ENVIRONMENT}.env"
if [[ -f "$ENV_FILE" ]]; then
    echo -e "${GREEN}✅ 환경 파일 로드: $ENV_FILE${NC}"
    
    # .env 파일 로드
    set -a
    source "$ENV_FILE"
    set +a
    
    # DB 설정 매핑
    DB_HOST=${DB_HOST:-localhost}
    DB_PORT=${DB_PORT:-3306}
    DB_USER=${DB_USERNAME:-root}
    DB_PASSWORD=${DB_PASSWORD:-}
    DB_NAME=${DB_DATABASE:-test}
else
    echo -e "${RED}❌ 환경 파일을 찾을 수 없습니다: $ENV_FILE${NC}"
    exit 1
fi

# DB 연결 정보 확인
if [[ -z "$DB_HOST" || -z "$DB_USER" || -z "$DB_NAME" ]]; then
    echo -e "${RED}❌ 필수 DB 연결 정보가 없습니다${NC}"
    echo -e "${YELLOW}필요한 정보: DB_HOST, DB_USERNAME, DB_DATABASE${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 데이터베이스: $DB_NAME@$DB_HOST:${DB_PORT}${NC}"

# 환경 변수 export
export DB_HOST DB_PORT DB_USER DB_PASSWORD DB_NAME

# 의존성 설치
echo -e "\n${YELLOW}📦 의존성 설치 중...${NC}"
cd "$DB_ANALYZER_DIR"

if [[ ! -f "package.json" ]]; then
    echo -e "${RED}❌ package.json을 찾을 수 없습니다: $DB_ANALYZER_DIR${NC}"
    exit 1
fi

npm install --silent

# Enhanced DB Sync 실행
echo -e "\n${PURPLE}🚀 데이터베이스 동기화 시작...${NC}"

# CLI 인자 전달
SYNC_ARGS="$ENVIRONMENT $OUTPUT_DIR"
shift

# 나머지 옵션들 추가
for arg in "$@"; do
    SYNC_ARGS="$SYNC_ARGS $arg"
done

echo -e "${CYAN}📋 실행 명령: ts-node enhanced-db-sync.ts $SYNC_ARGS${NC}"

# 실행
if ts-node enhanced-db-sync.ts $SYNC_ARGS; then
    echo -e "\n${GREEN}🎉 데이터베이스 동기화 완료!${NC}"
    
    # 생성된 파일 개수 표시
    echo -e "\n${CYAN}📁 생성된 파일:${NC}"
    for dir in entities repositories procedures; do
        if [[ -d "$OUTPUT_DIR/$dir" ]]; then
            file_count=$(find "$OUTPUT_DIR/$dir" -type f -name "*.ts" -o -name "*.sql" -o -name "*.md" | wc -l)
            if [[ $file_count -gt 0 ]]; then
                echo -e "${GREEN}   $dir/: $file_count 개${NC}"
            fi
        fi
    done
    
    echo -e "\n${GREEN}✨ 완료! 데이터베이스 스키마가 동기화되었습니다.${NC}"
    exit 0
    
else
    echo -e "\n${RED}💥 데이터베이스 동기화 실패!${NC}"
    echo -e "\n${RED}❌ 위의 에러 메시지를 확인하고 다시 시도해주세요.${NC}"
    exit 1
fi
