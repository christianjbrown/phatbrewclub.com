import * as migration_20260905_004830_initial from './20260905_004830_initial';
import * as migration_20260905_103747_add_awards_gallery_quote_blocks from './20260905_103747_add_awards_gallery_quote_blocks';
import * as migration_20260905_104539_add_beer_product_data from './20260905_104539_add_beer_product_data';
import * as migration_20260905_110200_add_venue_hours_label_and_faqs from './20260905_110200_add_venue_hours_label_and_faqs';

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
    name: '20260905_110200_add_venue_hours_label_and_faqs'
  },
];
