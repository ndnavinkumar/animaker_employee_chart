// msw v2: setupWorker is exported from 'msw/browser'
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
