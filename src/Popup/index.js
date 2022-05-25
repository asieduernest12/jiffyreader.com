import {
  getActiveTabs,
  registerListener, scriptSender, sendMessage, tabSender,
} from '../utils';

const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;
const toggleOnDefaultCheckbox = document.getElementById('toggleOnDefaultCheckbox');
const toggleBtn = document.getElementById('toggleBtn');
const saccadesIntervalSlider = document.getElementById('saccadesSlider');
const saccadesIntervalLabel = document.getElementById('saccadesIntervalLabel');
const lineHeightSlider = document.getElementById('lineHeightSlider');
const lineHeightLabelValue = document.getElementById('lineHeightLabelValue');

// get the mode when popup load. expected values on|off
sendMessage({ message: 'getBrMode' }, scriptSender(runTimeHandler), ({ data }) => {
  document.body.setAttribute('document-br-mode', data);
});

/**
 *
 get the value indicating if we fill the checkbox when poploads ,
 same value turn on brMode when a document is loaded
 */
sendMessage(
  { message: 'getToggleOnDefault' },
  scriptSender(runTimeHandler),
  (response) => {
    if (response.data === 'true' || response.data === true) {
      toggleOnDefaultCheckbox.setAttribute('checked', response.data);
    } else {
      toggleOnDefaultCheckbox.removeAttribute('checked');
    }
  },
);

sendMessage({ message: 'getSaccadesInterval' }, scriptSender(runTimeHandler), (response) => {
  saccadesIntervalLabel.textContent = response.data;
  saccadesIntervalSlider.value = response.data;
});

sendMessage({ message: 'getLineHeight' }, tabSender(runTimeHandler, getActiveTabs), (response) => {
  lineHeightLabelValue.textContent = response.data === '' ? 'off' : response.data;
  lineHeightSlider.value = response.data === '' ? 0 : response.data;
});

toggleBtn.addEventListener('click', async () => {
  sendMessage({ message: 'toggleReadingMode' }, scriptSender(runTimeHandler));
});

toggleOnDefaultCheckbox.addEventListener('change', async (event) => {
  sendMessage(
    { message: 'setToggleOnDefault', data: event.target.checked },
    scriptSender(runTimeHandler),
  );
});

saccadesIntervalSlider.addEventListener('change', (event) => {
  sendMessage(
    {
      message: 'setSaccadesInterval', data: event.target.value,
    },
    scriptSender(runTimeHandler),
    () => { saccadesIntervalLabel.textContent = event.target.value; },
  );
});

registerListener(runTimeHandler, (request) => {
  if (request.message !== 'setBrMode') return;

  document.body.setAttribute('document-br-mode', request.data);
});

lineHeightSlider.addEventListener('change', (event) => {
  sendMessage({ message: 'setLineHeight', data: event.target.value }, tabSender(runTimeHandler, getActiveTabs), (response) => {
    lineHeightLabelValue.textContent = response.data === '' ? 'off' : response.data;
  });
});
