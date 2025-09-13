# Database Procedures & Functions

> 🤖 Auto-generated documentation  
> Environment: dev  
> Database: public  
> Generated: 2025-09-12T23:52:10.984Z

## 📊 Overview

| Type | Count | Files |
|------|-------|-------|
| Stored Procedures | 3 | [procedures.md](./procedures.md) |
| Functions | 2 | [functions.md](./functions.md) |

## 📁 File Structure

```
/Users/hyosungpi/Documents/toy-project/libs/database/src/procedures/
├── procedures/          # Stored procedure SQL files
├── functions/           # Function SQL files
├── docs/
│   ├── index.md         # This file
│   ├── procedures.md    # Procedures documentation
│   └── functions.md     # Functions documentation
└── README.md            # Usage guide
```

## 🚀 Quick Start

### Running Procedures
```sql
-- Example procedure call
CALL procedure_name(param1, param2);
```

### Using Functions
```sql
-- Example function usage
SELECT function_name(param1, param2) AS result;
```

## 📋 All Items

### Stored Procedures
1. [`generate_keywords`](../procedures/generate_keywords.sql) - No description
2. [`sp_hello_world1`](../procedures/sp_hello_world1.sql) - No description
3. [`sp_hello_world2`](../procedures/sp_hello_world2.sql) - No description

### Functions
1. [`fn_hello_world1`](../functions/fn_hello_world1.sql) - No description
2. [`fn_hello_world2`](../functions/fn_hello_world2.sql) - No description

## 🔄 Auto-Generation

This documentation is automatically generated from the database schema. 
To regenerate:

```bash
npm run db:sync
```

Last updated: 2025-09-12T23:52:10.984Z
