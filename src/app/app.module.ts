import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DemoModule } from './modules/demo/demo.module';
import { EventVizModule } from './modules/event-viz/event-viz.module';
import { AbstractVizDispatcher, AbstractVizListener, EventVizService } from './modules/event-viz/services/event-viz.service';
import { IntroModule } from './modules/intro/intro.module';
import { CustomMaterialModule } from './shared/modules/custom-material/custom-material.module';
import { ScrollThrottleService, AbstractScrollService } from './shared/scroll-throttle/services/scroll-throttle.service';


@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        CustomMaterialModule,
        DemoModule,
        IntroModule,
        EventVizModule
    ],
    providers: [
        // Event Vizualization
        {provide: AbstractVizDispatcher, useClass: EventVizService},
        {provide: AbstractVizListener, useExisting: AbstractVizDispatcher},
        // Scroll Throttle Service
        { provide: AbstractScrollService, useClass: ScrollThrottleService }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
