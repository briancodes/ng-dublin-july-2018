import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { MatCheckboxChange } from '@angular/material';

export interface IControlProperties {
    changeDectection: boolean;
    scrollEvents: boolean;
    pause: boolean;
}

@Component({
    selector: 'bc-controls',
    template: `
        <div class="controls-container" [ngClass]="{ open: isOpen}" >
            <div class="menu-button" (click)="menuButtonClick($event)">
                <div class="arrow"></div>
            </div>
            <div class="controls">
                <mat-checkbox [checked]="defaultProperties.changeDectection"
                    (change)="changeDetectionClickHandler($event)"
                    class="cd-events-checkbox"
                    [labelPosition]="'after'">
                    Change Detection
                </mat-checkbox>
                <mat-checkbox [checked]="defaultProperties.scrollEvents"
                    (change)="scrollEventsClickHandler($event)"
                    class="scroll-events-checkbox"
                    [labelPosition]="'after'">
                    Scroll Events
                </mat-checkbox>
                <button class="pause-button" (click)="clearClickHandler($event)" mat-raised-button>Clear</button>
                <mat-checkbox [checked]="defaultProperties.pause"
                    (change)="pauseClickHandler($event)"
                    class="pause-checkbox"
                    [labelPosition]="'after'" >
                    Pause
                </mat-checkbox>
            </div>
        </div>
    `,
    styleUrls: ['./controls.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ControlsComponent implements OnInit {

    @Output() displayChangeDetectionChange: EventEmitter<boolean> = new EventEmitter();
    @Output() displayScrollEventsChange: EventEmitter<boolean> = new EventEmitter();
    @Output() clearClick: EventEmitter<boolean> = new EventEmitter();
    @Output() pauseChange: EventEmitter<boolean> = new EventEmitter();

    @Input() defaultProperties: IControlProperties = {
        changeDectection: false,
        scrollEvents: false,
        pause: false
    };

    isOpen = false;

    constructor() { }

    ngOnInit() {
    }

    menuButtonClick(event: Event) {
        this.isOpen = !this.isOpen;
    }

    changeDetectionClickHandler(event: MatCheckboxChange) {
        this.displayChangeDetectionChange.emit(event.checked);
    }

    scrollEventsClickHandler(event: MatCheckboxChange) {
        this.displayScrollEventsChange.emit(event.checked);
    }

    clearClickHandler(event: Event) {
        this.clearClick.emit(true);
    }

    pauseClickHandler(event: MatCheckboxChange) {
        this.pauseChange.emit(event.checked);
    }

}
