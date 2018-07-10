import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'bc-intro-page',
  template: `
    <a routerLink="/demo">Demo</a>
  `,
  styleUrls: ['./intro-page.component.scss']
})
export class IntroPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
