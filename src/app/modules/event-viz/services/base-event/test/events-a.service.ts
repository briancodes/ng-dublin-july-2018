import { BaseEventService } from '../base-event.service';
import { OnDestroy } from '@angular/core';

export enum TestAEnum {
    ONE = 'event1',
    TWO = 'event2'
}
export class EventsAService extends BaseEventService implements OnDestroy {

    testObject = {};
    constructor() {
        super();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.testObject = null;
    }
}
