import * as migration_20260707_154745_init_payload_schema from './20260707_154745_init_payload_schema';
import * as migration_20260709_000001_add_comments_collection from './20260709_000001_add_comments_collection';
import * as migration_20260709_000002_add_oauth_comment_fields from './20260709_000002_add_oauth_comment_fields';
import * as migration_20260711_113838_add_post_richtext_fields from './20260711_113838_add_post_richtext_fields';
import * as migration_20260712_160000_add_media_filename_slug_and_sizes from './20260712_160000_add_media_filename_slug_and_sizes';
import * as migration_20260713_000001_add_media_image_size_columns from './20260713_000001_add_media_image_size_columns';
import * as migration_20260715_000001_add_media_fit from './20260715_000001_add_media_fit';
import * as migration_20260730_000001_add_chapter_order from './20260730_000001_add_chapter_order';
import * as migration_20260803_000001_add_projects_collection from './20260803_000001_add_projects_collection';
import * as migration_20260803_000002_seed_projects_when_empty from './20260803_000002_seed_projects_when_empty';
import * as migration_20260815_000001_add_series_landing_fields from './20260815_000001_add_series_landing_fields';
import * as migration_20260819_000001_add_newsletter_subscribers from './20260819_000001_add_newsletter_subscribers';

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
  {
    up: migration_20260711_113838_add_post_richtext_fields.up,
    down: migration_20260711_113838_add_post_richtext_fields.down,
    name: '20260711_113838_add_post_richtext_fields'
  },
  {
    up: migration_20260712_160000_add_media_filename_slug_and_sizes.up,
    down: migration_20260712_160000_add_media_filename_slug_and_sizes.down,
    name: '20260712_160000_add_media_filename_slug_and_sizes'
  },
  {
    up: migration_20260713_000001_add_media_image_size_columns.up,
    down: migration_20260713_000001_add_media_image_size_columns.down,
    name: '20260713_000001_add_media_image_size_columns'
  },
  {
    up: migration_20260715_000001_add_media_fit.up,
    down: migration_20260715_000001_add_media_fit.down,
    name: '20260715_000001_add_media_fit'
  },
  {
    up: migration_20260730_000001_add_chapter_order.up,
    down: migration_20260730_000001_add_chapter_order.down,
    name: '20260730_000001_add_chapter_order'
  },
  {
    up: migration_20260803_000001_add_projects_collection.up,
    down: migration_20260803_000001_add_projects_collection.down,
    name: '20260803_000001_add_projects_collection'
  },
  {
    up: migration_20260803_000002_seed_projects_when_empty.up,
    down: migration_20260803_000002_seed_projects_when_empty.down,
    name: '20260803_000002_seed_projects_when_empty'
  },
  {
    up: migration_20260815_000001_add_series_landing_fields.up,
    down: migration_20260815_000001_add_series_landing_fields.down,
    name: '20260815_000001_add_series_landing_fields'
  },
  {
    up: migration_20260819_000001_add_newsletter_subscribers.up,
    down: migration_20260819_000001_add_newsletter_subscribers.down,
    name: '20260819_000001_add_newsletter_subscribers'
  },
];
