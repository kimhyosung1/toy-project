#!/bin/bash

# 🚀 DB Schema Analysis & Entity Generation Script
# Usage: ./run-analysis.sh [environment] [force]
# Example: ./run-analysis.sh dev true

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-"dev"}
FORCE_UPDATE=${2:-"false"}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo -e "${BLUE}🚀 Starting DB Schema Analysis & Entity Generation${NC}"
echo -e "${YELLOW}Environment: $ENVIRONMENT${NC}"
echo -e "${YELLOW}Force Update: $FORCE_UPDATE${NC}"
echo -e "${YELLOW}Project Root: $PROJECT_ROOT${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

if ! command_exists node; then
    print_error "Node.js is not installed"
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed"
    exit 1
fi

if ! command_exists ts-node; then
    print_info "Installing ts-node globally..."
    npm install -g ts-node typescript
fi

print_status "Prerequisites check completed"

# Load environment variables
ENV_FILE="$PROJECT_ROOT/env/${ENVIRONMENT}.env"
if [ -f "$ENV_FILE" ]; then
    print_info "Loading environment variables from $ENV_FILE"
    export $(cat "$ENV_FILE" | xargs)
else
    print_error "Environment file not found: $ENV_FILE"
    exit 1
fi

# Create necessary directories
mkdir -p "$PROJECT_ROOT/temp"
mkdir -p "$PROJECT_ROOT/libs/database/src/entities"
mkdir -p "$PROJECT_ROOT/libs/database/src/procedures"
mkdir -p "$SCRIPT_DIR/previous-schemas"

print_status "Directory structure prepared"

# Change to script directory
cd "$SCRIPT_DIR"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_info "Installing dependencies..."
    npm install
fi

# Step 1: Analyze database schema
echo -e "${BLUE}📊 Step 1: Analyzing database schema...${NC}"
if ts-node schema-analyzer.ts; then
    print_status "Database schema analysis completed"
else
    print_error "Database schema analysis failed"
    exit 1
fi

# Check if schema file was created
SCHEMA_FILE="$PROJECT_ROOT/temp/db-schema.json"
if [ ! -f "$SCHEMA_FILE" ]; then
    print_error "Schema file was not created: $SCHEMA_FILE"
    exit 1
fi

# Extract statistics
TABLES_COUNT=$(jq '.tables | length' "$SCHEMA_FILE")
PROCEDURES_COUNT=$(jq '.procedures | length' "$SCHEMA_FILE")
DB_VERSION=$(jq -r '.database.version' "$SCHEMA_FILE")

print_info "Found $TABLES_COUNT tables and $PROCEDURES_COUNT procedures"
print_info "Database version: $DB_VERSION"

# Step 2: Check for changes (if not force update)
SCHEMA_CHANGED="true"
PREVIOUS_SCHEMA="$SCRIPT_DIR/previous-schemas/${ENVIRONMENT}-schema.json"

if [ "$FORCE_UPDATE" != "true" ] && [ -f "$PREVIOUS_SCHEMA" ]; then
    echo -e "${BLUE}🔍 Step 2: Checking for schema changes...${NC}"
    
    if cmp -s "$SCHEMA_FILE" "$PREVIOUS_SCHEMA"; then
        SCHEMA_CHANGED="false"
        print_info "No schema changes detected"
    else
        print_info "Schema changes detected"
    fi
else
    print_info "Skipping change detection (force update or first run)"
fi

