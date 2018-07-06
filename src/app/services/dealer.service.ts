import { Injectable } from '@angular/core';
import { Observable, Subject, from, timer, zip  } from 'rxjs';
import { concat } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DealerService {
  // $ suffix is a convention for naming observables
  deal$: Observable<any>;

  private suits = ['heart', 'diamond', 'spade', 'club'];
  private faces = [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'];

  //distribution$ determines whether cards go to player or dealer;
  private distribution$: Subject<string>;
  private trigger$: Subject<boolean>;

  private deck: Card[];

  constructor() {
    this.freshDeck();
    //this.deal();
  }

  public freshDeck(): void {
    // this.deck = [
    //   new Card('heart', 'king'),
    //   new Card('spade', '10'),
    //   new Card('spade', '1'),
    //   new Card('heart', '1'),     
    // ]
    // this.deck = [
    //   new Card('heart', '2'),
    //   new Card('spade', 'king'),
    //   new Card('spade', '1'),
    //   new Card('heart', '1'),     
    // ]
    // this.deck = [
    //   new Card('heart', 'king'),
    //   new Card('spade', '2'),
    //   new Card('spade', '1'),
    //   new Card('heart', '1'),     
    // ]
    this.distribution$ = new Subject<string>();
    this.trigger$ = new Subject<boolean>();

    this.deck = shuffle<Card>(
    // Generate deck from suits and faces
       this.suits.map(s => 
        this.faces.map(f => 
          new Card(s, f)
        )
      ).reduce((accumulator, list) =>
        accumulator.concat(list)
      )
    );
    this.deck[1].flip = true;

    // The deal proper is queued up behind the trigger subject.
    this.deal$ = this.trigger$.pipe(concat(
          zip(
            timer(1000, 1000),
            // Create Observable from shuffled deck & distribution
            zip(
                this.distribution$, 
                from(this.deck)
              )
          )
        )
    )
  }

  public deal(): void {
    // feed and complete the trigger subject to release the deal
    this.trigger$.next(true);
    this.trigger$.complete();

    // initial distribution for the first 4 cards
    this.distribution$.next('p');
    this.distribution$.next('d');
    this.distribution$.next('p');
    this.distribution$.next('d');
  }

  public hit(): void {
    // add a player card to the distribution subject
    this.distribution$.next('p');
  }

  public dealToDealer(): void {
    // add a dealer card to the distribution subject
    this.distribution$.next('d');
  }
}

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

function shuffle<T>(array: T[]): T[]  {
  let currentInd = array.length, temp, randInd;
  while (0 !== currentInd) {
    randInd = Math.floor(Math.random() * currentInd);
    currentInd--;
    temp = array[currentInd];
    array[currentInd] = array[randInd];
    array[randInd] = temp;
  }
  return array;
}