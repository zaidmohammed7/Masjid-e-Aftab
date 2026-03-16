// sanity.config.ts
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schema } from './src/sanity/schema';
import { projectId, dataset } from './src/sanity/env';

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  // Add and edit the content schema in the './src/sanity/schemas' folder
  schema,
  plugins: [
    structureTool(),
  ],
});
