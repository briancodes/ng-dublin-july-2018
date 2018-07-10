import { BaseEventService } from '../base-event.service';
import { OnDestroy } from '@angular/core';

export enum TestBEnum {
    THREE = 'event3',
    FOUR = 'event4'
}
export class EventsCService extends BaseEventService {

    constructor() {
        super();
    }

}
