# Database Procedures & Functions

This directory contains extracted stored procedures and functions from the **public** database.

## 📊 Summary

- **Environment:** dev
- **Database:** public
- **Procedures:** 4
- **Functions:** 3
- **Generated:** 2025-09-13T08:55:37.426Z

## 📁 Directory Structure


```
procedures/     # Stored procedures (.sql files)
functions/      # Functions (.sql files)
docs/          # Documentation files
README.md      # This file
```


## 🚀 Usage

### Importing Procedures/Functions

```bash
# Import all procedures
mysql -u username -p database_name < procedures/*.sql

# Import specific procedure
mysql -u username -p database_name < procedures/procedure_name.sql
```

### Calling Procedures

```sql
-- Call a stored procedure
CALL procedure_name(param1, param2);
```

### Using Functions

```sql
-- Use a function in SELECT
SELECT function_name(param1) AS result FROM table_name;
```

## 📚 Documentation

- [📋 Complete Index](docs/index.md)
- [🔧 Stored Procedures](docs/procedures.md)
- [⚙️ Functions](docs/functions.md)

## ⚠️ Important Notes

1. **Auto-Generated**: These files are automatically generated from the database schema
2. **Environment Specific**: Files are extracted from the **dev** environment
3. **Backup Recommended**: Always backup before importing to production
4. **Dependencies**: Some procedures/functions may have dependencies on others

## 🔄 Regeneration

To regenerate these files:

```bash
# Run the database sync workflow
npm run db:sync

# Or run manually
ts-node scripts/db-analyzer/procedure-extractor.ts schema.json
```

---

> 🤖 **Auto-generated** by Enhanced DB Schema Analyzer  
> Last updated: 2025-09-13T08:55:37.426Z
