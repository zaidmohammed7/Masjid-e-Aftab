import { defineField, defineType } from 'sanity';

export const prayerTimesType = defineType({
  name: 'prayerTimes',
  title: 'Prayer Times',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      description: 'Used for internal identification (e.g., "Current Times")',
      type: 'string',
      initialValue: 'Current Prayer Times',
    }),
    defineField({ name: 'fajr', title: 'Fajr', type: 'string' }),
    defineField({ name: 'dhuhr', title: 'Dhuhr', type: 'string' }),
    defineField({ name: 'asr', title: 'Asr', type: 'string' }),
    defineField({ name: 'maghrib', title: 'Maghrib', type: 'string' }),
    defineField({ name: 'isha', title: 'Isha', type: 'string' }),
    defineField({ name: 'jummah1', title: 'Jummah 1st Jamaat', type: 'string' }),
    defineField({ name: 'jummah2', title: 'Jummah 2nd Jamaat', type: 'string' }),
    defineField({ name: 'jummah3', title: 'Jummah 3rd Jamaat', type: 'string' }),
  ],
});
