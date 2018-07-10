import { Injectable, NgZone } from '@angular/core';
import { AbstractBaseEventServiceDispatcher, AbstractBaseEventServiceListener, BaseEventService } from './base-event/base-event.service';
import { timer } from 'rxjs';

export abstract class AbstractVizDispatcher extends AbstractBaseEventServiceDispatcher {
     /**
     * Dispatch and event, running outside of angular by default
     * @param type
     * @param data
     * @param runOutsideAngular defaults to true
     * @param async defaults to false. Only applied if runOutsideAngular is true
     */
    abstract dispatch(type: string, data: any, runOutsideAngular?: boolean, async?: boolean);
}

export abstract class AbstractVizListener extends AbstractBaseEventServiceListener{

}

@Injectable()
export class EventVizService extends BaseEventService implements AbstractVizDispatcher {

    constructor(private ngZone: NgZone) {
        super();
    }

    // overriding the dispatch(), adding runOutsideAngular optional param
    dispatch(type: string, data: any, runOutsideAngular: boolean = true, async: boolean = false) {
        if (runOutsideAngular){
            this.ngZone.runOutsideAngular(() => {
                if (!async){
                    super.dispatch(type, data);
                }
                else{
                    // Rxjs uses setInterval() internally @see \rxjs\_esm5\internal\scheduler\AsyncAction.js
                    // Fix for issue https://github.com/briancodes/angular-dublin-demo/issues/10
                    timer(0).subscribe(() => {
                        super.dispatch(type, data);
                    });
                }

            });
        }
        else {
            super.dispatch(type, data);
        }
    }
}


