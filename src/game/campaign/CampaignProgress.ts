import type { LevelId } from "../levels/engine/LevelTypes";

export type Medal = "bronze" | "silver" | "gold";
export type LevelRun = { score: number; timeMs: number; energy: number; perfect: number; secrets: number; medal: Medal };
export type LevelProgressEntry = {
  completed: boolean; bestScore: number; bestEnergy: number; bestPerfect: number; bestSecrets: number; bestTimeMs: number; medal: Medal | null; completions: number; topRuns: LevelRun[];
};
type StoredCampaign = { unlocked: number; levels: Partial<Record<LevelId, LevelProgressEntry>> };
const STORAGE_KEY = "calidadei-paco-phaser4-campaign-v2";
const LEGACY_KEY = "calidadei-paco-phaser4-campaign-v1";
const DEFAULT_ENTRY: LevelProgressEntry = { completed:false,bestScore:0,bestEnergy:0,bestPerfect:0,bestSecrets:0,bestTimeMs:0,medal:null,completions:0,topRuns:[] };
const rank: Record<Medal, number> = { bronze:1, silver:2, gold:3 };

class CampaignProgressStore {
  private state: StoredCampaign = { unlocked:1, levels:{} };
  load() {
    if (typeof window === "undefined") return this.state;
    try { const raw=window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_KEY); if(raw){ const parsed=JSON.parse(raw) as StoredCampaign; if(parsed?.levels) this.state={unlocked:Math.max(1,Math.min(10,Math.floor(parsed.unlocked||1))),levels:parsed.levels}; } } catch {}
    return this.state;
  }
  private save(){ if(typeof window!=="undefined") window.localStorage.setItem(STORAGE_KEY,JSON.stringify(this.state)); }
  isUnlocked(i:number){ return i<this.state.unlocked; }
  getUnlockedCount(){ return this.state.unlocked; }
  getLevel(id:LevelId):LevelProgressEntry { return this.state.levels[id] ?? DEFAULT_ENTRY; }
  private medalFor(timeMs:number,targetDurationSec:number,perfect:number,secrets:number):Medal {
    const target=targetDurationSec*1000;
    if(timeMs<=target*1.08 && perfect>=2 && secrets>=1) return 'gold';
    if(timeMs<=target*1.22 || perfect>=2) return 'silver';
    return 'bronze';
  }
  completeLevel(id:LevelId,levelIndex:number,stats:{score:number;energy:number;perfect:number;secrets:number;timeMs:number;targetDurationSec:number}){
    const prev=this.getLevel(id); const medal=this.medalFor(stats.timeMs,stats.targetDurationSec,stats.perfect,stats.secrets);
    const run:LevelRun={score:stats.score,timeMs:stats.timeMs,energy:stats.energy,perfect:stats.perfect,secrets:stats.secrets,medal};
    const topRuns=[...(prev.topRuns||[]),run].sort((a,b)=>b.score-a.score||a.timeMs-b.timeMs).slice(0,5);
    const bestMedal=!prev.medal||rank[medal]>rank[prev.medal]?medal:prev.medal;
    this.state.levels[id]={completed:true,bestScore:Math.max(prev.bestScore,stats.score),bestEnergy:Math.max(prev.bestEnergy,stats.energy),bestPerfect:Math.max(prev.bestPerfect,stats.perfect),bestSecrets:Math.max(prev.bestSecrets,stats.secrets),bestTimeMs:prev.bestTimeMs?Math.min(prev.bestTimeMs,stats.timeMs):stats.timeMs,medal:bestMedal,completions:prev.completions+1,topRuns};
    this.state.unlocked=Math.max(this.state.unlocked,Math.min(10,levelIndex+2)); this.save();
  }
  resetCampaign(){ this.state={unlocked:1,levels:{}}; this.save(); }
}
export const CampaignProgress=new CampaignProgressStore();
