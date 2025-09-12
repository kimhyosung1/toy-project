# 멀티스테이지 빌드를 위한 Dockerfile
FROM node:22-alpine AS deps

WORKDIR /app

# pnpm 설치 및 설정 (버전 8로 고정)
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@8.15.6 --activate

# 패키지 파일들 복사
COPY package.json pnpm-lock.yaml ./

# 의존성 설치 (캐시 최적화)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# 빌드 스테이지
FROM node:22-alpine AS builder

WORKDIR /app

# pnpm 설치 (버전 8로 고정)
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@8.15.6 --activate

# 의존성 복사
COPY --from=deps /app/node_modules ./node_modules

# 소스 코드 복사
COPY . .

# 빌드 실행 (SWC 사용)
ARG TARGET_APPS
RUN if [ -n "$TARGET_APPS" ]; then \
        for app in $(echo $TARGET_APPS | tr ',' ' '); do \
            echo "Building $app..."; \
            pnpm run build $app --builder swc; \
        done; \
    else \
        echo "Building all apps..."; \
        pnpm run build:all:swc; \
    fi

# 프로덕션 스테이지
FROM node:22-alpine AS app

WORKDIR /app

ARG NODE_ENV=dev
ENV NODE_ENV=${NODE_ENV}

# 빌드된 애플리케이션 복사
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules

# 패키지 파일 복사 (런타임에 필요)
COPY package.json ./

# 기본 포트 노출 (gateway)
EXPOSE 3000

# 기본 실행 명령어 (gateway)
CMD ["node", "dist/apps/gateway/main.js"]
