import { useEffect, useState } from 'react';

import usePrefs from '~usePrefs';

import documentParser from '../../../src/ContentScript/documentParser';
import Logger from '../features/Logger';


import type { PlasmoContentScript } from "plasmo";


export const config: PlasmoContentScript = {
  matches: ["<all_urls>"],
  all_frames: true,
 
}

const { setAttribute, setProperty, setSaccadesStyle } = documentParser.makeHandlers(document);

const contentLogStyle = 'background-color: pink';

const runTimeHandler = typeof browser === 'undefined' ? chrome : browser;

const OVERLAY_STYLE = {
  position: 'fixed',
  bottom: '40px',
  left: '40px',
  display: 'flex',
  flexDirection: 'column',
};

window.addEventListener('load', () => {
  Logger.logInfo('content script loaded');
});

export const getRootContainer = () => {
  let child = document.createElement('div');
  child.setAttribute('br-mount-point', '');

  document.querySelector('body').appendChild(child);
  return document.querySelector('[br-mount-point]');
};

const IndexContent = () => {
  const [prefs] = usePrefs(async () => window.location.origin, false);

  const [tabSession, setTabSession] = useState<TabSession | null>(null);

  const onChromeRuntimeMessage = (message, sender, sendResponse) => {
    let tabSession: TabSession ;
    
    try {
      
     tabSession = JSON.parse(document.body.dataset?.tabsession );
    } catch (error) {
      tabSession = {brMode: false}
    }

    switch (message.type) {
      case 'getOrigin': {
        Logger.logInfo('reply to origin request');
        sendResponse({ data: window.location.origin });
        break;
      }
      case 'setReadingMode': {
        tabSession.brMode = message?.data ?? !tabSession.brMode;
        setTabSession(tabSession);
        sendResponse({ data: tabSession });
        return true;
        break;
      }
      case 'getReadingMode': {
        sendResponse({ data: tabSession.brMode });
        return true;
        break;
      }
      default:
        break;
    }
  };

  useEffect(() => {
    Logger.logInfo(
      '%cTabSession same: %s   prefs same:%s',
      contentLogStyle,
      document.body.dataset.tabsession === JSON.stringify(tabSession),
      document.body.dataset.prefs === JSON.stringify(prefs),
    );

    if (prefs && !tabSession) {
      setTabSession({ brMode: prefs.onPageLoad });
    }

    if (
      !prefs ||
      !tabSession ||
      (document.body.dataset.tabsession === JSON.stringify(tabSession) &&
        document.body.dataset.prefs === JSON.stringify(prefs))
    )
      return;

    Logger.logInfo('content.tsx.useEffect', { prefs, tabSession });

    runTimeHandler.runtime.sendMessage(
      { message: 'setIconBadgeText', data: tabSession.brMode, tabID: tabSession.tabID },
      () => Logger.LogLastError(),
    );

    documentParser.setReadingMode(tabSession.brMode, document);
    setProperty('--fixation-edge-opacity', prefs.fixationEdgeOpacity + '%');
    setProperty('--br-line-height', prefs.lineHeight);
    setSaccadesStyle(prefs.saccadesStyle);
    setAttribute('saccades-color', prefs.saccadesColor);
    setAttribute('fixation-strength', prefs.fixationStrength);
    setAttribute('saccades-interval', prefs.saccadesInterval);

    document.body.dataset.tabsession = JSON.stringify(tabSession);
    document.body.dataset.prefs = JSON.stringify(prefs);
  }, [prefs, tabSession]);

  useEffect(() => {
    Logger.logInfo('register chrome|browser messageListener');
    runTimeHandler.runtime.onMessage.addListener(onChromeRuntimeMessage);
  }, []);

  const showDebugOverLay = (show) => {
    if (!show) return;

    return (
      <div className="[ br-overlay ]" style={OVERLAY_STYLE}>
        <span>Target {process.env.TARGET}</span>
        <div className="flex flex-column">
          {!prefs || !tabSession
            ? 'Loading... or broken but probably loading'
            : 'JiffyReady to the moon'}
        </div>
        <span>{JSON.stringify(tabSession)}</span>
        <span>{JSON.stringify(prefs)}</span>
      </div>
    );
  };

  return showDebugOverLay(process.env.NODE_ENV !== 'production');
};

export default IndexContent;

// export default () => {
//   const [prefs, setPrefs] = usePrefs(async () => window.location.origin);

//   useEffect(()=>{
//     console.log(prefs)
//   },[])

//   return (
//     <div style={OVERLAY_STYLE}>
//       <h1>test overlay</h1>
//       <p>prefs {prefs}</p>
//     </div>
//   );
// };