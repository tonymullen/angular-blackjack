import { Component, OnInit, Input, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { GameStateService } from '../services/game-state.service';
import { CardComponent } from '../card-component/card.component';
import { Card } from '../shared/card';

@Component({
  selector: 'app-hand',
  templateUrl: './hand.component.html',
  styleUrls: ['./hand.component.css']
})
export class HandComponent implements OnInit {
  @Input() dealer:boolean = false;
  @ViewChildren(CardComponent) cardComponents: QueryList<CardComponent>;

  public cards: Card[] = [];

  constructor(
    private gameStateService: GameStateService,
    private cdRef : ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.dealer) {
      this.cards = this.gameStateService.dealerCards;
    } else {
      this.cards = this.gameStateService.playerCards;
    }
  }

  ngAfterViewInit() {
    if (this.dealer) {
      this.cardComponents.changes.subscribe(
        () =>{
          if ( this.cardComponents.length === 2 ) {
            this.cardComponents.first.rotate();
            this.cdRef.detectChanges(); 
          }
        }
      )
    }
  }

}
