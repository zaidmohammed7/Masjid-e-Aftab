import { type SchemaTypeDefinition } from 'sanity';
import { announcementType } from './schemas/announcement';
import { prayerTimesType } from './schemas/prayerTimes';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [announcementType, prayerTimesType],
};
