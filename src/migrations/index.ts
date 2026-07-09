import * as migration_20260707_154745_init_payload_schema from './20260707_154745_init_payload_schema';
import * as migration_20260709_000001_add_comments_collection from './20260709_000001_add_comments_collection';
import * as migration_20260709_000002_add_oauth_comment_fields from './20260709_000002_add_oauth_comment_fields';

export const migrations = [
  {
    up: migration_20260707_154745_init_payload_schema.up,
    down: migration_20260707_154745_init_payload_schema.down,
    name: '20260707_154745_init_payload_schema'
  },
  {
    up: migration_20260709_000001_add_comments_collection.up,
    down: migration_20260709_000001_add_comments_collection.down,
    name: '20260709_000001_add_comments_collection'
  },
  {
    up: migration_20260709_000002_add_oauth_comment_fields.up,
    down: migration_20260709_000002_add_oauth_comment_fields.down,
    name: '20260709_000002_add_oauth_comment_fields'
  },
];
