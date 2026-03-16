import { defineField, defineType } from 'sanity';

export const announcementType = defineType({
  name: 'announcement',
  title: 'Announcement',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title (Internal Use)',
      description: 'Used only for you to identify the announcement',
      type: 'string',
    }),
    defineField({
      name: 'type',
      title: 'Announcement Type',
      type: 'string',
      options: {
        list: [
          { title: 'Audio (Voice Note)', value: 'audio' },
          { title: 'Image', value: 'image' },
          { title: 'Video', value: 'video' },
          { title: 'Text', value: 'text' },
          { title: 'Document (PDF/Word)', value: 'pdf' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'contentImage',
      title: 'Content: Image',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ document }) => document?.type !== 'image',
    }),
    defineField({
      name: 'contentAudio',
      title: 'Content: Audio',
      type: 'file',
      options: { accept: 'audio/*' },
      hidden: ({ document }) => document?.type !== 'audio',
    }),
    defineField({
      name: 'contentVideo',
      title: 'Content: Video',
      type: 'file',
      options: { accept: 'video/*' },
      hidden: ({ document }) => document?.type !== 'video',
    }),
    defineField({
      name: 'contentText',
      title: 'Content: Text',
      type: 'text',
      hidden: ({ document }) => document?.type !== 'text',
    }),
    defineField({
      name: 'contentPdf',
      title: 'Content: Document (PDF/Word)',
      type: 'file',
      options: { accept: '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      hidden: ({ document }) => document?.type !== 'pdf',
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      options: {
        list: [
          { title: 'Urdu', value: 'urdu' },
          { title: 'English', value: 'english' },
          { title: 'Both (English & Urdu)', value: 'both' },
        ],
        layout: 'radio',
      },
      initialValue: 'urdu',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'timestamp',
      title: 'Timestamp',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'type',
      media: 'contentImage',
    },
  },
});
