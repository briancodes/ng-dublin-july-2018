import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EventVizComponent } from './components/event-viz/event-viz.component';
import { EventVizContainerComponent } from './containers/event-viz-container/event-viz-container.component';
import { ControlsComponent } from './components/controls/controls.component';
import { CustomMaterialModule } from '../../shared/modules/custom-material/custom-material.module';

@NgModule({
    imports: [
        CommonModule,
        CustomMaterialModule
    ],
    declarations: [EventVizComponent, EventVizContainerComponent, ControlsComponent],
    exports: [EventVizComponent, EventVizContainerComponent, ControlsComponent, EventVizContainerComponent]
})
export class EventVizModule { }
