import { Component, OnInit, Input } from '@angular/core';
import { Card } from '../services/dealer.service';
import { GameStateService } from '../services/game-state.service';

@Component({
  selector: 'app-hand',
  templateUrl: './hand.component.html',
  styleUrls: ['./hand.component.css']
})
export class HandComponent implements OnInit {
  @Input() dealer:boolean = false;
  public cards: Card[] = [];

  constructor(
    private gameStateService: GameStateService
  ) {}

  ngOnInit() {
    if (this.dealer) {
      this.cards = this.gameStateService.dealerCards;
    } else {
      this.cards = this.gameStateService.playerCards;
    }
  }
}
