import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card-view.component.html',
  styleUrls: ['./card-view.component.scss']
})
export class CardComponent implements OnInit {
  @Input() suit: string;
  @Input() face: string;
  @Input() flip: boolean;

  //flip: boolean = false;
  rotate(){
    this.flip = !this.flip;
  }

  ngOnInit() {
    //this.flip = false
  }
}

