import { type SchemaTypeDefinition } from 'sanity';
import { announcementType } from './schemas/announcement';
import { prayerTimesType } from './schemas/prayerTimes';
import { hadithSettingsType } from './schemas/hadithSettings';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [announcementType, prayerTimesType, hadithSettingsType],
};
