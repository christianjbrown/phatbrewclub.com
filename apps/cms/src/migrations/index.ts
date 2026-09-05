import * as migration_20260905_004830_initial from './20260905_004830_initial';
import * as migration_20260905_103747_add_awards_gallery_quote_blocks from './20260905_103747_add_awards_gallery_quote_blocks';
import * as migration_20260905_104539_add_beer_product_data from './20260905_104539_add_beer_product_data';
import * as migration_20260905_110200_add_venue_hours_label_and_faqs from './20260905_110200_add_venue_hours_label_and_faqs';
import * as migration_20260905_112240_allow_guest_taps from './20260905_112240_allow_guest_taps';
import * as migration_20260905_133656_add_can_image_size from './20260905_133656_add_can_image_size';

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
    name: '20260905_133656_add_can_image_size'
  },
];
