import { Injectable  } from '@angular/core';
import { DealerService, Card } from './dealer.service';

const RESTART_WAIT: number = 3000;
const MESSSAGE_WAIT: number = 1000;

enum States {
  Start,  Dealing,  Dealt,  Stay, Blackjack,  Win,  Lose, Tie,  Bust
};

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private playerScore: number;
  private dealerScore: number;
  private playerHasAce: boolean;
  private dealerHasAce: boolean;
  private playerStays: boolean;
  private dealerStays: boolean;

  private _gameState: States;
  private _playerCards: Card[] = [];
  private _dealerCards: Card[] = [];

  constructor(
    private dealerService: DealerService,
  ) {
    this.setup();
  }

  get dealerCards(): Card[] {
    return this._dealerCards;
  }

  get playerCards(): Card[] {
    return this._playerCards;
  }

  get gameState(): string {
    return States[this._gameState];
  }

  set gameState(s: string) {
    this._gameState = States[s];
  }

  setUpSubscription(): void {
    // Subscribe to the deal$ observable
    this.dealerService.deal$.subscribe(c => {
      // Every time an item is received from deal$
      // Make sure it's a card, not a trigger
      if(Array.isArray(c)) {
        // Extract card from observable
        let card = c[1][1]

        // Dealer card received
        if (c[1][0] === 'd') {
          this._dealerCards.push(card);
          if (card.value === 1) { this.dealerHasAce = true }
          this.dealerScore += card.value;

          if ( this.dealerShouldHit() ) {
            setTimeout(() => {
              this.dealerService.dealToDealer();
            }, MESSSAGE_WAIT);
          } else if ( this.playerStays ) {
            this.dealerStays = true;
            this.calculateGameState();
          }

        // Player card received
        } else if ( c[1][0] === 'p') {
          this._playerCards.push(card);
          if (card.value === 1) { this.playerHasAce = true }
          this.playerScore += card.value;
        }
        if (this.blackjack()){
          this.gameState = 'Blackjack';
        }
        if (this.bust()){
          this.gameState = 'Bust';
        }

        // Update game state
        this.calculateGameState();
      }
    });
  }

  calculateGameState():void {
    // If exactly 4 cards have been dealt
    if (this.firstCardsJustDealt()) {

      // Blackjack
      if ( this.blackjack()) {
        if (!this.playerBlackjack()) {
          setTimeout(() => { 
            this.gameState = 'Lose';
            this.restart();
           }, MESSSAGE_WAIT)
        }
        else if (!this.dealerBlackjack()) {
          setTimeout(() => { 
            this.gameState = 'Win';
            this.restart();
           }, MESSSAGE_WAIT)
        }
        else {
          setTimeout(() => { 
            this.gameState = 'Tie';
            this.restart();
           }, MESSSAGE_WAIT)
        }
      }
      // Bust
      else if ( this.bust() ) {
        this.gameState = 'Bust';

        if(!this.playerBust()) {
          setTimeout(() => { 
            this.gameState = 'Win';
            this.restart();
           }, MESSSAGE_WAIT)
        }

        if(!this.dealerBust()) {
          setTimeout(() => { 
            this.gameState = 'Lose';
            this.restart();
           }, MESSSAGE_WAIT)
        }
      } else {
        this.gameState = 'Dealt';
      }
      // In case both stay after 2 cards
      if ( this.playerStays &&  this.dealerStays ) {
        this.scoreAfterBothStay();
      }
    }

    // After the first four cards are dealt
    else {
      // If player and dealer have stayed
      if ( this.playerStays &&  this.dealerStays ) {
        this.scoreAfterBothStay();
      }

      // Otherwise, if bust before staying
      else if ( this.playerBust() ) {
        this.gameState = 'Bust';
        setTimeout(() => { 
          this.gameState = 'Lose';
          this.restart();
        }, MESSSAGE_WAIT)
      } else if ( this.dealerBust() ) {
        setTimeout(() => { 
          this.gameState = 'Win';
          this.restart();
        }, MESSSAGE_WAIT)
      }
    }
  }

  scoreAfterBothStay():void {
    console.log('After stay');
    if ( this.dealerBust() ) {
      this.gameState = 'Bust';
      setTimeout(() => { 
        this.gameState = 'Win';
        this.restart();
      }, MESSSAGE_WAIT)
    } else {
      if ( this.playerScore <= 11 && this.playerHasAce ) {
        this.playerScore += 10;
      }
      if ( this.dealerScore <= 11 && this.dealerHasAce ) {
        this.dealerScore += 10;
      }
      if ( this.playerScore > this.dealerScore ) {
        this.gameState = 'Win';
      } else if ( this.playerScore < this.dealerScore ) {
        this.gameState = 'Lose';
      } else {
        this.gameState = 'Tie';
      }
    }
    this.restart();
  }

  playerBust(): boolean {
    return this.playerScore > 21
  }

  dealerBust(): boolean {
    return this.dealerScore > 21
  }

  bust(): boolean {
    return (this.playerBust() || this.dealerBust())
  }

  playerBlackjack(): boolean {
    return (this._playerCards.length === 2
          && this.playerHasAce
          && this.playerScore === 11);
  }

  dealerBlackjack(): boolean {
    return (this._playerCards.length === 2 
          && this.dealerHasAce
          && this.dealerScore === 11);
  }

  blackjack(): boolean {
    return (this.playerBlackjack() || this.dealerBlackjack())
  }

  firstCardsJustDealt(): boolean {
    return (this._playerCards.length === 2 &&
            this._dealerCards.length === 2)
  }

  public deal(): void {
    this.dealerService.deal();
    this.gameState = 'Dealing';
  }

  public hit(): void {
    this.dealerService.hit();
  }

  public stay(): void {
    this.playerStays = true;
    this.gameState = 'Stay';
    if ( this.dealerShouldHit() ) {
      this.dealerService.dealToDealer();
    } else {
      this.dealerStays = true;
      this.calculateGameState();
    }
  }

  dealerShouldHit(): boolean {
    return ( this.playerStays && 
          (this.dealerScore < 17 || 
          (this.dealerHasAce && this.dealerScore < 27)));
  }

  setup(): void {
    this.playerScore = 0;
    this.dealerScore = 0;
    this.playerHasAce = false;
    this.dealerHasAce = false;
    this.playerStays = false;
    this.dealerStays = false;
    this.gameState = 'Start'
    this.setUpSubscription();
  }

  restart(): void {
    this.logLastGame();
    setTimeout(() => {
      this.dealerService.freshDeck();
      // clear the arrays while keeping the reference
      this._playerCards.length = 0;
      this._dealerCards.length = 0;
      this.setup();
    }, RESTART_WAIT);
  }

  logLastGame(): void {
    console.log('Game')
    console.log(`Dealer cards: `);
    this._dealerCards.forEach(c => {
      console.log(`    ${c.face} of ${c.suit}s`);
    })
    console.log(`Player cards: `);
    this._playerCards.forEach(c => {
      console.log(`    ${c.face} of ${c.suit}s`);
    })
    console.log(`Dealer total: ${this.dealerScore}`);
    console.log(`Player total: ${this.playerScore}`);
    console.log(`Final state: ${this.gameState}`);
    console.log();
  }
}

