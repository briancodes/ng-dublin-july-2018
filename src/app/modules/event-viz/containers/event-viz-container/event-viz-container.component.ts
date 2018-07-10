import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

export enum VizEventTypeEnum {
    Scroll = 'VizEventTypeEnum.Scroll',
    ChangeDetection = 'VizEventTypeEnum.ChangeDetection',
    ClearCounters = 'VizEventTypeEnum.ClearCounters'
}

@Component({
    selector: 'bc-event-viz-container',
    template: `
        <div class="fixed-container">
            <bc-event-viz *ngIf="displayChangeDetection"
                    [vizEventType]="cdEventTypeEnum"
                    [clearEventType]="clearEventType"
                    [eventColor]="'pink'"
                    [eventIndicatorLayout]="{eventLeft: 0, eventBottom: 0, panelHeightEm: panelHeightEm}"
                    [paused]="isPaused"
                    [toggleClear]="toggleClear">
            </bc-event-viz>
            <bc-event-viz *ngIf="displayScrollEvents"
                    [vizEventType]="scrollEventTypeEnum"
                    [clearEventType]="clearEventType"
                    [eventColor]="'powderblue'"
                    [eventIndicatorLayout]="{eventLeft: 0, eventBottom: 0, panelHeightEm: panelHeightEm}"
                    [paused]="isPaused"
                    [toggleClear]="toggleClear">
            </bc-event-viz>
            <div *ngIf="!displayScrollEvents" class="placeholder" [style.height.em]="panelHeightEm"></div>
        </div>
        <bc-controls
            (displayChangeDetectionChange)="changeDetectionClickHandler($event)"
            (displayScrollEventsChange)="scrollEventsClickHandler($event)"
            (clearClick)="clearClickHandler($event)"
            (pauseChange)="pauseClickHandler($event)"
        >
        </bc-controls>
    `,
    styleUrls: ['./event-viz-container.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventVizContainerComponent implements OnInit {

    cdEventTypeEnum = VizEventTypeEnum.ChangeDetection;
    scrollEventTypeEnum = VizEventTypeEnum.Scroll;
    clearEventType = VizEventTypeEnum.ClearCounters;

    panelHeightEm = 4.5;

    displayChangeDetection = false;
    displayScrollEvents = false;
    isPaused = false;
    toggleClear = true;

    constructor() { }

    ngOnInit() {
    }

    changeDetectionClickHandler(event: boolean) {
        this.displayChangeDetection = event;
    }

    scrollEventsClickHandler(event: boolean) {
        this.displayScrollEvents = event;
    }

    clearClickHandler(event: boolean) {
        this.toggleClear = !this.toggleClear;
    }

    pauseClickHandler(event: boolean) {
        this.isPaused = event;
    }

}
