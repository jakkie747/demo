'use server';
import {genkit, configureGenkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {googleCloud} from '@genkit-ai/google-cloud/plugin';

configureGenkit({
  plugins: [
    googleAI(),
    googleCloud({
      project: process.env.GCLOUD_PROJECT,
      location: 'us-central1',
    }),
  ],
  model: 'googleai/gemini-1.5-flash-preview',
  logLevel: 'debug',
  enableTracing: true,
});

export { ai } from 'genkit';
