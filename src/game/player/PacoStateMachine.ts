export type PacoState = "run" | "prejump" | "rise" | "apex" | "fall" | "land" | "boost" | "celebrate" | "dead";

export class PacoStateMachine {
  state: PacoState = "run";
  previous: PacoState = "run";
  changedAt = 0;

  set(next: PacoState, now: number) {
    if (next === this.state) return false;
    this.previous = this.state;
    this.state = next;
    this.changedAt = now;
    return true;
  }
}
