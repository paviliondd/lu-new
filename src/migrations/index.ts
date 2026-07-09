import * as migration_20260707_154745_init_payload_schema from './20260707_154745_init_payload_schema';
import * as migration_20260709_000001_add_comments_collection from './20260709_000001_add_comments_collection';

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
];
