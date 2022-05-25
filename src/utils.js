export const getActiveTabs = (runTimeHandler) => runTimeHandler.tabs.query({ active: true });

export const DEFAULT_SACCADE_INTERVAL = 0;

export const LINE_HEIGHT_KEY = '--br-line-height';

export const tabSender = (runTimeHandler, getTabFn) => (
  async (payload, cb) => {
    const [tab] = await getTabFn(runTimeHandler);
    runTimeHandler.tabs.sendMessage(tab.id, payload, cb);
  }
);

export const scriptSender = (runTimeHandler) => (
  (/** @type Payload */payload, cb) => runTimeHandler.runtime.sendMessage(payload, cb)
);

export const sendMessage = (
/** @type {{message?,data?}} */payload,
  /** @type {scriptSender|tabSender} */ sender,
  cb = null,
) => (
  sender(payload, cb)
);

export const registerListener = (runTimeHandler, listernFn) => {
  runTimeHandler.runtime.onMessage.addListener(listernFn);
};
