import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IntroRoutingModule } from './intro-routing.module';
import { IntroPageComponent } from './containers/intro-page/intro-page.component';

@NgModule({
  imports: [
    CommonModule,
    IntroRoutingModule
  ],
  declarations: [IntroPageComponent]
})
export class IntroModule { }
