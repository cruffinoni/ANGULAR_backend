export enum EventType {
  MoveRight = "right",
  MoveLeft = "left",
  Jump = "jump",
  Crouch = "crouch",
  AttackFeet = "feet",
  AttackHand = "hand",
  AttackThrow = "throw",
  Idle = "idle",
}

export interface BattlePackage {
    userID?: string,
    userIdx?: number
    position: {
        x: number,
        y: number
    }
    state: string
}
