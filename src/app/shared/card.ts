export class Card {
    _value: number;
    _suit: string;
    _face: string;
    _flip: boolean;
  
    constructor(suit: string, face: string) {
      this._suit = suit;
      this._face = face;
      this._flip = false;
    }
  
    public get suit(): string {
      return this._suit;
    }
  
    public get face(): string {
      return this._face;
    }
  
    public get value(): number {
      return (this.face === 'king'  || 
              this.face === 'queen' || 
              this.face === 'jack') ? 10 : Number(this.face) 
    }
  
    public get flip(): boolean{
      return this._flip;
    }
  
    public set flip(f: boolean) {
      this._flip = f;
    }
  }
