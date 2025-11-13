/**
 * Mock Sentry for Jest Testing
 */

export const init = jest.fn();
export const captureException = jest.fn();
export const captureMessage = jest.fn();
export const withScope = jest.fn((callback) =>
  callback({ setTag: jest.fn(), setContext: jest.fn() })
);
export const configureScope = jest.fn();
export const setContext = jest.fn();
export const setUser = jest.fn();
export const setTag = jest.fn();
export const setTags = jest.fn();
export const setExtra = jest.fn();
export const setExtras = jest.fn();
export const addBreadcrumb = jest.fn();
export const captureEvent = jest.fn();
export const flush = jest.fn(() => Promise.resolve(true));
export const close = jest.fn(() => Promise.resolve(true));

export default {
  init,
  captureException,
  captureMessage,
  withScope,
  configureScope,
  setContext,
  setUser,
  setTag,
  setTags,
  setExtra,
  setExtras,
  addBreadcrumb,
  captureEvent,
  flush,
  close,
};
