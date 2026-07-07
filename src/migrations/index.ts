import * as migration_20260707_154745_init_payload_schema from './20260707_154745_init_payload_schema';

export const migrations = [
  {
    up: migration_20260707_154745_init_payload_schema.up,
    down: migration_20260707_154745_init_payload_schema.down,
    name: '20260707_154745_init_payload_schema'
  },
];
