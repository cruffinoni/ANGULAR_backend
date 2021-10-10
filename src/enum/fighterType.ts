enum fighterState {
  WALKING_FRONT,
  WALKING_BACK,
  WAITING,
  JUMPING,
}

type position = {
  x: number;
  y: number;
};

type FighterType = {
  hpMax: number; // max health point
  currentHp: number; // current hp
  ms: number; // movement speed
  handDamage: number; // damage of an hit with hand attack
  feetDamage: number; // damage of an hit with feet attack
  throwDamage: number; // damage of an hit with throw attack
  state: fighterState; // current state of the fighter
  position: position; // current position of the fighter
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Ryu extends FighterType {
  hpMax: 150;
  currentHp: 150;
  ms: 50;
  handDamage: 20;
  feetDamage: 40;
  throwDamage: 20;
  state: fighterState.WAITING;
  position: { x: 0; y: 0 };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ChunLi extends FighterType {
  hpMax: 100;
  currentHp: 100;
  ms: 70;
  handDamage: 30;
  feetDamage: 40;
  throwDamage: 30;
  state: fighterState.WAITING;
  position: { x: 0; y: 0 };
}
