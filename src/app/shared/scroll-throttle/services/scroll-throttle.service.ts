import { Platform } from '@angular/cdk/platform';
import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { fromEvent, interval, Observable, of as observableOf, Subject, SubscriptionLike } from 'rxjs';
import { ThrottleConfig } from 'rxjs/internal/operators/throttle';
import { throttle } from 'rxjs/operators';

export enum ScrollThrottleEnum {
    NONE = 'None',
    THROTTLE = 'Throttle',
    DYNAMIC_THROTTLE = 'Dynamic Throttle'
}

export abstract class AbstractScrollService {
    abstract onScroll(throttleType: ScrollThrottleEnum, throttleValue?: number | Function, config?: ThrottleConfig): Observable<Event | void>;
    abstract get isRunOutsideAngular(): boolean;
    abstract set isRunOutsideAngular(value: boolean);
    abstract get defaultThrottleTime(): number;
    abstract set defaultThrottleTime(value: number);
}

@Injectable()
export class ScrollThrottleService implements OnDestroy, AbstractScrollService {

    private _scrollSubject: Subject<Event> = new Subject();
    /** Subscription to the document scroll. When unsubscribed, the event listener is removed **/
    private _fromEventSubscription: SubscriptionLike;
    private _scrollFromEvent$: Observable<Event>;
    private _defaultThrottleTime = 1000;
    private _isRunOutsideAngular: boolean;
    private _subjectSubscriberCount = 0;

    constructor(private platform: Platform, private ngZone: NgZone) {

    }

    // Note: there is currently an issue with ngOnDestroy not called for services
    // provided with 'useClass'. Has been fixed in https://github.com/angular/angular/issues/14818
    ngOnDestroy() {
        this.removeScrollListener();
        this._scrollSubject.complete();
    }

    get isRunOutsideAngular(): boolean {
        return this._isRunOutsideAngular;
    }
    set isRunOutsideAngular(value: boolean) {
        this._isRunOutsideAngular = value;
        this.resetScrollListener();
    }

    set defaultThrottleTime(value: number) {
        this._defaultThrottleTime = value;
    }

    get defaultThrottleTime(): number {
        return this._defaultThrottleTime;
    }

    /**
     * Subscribe to global scroll events
     *
     * @returns Observable<Event | void>
     * @param throttleType ScrollThrottleEnum
     * @param throttleValue number | Function Provide a callback function if using Dynamic Throttle
     * @param config ThrottleConfig
     */
    onScroll(throttleType: ScrollThrottleEnum, throttleValue?: number | Function, config?: ThrottleConfig): Observable<Event | void> {

        // setup some defaults, in case of mismatched parameters
        let scopedThrottleTime: number;
        let throttleCallback: Function = () => this._defaultThrottleTime;

        if (typeof throttleValue === 'function') {
            throttleCallback = throttleValue;
        }
        else if (typeof throttleValue === 'number') {
            scopedThrottleTime = throttleValue >= 0 ? throttleValue : 0;
        }

        if (throttleType === ScrollThrottleEnum.DYNAMIC_THROTTLE && !throttleCallback) {
            console.warn('Dynamic Throttle with no callback function!');
        }

        if (!this.platform.isBrowser) {
            // import {of as observableOf} from rxjs (calling it 'of', some nerve eh!)
            return observableOf<void>();
        }
        else {
            if (!this._fromEventSubscription) {
                this.setupScrollListener();
            }
            // Create the observable to subscribe to the _scrollSubject
            let obs$ = Observable.create((observer) => {
                let subscription: SubscriptionLike;
                switch (throttleType) {
                    case ScrollThrottleEnum.NONE:
                        subscription = this._scrollSubject.subscribe(observer);
                        break;
                    case ScrollThrottleEnum.THROTTLE:
                        subscription = this._scrollSubject
                            .pipe(
                                // if no config rxjs uses strict equality check for undefined
                                // Default throttleConfig == {leading:true, trailing:false}
                                throttle(() => {
                                    return interval(scopedThrottleTime ? scopedThrottleTime : this.defaultThrottleTime);
                                }, config ? config : void 0)
                            )
                            .subscribe(observer);
                        break;
                    case ScrollThrottleEnum.DYNAMIC_THROTTLE:
                        subscription = this._scrollSubject
                            .pipe(
                                throttle(() => {
                                    return interval(throttleCallback());
                                }, config ? config : void 0)
                            )
                            .subscribe(observer);
                        break;
                    default:
                        // same as ScrollThrottleEnum.NONE:
                        subscription = this._scrollSubject.subscribe(observer);
                        break;
                }

                this._subjectSubscriberCount++;

                // Called on observer subscription unsubscribe()
                return () => {
                    subscription.unsubscribe();
                    this._subjectSubscriberCount--;
                    if (!this._subjectSubscriberCount) {
                        this.removeScrollListener();
                    }
                };
            });

            return obs$;
        }
    }

    private resetScrollListener() {
        if (this._fromEventSubscription) {
            this.setupScrollListener();
        }
    }

    private setupScrollListener() {

        if (this._fromEventSubscription) { this._fromEventSubscription.unsubscribe(); }

        if (!this._scrollFromEvent$) {
            this._scrollFromEvent$ = fromEvent(window.document, 'scroll', { passive: true });
        }
        if (this._isRunOutsideAngular) {
            this.ngZone.runOutsideAngular(() => {
                this._fromEventSubscription = this._scrollFromEvent$
                    .subscribe((event) => this._scrollSubject.next(event));
            });
        }
        else {
            this._fromEventSubscription = this._scrollFromEvent$
                .subscribe((event) => this._scrollSubject.next(event));
        }

    }

    private removeScrollListener() {
        if (this._fromEventSubscription) {
            this._fromEventSubscription.unsubscribe();
            this._fromEventSubscription = null;
        }
    }

}
