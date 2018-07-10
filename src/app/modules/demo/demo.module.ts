import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DemoPageComponent } from './containers/demo-page/demo-page.component';
import { DemoRoutingModule } from './demo-routing.module';
import { DemoControlsComponent } from './components/demo-controls/demo-controls.component';
import { CustomMaterialModule } from '../../shared/modules/custom-material/custom-material.module';

@NgModule({
    imports: [
        CommonModule,
        CustomMaterialModule,
        DemoRoutingModule
    ],
    declarations: [DemoPageComponent, DemoControlsComponent],
    providers: []
})
export class DemoModule { }
