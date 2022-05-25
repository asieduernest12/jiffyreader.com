/**
 * Note:
 * any callback in the listener should return true after
 * the code with the call back to keep the link back to the sender open
 */

const {
  sendMessage, tabSender, getActiveTabs, registerListener, DEFAULT_SACCADE_INTERVAL,
} = require('../utils');

const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

chrome.runtime.onInstalled.addListener(async () => {
  chrome.storage.sync.set({ saccadesInterval: DEFAULT_SACCADE_INTERVAL });
});

// leave returns in this block; features break without them
// eslint-disable-next-line consistent-return
const listener = (request, sender, sendResponse) => {
  switch (request.message) {
    case 'getToggleOnDefault': {
      chrome.storage.sync.get('toggleOnDefault', ({ toggleOnDefault }) => {
        sendResponse({ data: toggleOnDefault ?? 'true' });
      });
      return true;
    }
    case 'setToggleOnDefault': {
      chrome.storage.sync.set({ toggleOnDefault: request.data });
      sendResponse({ request });
      break;
    }

    case 'toggleReadingMode': {
      sendResponse({ data: true });
      sendMessage(request, tabSender(runTimeHandler, getActiveTabs));
      break;
    }
    case 'getSaccadesInterval':
      chrome.storage.sync.get('saccadesInterval', ({ saccadesInterval }) => {
        sendResponse({ data: Number(saccadesInterval ?? 0) });
      });
      return true;
    case 'setSaccadesInterval': {
      sendResponse({ data: true });
      chrome.storage.sync.set({ saccadesInterval: request.data });
      sendMessage(request, tabSender(runTimeHandler, getActiveTabs));
      break;
    }

    case 'setBrMode':
      sendResponse({ data: true });
      chrome.storage.sync.set({ brMode: request.data });
      break;
    case 'getBrMode': {
      chrome.storage.sync.get('brMode', ({ brMode }) => sendResponse({ data: brMode }));
      return true;
    }
    default:
      break;
  }
};

registerListener(runTimeHandler, listener);
