import * as migration_20260905_004830_initial from './20260905_004830_initial';
import * as migration_20260905_103747_add_awards_gallery_quote_blocks from './20260905_103747_add_awards_gallery_quote_blocks';
import * as migration_20260905_104539_add_beer_product_data from './20260905_104539_add_beer_product_data';
import * as migration_20260905_110200_add_venue_hours_label_and_faqs from './20260905_110200_add_venue_hours_label_and_faqs';
import * as migration_20260905_112240_allow_guest_taps from './20260905_112240_allow_guest_taps';
import * as migration_20260905_133656_add_can_image_size from './20260905_133656_add_can_image_size';
import * as migration_20260905_154916_add_merch from './20260905_154916_add_merch';
import * as migration_20260905_180844_add_menu_item_images from './20260905_180844_add_menu_item_images';
import * as migration_20260905_182700_add_functions_pack from './20260905_182700_add_functions_pack';
import * as migration_20260905_190000_resize_ladder from './20260905_190000_resize_ladder';
import * as migration_20260906_090000_social_links from './20260906_090000_social_links';
import * as migration_20260906_100000_maps_query from './20260906_100000_maps_query';
import * as migration_20260906_110000_event_price_note from './20260906_110000_event_price_note';

export const migrations = [
  {
    up: migration_20260905_004830_initial.up,
    down: migration_20260905_004830_initial.down,
    name: '20260905_004830_initial',
  },
  {
    up: migration_20260905_103747_add_awards_gallery_quote_blocks.up,
    down: migration_20260905_103747_add_awards_gallery_quote_blocks.down,
    name: '20260905_103747_add_awards_gallery_quote_blocks',
  },
  {
    up: migration_20260905_104539_add_beer_product_data.up,
    down: migration_20260905_104539_add_beer_product_data.down,
    name: '20260905_104539_add_beer_product_data',
  },
  {
    up: migration_20260905_110200_add_venue_hours_label_and_faqs.up,
    down: migration_20260905_110200_add_venue_hours_label_and_faqs.down,
    name: '20260905_110200_add_venue_hours_label_and_faqs',
  },
  {
    up: migration_20260905_112240_allow_guest_taps.up,
    down: migration_20260905_112240_allow_guest_taps.down,
    name: '20260905_112240_allow_guest_taps',
  },
  {
    up: migration_20260905_133656_add_can_image_size.up,
    down: migration_20260905_133656_add_can_image_size.down,
    name: '20260905_133656_add_can_image_size',
  },
  {
    up: migration_20260905_154916_add_merch.up,
    down: migration_20260905_154916_add_merch.down,
    name: '20260905_154916_add_merch',
  },
  {
    up: migration_20260905_180844_add_menu_item_images.up,
    down: migration_20260905_180844_add_menu_item_images.down,
    name: '20260905_180844_add_menu_item_images',
  },
  {
    up: migration_20260905_182700_add_functions_pack.up,
    down: migration_20260905_182700_add_functions_pack.down,
    name: '20260905_182700_add_functions_pack'
  },
  {
    up: migration_20260905_190000_resize_ladder.up,
    down: migration_20260905_190000_resize_ladder.down,
    name: '20260905_190000_resize_ladder',
  },
  {
    up: migration_20260906_090000_social_links.up,
    down: migration_20260906_090000_social_links.down,
    name: '20260906_090000_social_links',
  },
  {
    up: migration_20260906_100000_maps_query.up,
    down: migration_20260906_100000_maps_query.down,
    name: '20260906_100000_maps_query',
  },
  {
    up: migration_20260906_110000_event_price_note.up,
    down: migration_20260906_110000_event_price_note.down,
    name: '20260906_110000_event_price_note',
  },
];
