import * as migration_20260905_004830_initial from './20260905_004830_initial';

export const migrations = [
  {
    up: migration_20260905_004830_initial.up,
    down: migration_20260905_004830_initial.down,
    name: '20260905_004830_initial'
  },
];
