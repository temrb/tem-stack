# Prisma Migration Operations Runbook

This runbook provides operational guidance for managing Prisma database migrations in production. It covers normal operations, troubleshooting, incident response, and best practices.

## Table of Contents

- [Overview](#overview)
- [Workflows](#workflows)
- [Normal Operations](#normal-operations)
- [Incident Response](#incident-response)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [GitHub Environment Setup](#github-environment-setup)

---

## Overview

### Migration Architecture

This project uses a robust CI/CD pipeline for database migrations with the following components:

- **Validation Workflow** (`prisma-ci.yml` - validate job): Tests migrations on PRs
- **Deployment Workflow** (`prisma-ci.yml` - deploy job): Deploys migrations to production
- **Drift Detection Workflow** (`prisma-drift-detection.yml`): Detects schema drift
- **Rollback Workflow** (`prisma-rollback.yml`): Handles migration rollbacks

### Key Principles

1. **Separation of Concerns**: Validation (ephemeral DB) vs. Deployment (production DB)
2. **Manual Approval**: All production deployments require manual approval
3. **Destructive Operation Detection**: Automatic scanning for dangerous SQL
4. **Post-Deployment Verification**: Automated health checks after deployment
5. **Drift Detection**: Periodic checks for manual schema changes

---

## Workflows

### 1. Validation Workflow (PR Checks)

**Trigger**: Automatically on pull requests that modify migrations or schema files

**What it does**:

1. Creates ephemeral PostgreSQL database
2. Applies migrations from `main` branch (baseline)
3. Applies migrations from PR branch (validation)
4. Posts PR comment with migration summary
5. Detects destructive operations and warns

**When to manually trigger**:

- Re-validate after making changes to a PR
- Test migrations before merging

**How to manually trigger**:

```bash
# Via GitHub UI
Actions → Prisma CI/CD → Run workflow
- Select: validate
- Choose schema: site (or both)
```

---

### 2. Deployment Workflow (Production)

**Trigger**: Automatically when migrations are merged to `main` branch

**What it does**:

1. Checks migration status in production
2. Shows SQL preview of pending migrations
3. Detects destructive operations
4. **Pauses for manual approval** (GitHub Environment protection)
5. Deploys migrations to production
6. Verifies critical tables and indexes exist

**Manual Approval Process**:

1. Workflow runs and pauses at "Deploy migrations" step
2. GitHub sends notification to required reviewers
3. Reviewer checks:
    - SQL preview in workflow logs
    - Destructive operation warnings (if any)
    - Impact assessment
    - Backup verification
4. Reviewer approves or rejects in GitHub UI
5. If approved, deployment proceeds

**When to manually trigger**:

- Re-deploy migrations after a rollback
- Deploy migrations without merging to main (emergency)

**How to manually trigger**:

```bash
# Via GitHub UI
Actions → Prisma CI/CD → Run workflow
- Select: deploy
- Choose schema: site (or both)
- Branch: main (must be main branch)
```

---

### 3. Drift Detection Workflow

**Trigger**: Manual trigger only

**What it does**:

1. Connects to production database (read-only)
2. Introspects actual schema using `prisma db pull`
3. Compares against committed schema using `prisma migrate diff`
4. Creates GitHub issue if drift detected

**When to run**:

- After discovering unexpected migration failures
- During incident investigation
- Periodic health checks (recommended: weekly)
- After suspecting manual database changes

**How to trigger**:

```bash
# Via GitHub UI
Actions → Prisma Drift Detection → Run workflow
- Choose schema: site (or both)
```

**If drift is detected**:

1. Review the created GitHub issue for SQL diff
2. Investigate how/when the drift occurred
3. Choose resolution strategy (see [Incident Response](#drift-detected-in-production))

---

### 4. Rollback Workflow

**Trigger**: Manual trigger only (emergency use)

**What it does**:

1. Shows migration history and current status
2. Validates rollback target exists
3. Displays migration SQL for review
4. Marks migration as "rolled back" in tracking table
5. Creates incident report issue

**When to use**:

- Migration was deployed but caused production issues
- Need to mark migration as rolled back to allow re-deployment
- Migration failed and needs to be re-attempted

**How to trigger**:

```bash
# Via GitHub UI
Actions → Prisma Migration Rollback → Run workflow
- Schema: site
- Migration name: 20240101000000_example
- Rollback type: mark-rolled-back
- Confirm backup: ✓ (MUST check)
```

**⚠️ IMPORTANT**: This does NOT automatically revert schema changes. See [Rollback Procedures](#migration-rollback) for full process.

---

## Normal Operations

### Creating a New Migration

**Local Development**:

```bash
# 1. Modify the Prisma schema
vim src/prisma/site/schema/schema.prisma

# 2. Create migration
npm run db:migrate:dev
# This will:
# - Generate migration SQL
# - Apply to local database
# - Generate Prisma client

# 3. Review generated migration
cat src/prisma/site/migrations/[timestamp]_[name]/migration.sql

# 4. Test locally
npm run dev

# 5. Commit migration files
git add src/prisma/site/migrations/
git add src/prisma/site/schema/
git commit -m "feat(db): add user preferences table"
git push
```

**PR and Validation**:

1. Create pull request
2. Wait for validation workflow to complete
3. Review PR comment with migration summary
4. If destructive operations detected, extra review required
5. Request code review from team

**Production Deployment**:

1. Merge pull request to `main`
2. Deployment workflow triggers automatically
3. Workflow pauses for manual approval
4. Reviewer approves deployment
5. Migrations apply to production
6. Post-deployment verification runs

---

### Adding New Schemas

When you need to add a second database (e.g., `job` schema):

**1. Update workflow files**:

In `.github/workflows/prisma-ci.yml`:

```yaml
# Line 68 and 191 - Add new schema to matrix
schema: ... || fromJSON('["site", "job"]')

# Lines 140-144 and 215-224 - Add database URL configuration
elif [[ "${{ matrix.schema }}" == "job" ]]; then
  echo "JOB_DATABASE_URL=${DB_URL}" >> $GITHUB_ENV
  echo "JOB_DIRECT_URL=${DB_URL}" >> $GITHUB_ENV
fi
```

**2. Add GitHub secrets**:

- `PROD_JOB_DATABASE_URL`
- `PROD_JOB_DIRECT_URL`

**3. Update verification config**:

In `.github/prisma-verification.json`:

```json
{
  "site": { ... },
  "job": {
    "criticalTables": ["Job", "JobLog"],
    "criticalIndexes": ["Job_status_idx"],
    "criticalConstraints": ["Job_pkey"],
    "criticalEnums": ["JobStatus"]
  }
}
```

**4. Update drift detection and rollback workflows similarly**

---

## Incident Response

### Migration Failed During Deployment

**Symptoms**: Deployment workflow fails at "Deploy migrations" step

**Immediate Actions**:

1. **DO NOT PANIC** - Database is likely unchanged if migration failed
2. Check workflow logs for error message
3. Verify application is still functioning
4. Notify team in incident channel

**Investigation**:

```bash
# Check migration status
npm run db:status

# Common failure reasons:
# - Schema drift (manual changes to production DB)
# - Migration conflict (another migration was applied)
# - SQL syntax error
# - Database connection issue
# - Lock timeout (long-running query blocking migration)
```

**Resolution Paths**:

**A. Schema Drift Detected**:

1. Run drift detection workflow to get SQL diff
2. See [Drift Detected in Production](#drift-detected-in-production)

**B. Migration Conflict**:

1. Another developer merged migrations while your PR was open
2. Pull latest changes from `main`
3. Recreate your migration on top of new baseline
4. Re-deploy

**C. SQL Error in Migration**:

1. Fix the migration SQL locally
2. Create new migration with fix
3. Mark failed migration as rolled back (if it was partially applied)
4. Deploy new migration

**D. Database Lock/Timeout**:

1. Identify and terminate blocking queries
2. Retry deployment
3. Consider maintenance window for future large migrations

---

### Drift Detected in Production

**Symptoms**: Drift detection workflow creates GitHub issue

**Cause**: Someone manually modified production database schema

**Resolution Options**:

**Option A: Adopt Production Changes** (production changes were intentional)

```bash
# 1. Pull production schema locally
npm run db:pull

# 2. Review changes in schema file
git diff src/prisma/site/schema/schema.prisma

# 3. Create migration from current schema
npm run db:migrate:dev --create-only --name adopt_production_changes

# 4. Review generated migration SQL
cat src/prisma/site/migrations/[timestamp]_adopt_production_changes/migration.sql

# 5. Commit and deploy through normal process
git add .
git commit -m "feat(db): adopt production schema changes"
git push
```

**Option B: Revert Production to Match Schema** (production changes were accidental)

```bash
# 1. Generate reversion SQL using migrate diff
bunx prisma migrate diff \
  --from-url="$PROD_DATABASE_URL" \
  --to-schema-datamodel="src/prisma/site/schema/schema.prisma" \
  --script > revert-drift.sql

# 2. Review revert SQL CAREFULLY
cat revert-drift.sql

# 3. Test in staging first
# ... test in staging environment ...

# 4. Create migration with revert SQL
npm run db:migrate:dev --create-only --name revert_manual_changes

# 5. Replace generated SQL with revert SQL
cp revert-drift.sql src/prisma/site/migrations/[timestamp]_revert_manual_changes/migration.sql

# 6. Deploy through normal process
git add .
git commit -m "fix(db): revert manual production changes"
git push
```

---

### Migration Rollback

**When to rollback**:

- Migration caused production outage
- Migration contained errors discovered after deployment
- Need to quickly restore previous state

**Prisma Rollback Limitation**:

- Prisma does NOT support automatic "down" migrations
- Rollback workflow only marks migration as "rolled back" in tracking table
- You must manually revert schema changes

**Full Rollback Procedure**:

**Step 1: Mark Migration as Rolled Back**

```bash
# Via GitHub UI
Actions → Prisma Migration Rollback → Run workflow
- Migration name: [failed migration name]
- Rollback type: mark-rolled-back
- Confirm backup: ✓
```

**Step 2: Manually Revert Schema Changes**

Review the migration SQL and write inverse SQL:

| Original SQL                               | Inverse SQL                                                      |
| ------------------------------------------ | ---------------------------------------------------------------- |
| `CREATE TABLE users (...)`                 | `DROP TABLE users;`                                              |
| `ALTER TABLE users ADD COLUMN email TEXT;` | `ALTER TABLE users DROP COLUMN email;`                           |
| `ALTER TABLE users DROP COLUMN phone;`     | `ALTER TABLE users ADD COLUMN phone TEXT;` (restore from backup) |
| `DROP TABLE old_users;`                    | Restore from database backup                                     |

**Step 3: Execute Reversion SQL**

```bash
# Test in staging first!
bunx prisma db execute --schema=src/prisma/site/schema --stdin < revert.sql

# Then apply to production (after backup verification)
# Use the production database URL
```

**Step 4: Create Fix Migration**

```bash
# Create new migration with fix
npm run db:migrate:dev --create-only --name fix_issue_from_[original_migration]

# Deploy fix through normal CI/CD process
```

**Alternative: Roll Forward** (Recommended)
Instead of reverting, create a new migration that fixes the issue:

```bash
# Make schema changes to fix the issue
vim src/prisma/site/schema/schema.prisma

# Create new migration
npm run db:migrate:dev --name fix_user_table_issue

# Deploy through normal process
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: "Migration has already been applied"

**Cause**: Trying to apply a migration that's already in the database

**Solution**:

```bash
# Mark as applied to skip it
bunx prisma migrate resolve --applied [migration_name] --schema=src/prisma/site/schema
```

#### Issue: "Migration has not been applied yet"

**Cause**: Migration tracking table is out of sync

**Solution**:

```bash
# Check status
npm run db:status

# If migration was partially applied, mark as rolled back
bunx prisma migrate resolve --rolled-back [migration_name] --schema=src/prisma/site/schema

# Then redeploy
```

#### Issue: "The database schema is not in sync with the migration history"

**Cause**: Schema drift - manual changes to database

**Solution**:

1. Run drift detection workflow
2. Follow [Drift Detected in Production](#drift-detected-in-production) procedures

#### Issue: "Could not connect to database"

**Cause**: Database connection issues

**Check**:

- Database is running and accessible
- Connection URL is correct
- Firewall rules allow GitHub Actions IPs
- Database credentials are valid
- Network connectivity

#### Issue: Workflow stuck at "Waiting for approval"

**Cause**: Normal - manual approval required

**Solution**:

- Review workflow logs
- Check for destructive operations warning
- Approve or reject in GitHub UI under "Environments" section

---

## Best Practices

### Schema Changes

**DO**:

- ✅ Always create migrations through `npm run db:migrate:dev`
- ✅ Test migrations locally before pushing
- ✅ Review generated SQL carefully
- ✅ Use descriptive migration names
- ✅ Keep migrations small and focused
- ✅ Commit migrations with schema changes together

**DON'T**:

- ❌ Manually edit production database schema
- ❌ Skip migration validation by force-pushing
- ❌ Combine unrelated schema changes in one migration
- ❌ Deploy migrations without reviewing SQL
- ❌ Edit migration SQL after it's been deployed

### Destructive Operations

When creating migrations that drop data:

1. **Plan for data retention**:
    - Export data before dropping
    - Keep backups for extended period
    - Document retention policy

2. **Communicate changes**:
    - Notify stakeholders
    - Update documentation
    - Plan maintenance window if needed

3. **Consider alternatives**:
    - Soft delete instead of dropping
    - Archive data before removing
    - Gradual deprecation

4. **Extra review**:
    - Require additional approvals
    - Test on production-like data volume
    - Have rollback plan ready

### Monitoring and Verification

**Daily**:

- Monitor migration deployment notifications
- Review any failed workflows
- Check application error logs

**Weekly**:

- Run drift detection workflow
- Review open migration-related issues
- Verify backup restoration process

**Monthly**:

- Review migration performance
- Update verification config for new critical tables
- Audit database access controls

---

## GitHub Environment Setup

### Required GitHub Environments

Create these environments in **Settings → Environments**:

#### 1. `production`

- **Protection Rules**:
    - ✅ Required reviewers: [Your team members]
    - ✅ Wait timer: 0 minutes (optional: add delay)
    - ✅ Prevent administrators from bypassing: Recommended
- **Secrets**: (All required)
    - `PROD_SITE_DATABASE_URL`: Connection pooler URL
    - `PROD_SITE_DIRECT_URL`: Direct database URL (bypass pooler)

#### 2. `production-rollback`

- **Protection Rules**:
    - ✅ Required reviewers: [Senior team members only]
    - ✅ Wait timer: 5 minutes (cooling-off period)
    - ✅ Prevent administrators from bypassing: Strongly recommended
- **Secrets**: Same as `production`

### Required Reviewers

**Production Environment**:

- At least 2 team members with database knowledge
- Must include: Database administrator OR senior engineer

**Production-Rollback Environment**:

- Database administrator (required)
- CTO or engineering lead

### Adding New Database Secrets

When adding a new schema (e.g., `job`):

1. Go to Settings → Secrets and variables → Actions
2. Add repository secrets:
    - `PROD_JOB_DATABASE_URL`
    - `PROD_JOB_DIRECT_URL`
3. Update both environments to include these secrets
4. Test with drift detection workflow before deploying migrations

---

## Emergency Contacts

**Database Issues**:

- Database Administrator: [Contact info]
- DevOps Team: [Slack channel / PagerDuty]

**Escalation Path**:

1. Database Administrator
2. Engineering Lead
3. CTO

**External Resources**:

- Database Provider Support: [Link/Phone]
- Prisma Discord: <https://pris.ly/discord>
- Prisma Docs: <https://www.prisma.io/docs>

---

## Appendix

### Useful Commands

```bash
# Check migration status
npm run db:status

# Create new migration
npm run db:migrate:dev

# Deploy migrations (don't use in production - use GitHub Actions)
npm run db:migrate:deploy

# Reset database (DANGEROUS - dev only)
npm run db:reset

# Pull schema from database
npm run db:pull

# Generate Prisma client
npm run db:generate

# Open Prisma Studio
npm run db:studio

# Show diff between schema and database
npm run db:site:diff

# Compare local schema to production (requires prod URL in env)
npm run db:site:diff-from-prod
```

### GitHub Actions Workflow Files

- Main CI/CD: `.github/workflows/prisma-ci.yml`
- Drift Detection: `.github/workflows/prisma-drift-detection.yml`
- Rollback: `.github/workflows/prisma-rollback.yml`
- Verification Config: `.github/prisma-verification.json`

### Related Documentation

- [Prisma Migrate Reference](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma CLI Reference](https://www.prisma.io/docs/reference/api-reference/command-reference)
- [T3 Stack Database Setup](https://create.t3.gg/en/usage/prisma)
- Project README: `README.md`
- Project Architecture: `.claude/CLAUDE.md`

---

**Last Updated**: Generated by Prisma CI/CD Enhancement
**Maintained By**: DevOps Team
**Review Frequency**: Quarterly or after major incidents
