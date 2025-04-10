import type defaultPrefs from '~services/preferences';

type Prefs = typeof defaultPrefs;
type PrefRecords = Record<string, Pref>;

interface PrefStore {
	global: Prefs;
	local: PrefRecords;
}

interface TabSession {
	brMode: boolean;
	origin?: string;
	tabID?;
}

type TabSessionStore = Record<string, TabSession>;

type UpdateCallback = (tabSessions: PrefRecords) => PrefRecords;

type SetPrefsExternal = (getOrigin: () => Promise<string>, scope: string, newPrefs: Prefs, deleteOldLocal?: boolean) => Promise<void>;

type removeTabSession = (getTab: () => Promise<chrome.tabs.Tab>) => Promise<void>;

interface AppConfigPref {
	displayColorMode: DisplayColorMode;
}

declare namespace NodeJS {
	interface ProcessEnv {
		PLASMO_PUBLIC_DEBUG: string;
		PLASMO_PUBLIC_TARGET: string;
		PLASMO_PUBLIC_SHORTCUT: string;
		PLASMO_PUBLIC_VERSION: string;
		PLASMO_PUBLIC_NAME: string;
		PLASMO_PUBLIC_HOME_URL: string;
		PLASMO_PUBLIC_ENABLE_TRACKING: string
	}
}

declare module '*.scss';
