import { Component } from '@angular/core';
import { GameStateService } from '../services/game-state.service';

@Component({
  selector: 'app-button-panel',
  templateUrl: './button-panel.component.html',
  styleUrls: ['./button-panel.component.css']
})
export class ButtonPanelComponent {

  constructor(
    public gameStateService: GameStateService
  ) {}  

  public deal(): void {
    this.gameStateService.deal();
  }

  public hit(): void {
    this.gameStateService.hit();
  }

  public stay(): void {
    this.gameStateService.stay()
  }

}
