import {
  LINE_HEIGHT_KEY, registerListener, scriptSender, sendMessage,
} from '../utils';

const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

// making half of the letters in a word bold
function highlightText(sentenceText) {
  return sentenceText
    .replace(/\p{L}+/gu, (word) => {
      const { length } = word;
      let midPoint = 1;
      if (length > 3) midPoint = Math.round(length / 2);
      const firstHalf = word.slice(0, midPoint);
      const secondHalf = word.slice(midPoint);
      const htmlWord = `<br-bold>${firstHalf}</br-bold>${secondHalf}`;
      return htmlWord;
    });
}

const ToggleReading = (activateOnFirstLoad) => {
  const boldedElements = document.getElementsByTagName('br-bold');

  // only add br bold to body element

  if (document.body.classList.contains('br-bold') || activateOnFirstLoad === false) {
    document.body.classList.remove('br-bold');
    sendMessage({ message: 'setBrMode', data: 'off' }, scriptSender(runTimeHandler));
    return;
  }

  if (!document.body.classList.contains('br-bold')) {
    document.body.classList.add('br-bold');
  }

  if (activateOnFirstLoad) document.body.classList.add('br-bold');

  sendMessage({ message: 'setBrMode', data: 'on' }, scriptSender(runTimeHandler));

  if (boldedElements.length) {
    // end if no br-bold elements found on the page
    return;
  }

  // when: no-br|  turn on

  const tags = ['p', 'font', 'span', 'li'];
  const parser = new DOMParser();
  tags.forEach((tag) => {
    for (const element of document.getElementsByTagName(tag)) {
      const n = parser.parseFromString(element.innerHTML, 'text/html');
      const textArrTransformed = Array.from(n.body.childNodes).map((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          return highlightText(node.nodeValue);
        }
        return node.outerHTML;
      });
      element.innerHTML = textArrTransformed.join(' ');
    }
  });
};

const setSaccadesIntervalAttribute = (/** @type */saccadesInterval) => {
  document.body.setAttribute('saccades-interval', saccadesInterval);
};
const onChromeRuntimeMessage = (request, sender, sendResponse) => {
  const { message, data } = request;

  if (!message) {
    return;
  }

  switch (message) {
    case 'toggleReadingMode':
      ToggleReading(data);
      break;

    case 'setReadingMode':
      if (!data) {
        return;
      }

      ToggleReading(data);
      break;

    case 'setSaccadesInterval':
      setSaccadesIntervalAttribute(data);
      break;

    case 'setLineHeight':
      document.body.style.setProperty(LINE_HEIGHT_KEY, data < 1 ? '' : data);
      sendResponse({ data: document.body.style.getPropertyValue(LINE_HEIGHT_KEY) });
      break;

    case 'getLineHeight':
      sendResponse({ data: document.body.style.getPropertyValue(LINE_HEIGHT_KEY) ?? 0 });
      break;

    default:
      break;
  }
};

function docReady(fn) {
  // see if DOM is already available
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // call on next available tick
    setTimeout(fn, 1);
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

docReady(async () => {
  /*
   *setting global styles with options for saccades interval between 0 and 4 words to the
   *next saccade
  */

  const style = document.createElement('style');
  style.textContent = `
    .br-bold :is(
      [saccades-interval="0"] br-bold, 
      [saccades-interval="1"] br-bold:nth-of-type(2n+1),
      [saccades-interval="2"] br-bold:nth-of-type(3n+1),
      [saccades-interval="3"] br-bold:nth-of-type(4n+1),
      [saccades-interval="4"] br-bold:nth-of-type(5n+1)
      ) { 
      font-weight: bold !important; display: inline; line-height: var(--br-line-height,initial); 
    }
    `;
  document.head.appendChild(style);

  registerListener(runTimeHandler, onChromeRuntimeMessage);

  sendMessage(
    { message: 'getToggleOnDefault' },
    scriptSender(runTimeHandler),
    (response) => {
      ToggleReading(response?.data === 'true' || response?.data === true);
    },
  );

  sendMessage({ message: 'getSaccadesInterval' }, scriptSender(runTimeHandler), ({ data }) => { document.body.setAttribute('saccades-interval', data); });
});
