import type {NewsRun} from './news-flow';
export const CONSENT_VERSION='research-2026-10-24-completion-only';
export type ResearchConsent={accepted:true;version:typeof CONSENT_VERSION;at:number;language:'zh-Hant'|'en'};
export function hasResearchConsent(run:NewsRun|null|undefined):boolean{
 const c=run?.consent;
 return c?.accepted===true&&c.version===CONSENT_VERSION&&Number.isSafeInteger(c.at)&&c.at>=1700000000000&&c.at<=Date.now()+300000&&['zh-Hant','en'].includes(c.language)&&(run?.startedAt==null||c.at<=run.startedAt);
}
