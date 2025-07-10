import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import googleCloud from '@genkit-ai/google-cloud';

export const ai = genkit({
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
