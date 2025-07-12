/**
 * @fileoverview Genkit configuration file.
 *
 * This file is used by the Genkit CLI to discover and run flows.
 * It is not used by the Next.js application directly.
 */

import {configureGenkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export default configureGenkit({
  plugins: [googleAI()],
  flowStateStore: 'firebase',
  traceStore: 'firebase',
  enableTracingAndMetrics: true,
  logLevel: 'debug',
});
