import { Component } from '@angular/core';
import { DealerService } from '../services/dealer.service';
import { GameStateService } from '../services/game-state.service';

@Component({
  selector: 'app-button-panel',
  templateUrl: './button-panel.component.html',
  styleUrls: ['./button-panel.component.css']
})
export class ButtonPanelComponent {

  constructor(
    private dealerService: DealerService,
    public gameStateService: GameStateService
  ) {}  

  public deal(): void {
    this.dealerService.deal();
    this.gameStateService.gameState = 'Dealing';
  }

  public hit(): void {
    this.dealerService.hit();
  }

  public stay(): void {
    this.dealerService.stay()
  }

}
