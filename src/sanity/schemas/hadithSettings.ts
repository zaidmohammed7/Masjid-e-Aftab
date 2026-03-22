import { defineField, defineType } from 'sanity';

export const hadithSettingsType = defineType({
  name: 'hadithSettings',
  title: 'Hadith Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'currentIndex',
      title: 'Current Hadith Index',
      type: 'number',
      initialValue: 1,
    }),
    defineField({
      name: 'isManualOverride',
      title: 'Is Manual Override Active?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last Updated (ISO Timestamp)',
      type: 'datetime',
    }),
    defineField({
      name: 'arabicText',
      title: 'Arabic Text',
      type: 'text',
    }),
    defineField({
      name: 'englishText',
      title: 'English Text',
      type: 'text',
    }),
    defineField({
      name: 'urduText',
      title: 'Urdu Text',
      type: 'text',
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
    }),
  ],
});
