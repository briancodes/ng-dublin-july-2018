import { Component, OnInit, ViewEncapsulation, Output, EventEmitter, Input, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ScrollThrottleEnum } from '../../../../shared/scroll-throttle/services/scroll-throttle.service';
import { MatCheckboxChange, MatSelectChange } from '@angular/material';

@Component({
    selector: 'bc-demo-controls',
    template: `
        <div class="demo-controls" [ngClass]="{'hide-controls': hideControls}">
            <!--   -->
            <mat-select [value]="initialThrottleSelection"
                    panelClass="throttle-panel" aria-label="Scroll Options"
                    (selectionChange)="optionChangeHandler($event)">
                <mat-option *ngFor="let option of options" [value]="option.value">
                  {{ option.name }}
                </mat-option>
            </mat-select>
            <input *ngIf="showNumberInput" class="number-input" type="number" step="10" min="0"
                [value]="initialThrottleValue"
                (input)="numberInputChangeHandler($event)">
            <mat-checkbox [checked]="initialRunOutsideChecked"
                    class="run-checkbox"
                    (change)="runOutsideClickHandler($event)"
                    [labelPosition]="'after'" >
                    Run Outside Angular
            </mat-checkbox>
        </div>
    `,
    styleUrls: ['./demo-controls.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoControlsComponent implements OnInit{

    @Output() runOutsideAngularEvent: EventEmitter<boolean> = new EventEmitter();
    @Output() throttleSelectionEvent: EventEmitter<ScrollThrottleEnum> = new EventEmitter();
    @Output() throttleTimeChangeEvent: EventEmitter<number> = new EventEmitter();

    @Input() options = [
        {value: ScrollThrottleEnum.NONE, name: 'Default'},
        {value: ScrollThrottleEnum.THROTTLE, name: 'Throttle'},
        {value: ScrollThrottleEnum.DYNAMIC_THROTTLE, name: 'Dynamic Throttle'}
    ];

    @Input() initialThrottleValue = 80; // override with @Input() initialThrottleValue
    @Input() hideControls = false;

    initialThrottleSelection = ScrollThrottleEnum.NONE;
    initialRunOutsideChecked = false;
    showNumberInput = true;

    constructor() { }

    ngOnInit() {
        this.showNumberInput = this.initialThrottleSelection !== ScrollThrottleEnum.NONE;
    }

    optionChangeHandler(event: MatSelectChange) {
        this.showNumberInput = event.value !== ScrollThrottleEnum.NONE;
        this.throttleSelectionEvent.emit(event.value);
    }

    runOutsideClickHandler(event: MatCheckboxChange) {
        this.runOutsideAngularEvent.emit(event.checked);
    }

    numberInputChangeHandler(event: Event) {
        let value = (event.target as HTMLInputElement).value;
        let time = Number(value); // returns 0 for ""

        this.throttleTimeChangeEvent.emit(time);
    }

}
