import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { CardComponent } from './card/card.component';
import { FlipComponent } from './flip/flip.component';
import { HandComponent } from './hand/hand.component';
import { ButtonPanelComponent } from './button-panel/button-panel.component';

import { DealerService } from './services/dealer.service';
import { GameStateService } from './services/game-state.service';

@NgModule({
  declarations: [
    AppComponent,
    CardComponent,
    FlipComponent,
    HandComponent,
    ButtonPanelComponent
  ],
  imports: [
    BrowserModule,
  ],
  providers: [
    DealerService,
    GameStateService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
