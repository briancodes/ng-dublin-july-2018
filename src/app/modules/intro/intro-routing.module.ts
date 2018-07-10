import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IntroPageComponent } from './containers/intro-page/intro-page.component';

const routes: Routes = [
    {path: 'intro', component: IntroPageComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IntroRoutingModule { }
