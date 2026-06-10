# WordPress Data Safety and Recovery

Use this when drafts appear missing, published posts look blank, or the WordPress
admin account no longer accepts the expected password.

## Rules

- Do not run import, restore, or password reset commands before creating a fresh
  backup of the current state.
- Prefer read-only audit commands first.
- Restore and password reset commands intentionally modify WordPress data.

## 1. Backup Current State

```bash
cd /home/lu-new
scripts/backup.sh
```

This writes a timestamped backup under `./backups/`.

## 2. Read-Only Audit

If the WordPress application password still works:

```bash
docker compose run --rm --no-deps app node scripts/audit-wordpress-state.mjs
docker compose run --rm --no-deps app node scripts/list-wordpress-drafts.mjs
```

If REST auth is not available, use WP-CLI read-only checks:

```bash
docker compose --profile tools run --rm wpcli post list \
  --post_type=post \
  --post_status=any \
  --fields=ID,post_title,post_status,post_name,post_modified \
  --orderby=modified \
  --order=DESC \
  --posts_per_page=100

docker compose --profile tools run --rm wpcli post list \
  --post_type=post \
  --post_status=trash \
  --fields=ID,post_title,post_status,post_name,post_modified

docker compose --profile tools run --rm wpcli user list \
  --fields=ID,user_login,display_name,user_email,roles
```

## 3. Recover Drafts

If drafts are in Trash, restore each post intentionally:

```bash
docker compose --profile tools run --rm wpcli post update <POST_ID> --post_status=draft
```

If a post exists but content is blank, check revisions in WordPress admin first:

```text
/wp-admin/post.php?post=<POST_ID>&action=edit
```

Then open the Revisions panel and restore the correct revision.

If no revision exists, restore from a database backup to a staging copy first and
copy the needed content back manually. Restoring the production database directly
overwrites current WordPress data.

## 4. Recreate Missing Roadmap Draft Metadata

After the audit, if roadmap draft records are missing from WordPress and you only
need to recreate empty draft metadata, run the import. The import script is now
create-only: it skips existing slugs and refuses destructive mode.

```bash
docker compose run --rm --no-deps app node scripts/import-roadmap-to-wordpress.mjs
```

## 5. Admin Password Recovery

The old WordPress password cannot be recovered from the hash. If login is broken,
set a new password intentionally after confirming the target user:

```bash
docker compose --profile tools run --rm wpcli user list \
  --fields=ID,user_login,display_name,user_email,roles
```

Then reset only the confirmed admin account:

```bash
docker compose --profile tools run --rm wpcli user update <USER_LOGIN> \
  --user_pass='<NEW_TEMPORARY_PASSWORD>'
```

Log in at `/wp-admin`, set a strong password in the UI, and rotate any exposed
application passwords.
