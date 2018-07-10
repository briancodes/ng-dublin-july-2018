import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DemoPageComponent } from './containers/demo-page/demo-page.component';


const routes: Routes = [
    { path: 'demo', component: DemoPageComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DemoRoutingModule { }
