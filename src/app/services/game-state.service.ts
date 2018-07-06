import { Injectable  } from '@angular/core';
import { DealerService, Card } from './dealer.service';

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
    this.dealerService.deal$.subscribe(c => {
      if(Array.isArray(c)) {
        let card = c[1][1]
        if (c[1][0] === 'd') {
          this._dealerCards.push(card);
          if (card.value === 1) { this.dealerHasAce = true }
          this.dealerScore += card.value;
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
        this.calculateGameState()
      }
    });
  }

  calculateGameState():void {
    if (this.firstCardsJustDealt()) {
      // Blackjack
      if ( this.blackjack()) {
        if (!this.playerBlackjack()) {
          setTimeout(() => { 
            this.gameState = 'Lose';
            this.restart();
           }, 1000)
        }
        else if (!this.dealerBlackjack()) {
          setTimeout(() => { 
            this.gameState = 'Win';
            this.restart();
           }, 1000)
        }
        else {
          setTimeout(() => { 
            this.gameState = 'Tie';
            this.restart();
           }, 1000)
        }
      }
      // Bust
      else if ( this.bust() ) {
        this.gameState = 'Bust';

        if(!this.playerBust()) {
          setTimeout(() => { 
            this.gameState = 'Win';
            this.restart();
           }, 1000)
        }

        if(!this.dealerBust()) {
          setTimeout(() => { 
            this.gameState = 'Lose';
            this.restart();
           }, 1000)
        }
      } else {
        this.gameState = 'Dealt';
      }
    } 
    // After the first four cards are dealt
    else if ( this.playerBust() ) {
      setTimeout(() => { 
        this.gameState = 'Lose';
        this.restart();
       }, 1000)
    } else if ( this.dealerBust() ) {
      setTimeout(() => { 
        this.gameState = 'Win';
        this.restart();
       }, 1000)
    }

    // Otherwise
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

  restart(): void {
    setTimeout(() => {
      this.dealerService.freshDeck();
      // clear the arrays while keeping the reference
      this._playerCards.length = 0;
      this._dealerCards.length = 0;
      this.setup();
    }, 3000);
  }

  setup(): void {
    this.playerScore = 0;
    this.dealerScore = 0;
    this.playerHasAce = false;
    this.dealerHasAce = false;
    this.gameState = 'Start'
    this.setUpSubscription();
  }
}