# Step 3: Generate entities (if needed)
if [ "$SCHEMA_CHANGED" = "true" ]; then
    echo -e "${BLUE}🏗️ Step 3: Generating TypeORM entities...${NC}"
    
    # Backup existing entities if not force update
    if [ "$FORCE_UPDATE" != "true" ] && [ -d "$PROJECT_ROOT/libs/database/src/entities" ]; then
        print_info "Backing up existing entities..."
        cp -r "$PROJECT_ROOT/libs/database/src/entities" "$PROJECT_ROOT/temp/entities-backup-$(date +%Y%m%d_%H%M%S)"
    fi
    
    if ts-node entity-generator.ts "$SCHEMA_FILE" "$PROJECT_ROOT/libs/database/src/entities"; then
        print_status "Entity generation completed"
    else
        print_error "Entity generation failed"
        exit 1
    fi
    
    # Step 4: Generate SP repositories
    if [ "$PROCEDURES_COUNT" -gt 0 ]; then
        echo -e "${BLUE}📦 Step 4: Generating SP repositories...${NC}"
        
        if ts-node sp-repository-generator.ts "$SCHEMA_FILE" "$PROJECT_ROOT/libs/database/src/procedures"; then
            print_status "SP repository generation completed"
        else
            print_error "SP repository generation failed"
            exit 1
        fi
    else
        print_info "No stored procedures found, skipping SP repository generation"
    fi
    
    # Step 5: Validate generated code
    echo -e "${BLUE}🧪 Step 5: Validating generated code...${NC}"
    
    cd "$PROJECT_ROOT"
    
    # TypeScript compilation check
    if npx tsc --noEmit --project libs/database/tsconfig.lib.json; then
        print_status "TypeScript validation passed"
    else
        print_error "TypeScript validation failed"
        exit 1
    fi
    
    # ESLint check (if available)
    if command_exists eslint; then
        print_info "Running ESLint..."
        npx eslint libs/database/src --ext .ts --fix || print_info "ESLint completed with warnings"
    fi
    
    cd "$SCRIPT_DIR"
    
    # Step 6: Update previous schema
    echo -e "${BLUE}💾 Step 6: Updating schema reference...${NC}"
    cp "$SCHEMA_FILE" "$PREVIOUS_SCHEMA"
    print_status "Schema reference updated"
    
else
    print_info "No changes detected, skipping generation steps"
fi

# Step 7: Generate summary report
echo -e "${BLUE}📋 Step 7: Generating summary report...${NC}"

SUMMARY_FILE="$PROJECT_ROOT/temp/analysis-summary-$(date +%Y%m%d_%H%M%S).md"

cat << EOF > "$SUMMARY_FILE"
# 📊 Database Schema Analysis Summary

**Generated at:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Environment:** $ENVIRONMENT
**Schema Changed:** $SCHEMA_CHANGED
**Force Update:** $FORCE_UPDATE

## 📈 Statistics

- **Database Version:** $DB_VERSION
- **Tables:** $TABLES_COUNT
- **Stored Procedures:** $PROCEDURES_COUNT

## 📁 Generated Files

### Entities
\`\`\`
$(find "$PROJECT_ROOT/libs/database/src/entities" -name "*.ts" -type f | sort | sed "s|$PROJECT_ROOT/||")
\`\`\`

### SP Repositories
\`\`\`
$(find "$PROJECT_ROOT/libs/database/src/procedures" -name "*.ts" -type f 2>/dev/null | sort | sed "s|$PROJECT_ROOT/||" || echo "No SP repositories generated")
\`\`\`

## 🔗 Database Connection Info

- **Host:** $DB_HOST
- **Port:** $DB_PORT
- **Database:** $DB_NAME
- **User:** $DB_USER

---
*Auto-generated by DB Schema Analyzer*
EOF

print_status "Summary report generated: $SUMMARY_FILE"

# Final success message
echo -e "${GREEN}"
echo "🎉 Database Schema Analysis & Entity Generation Completed Successfully!"
echo ""
echo "📊 Summary:"
echo "  - Environment: $ENVIRONMENT"
echo "  - Tables: $TABLES_COUNT"
echo "  - Procedures: $PROCEDURES_COUNT"
echo "  - Schema Changed: $SCHEMA_CHANGED"
echo ""
echo "📁 Generated Files:"
echo "  - Entities: libs/database/src/entities/"
if [ "$PROCEDURES_COUNT" -gt 0 ]; then
echo "  - SP Repositories: libs/database/src/procedures/"
fi
echo "  - Summary: $SUMMARY_FILE"
echo -e "${NC}"

# Optional: Auto-commit changes (if in git repository)
if [ -d "$PROJECT_ROOT/.git" ] && [ "$SCHEMA_CHANGED" = "true" ]; then
    echo -e "${BLUE}📝 Auto-committing changes...${NC}"
    
    cd "$PROJECT_ROOT"
    
    git add libs/database/src/entities/ || true
    git add libs/database/src/procedures/ || true
    git add scripts/db-analyzer/previous-schemas/ || true
    
    if ! git diff --staged --quiet; then
        COMMIT_MSG="🤖 Auto-generated entities from $ENVIRONMENT DB schema

- Generated $TABLES_COUNT entities
- Generated $PROCEDURES_COUNT SP repositories  
- Updated from $ENVIRONMENT environment
- Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

[skip ci]"
        
        git commit -m "$COMMIT_MSG"
        print_status "Changes committed successfully"
        
        # Optionally push (uncomment if needed)
        # git push && print_status "Changes pushed to remote repository"
    else
        print_info "No changes to commit"
    fi
fi

exit 0
