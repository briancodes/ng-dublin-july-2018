import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { InstanceId } from '../../../../shared/utils/instance-id';

export interface IEventData {
    type: string;
    data: any;
}

/**
 * Extend this abstract class for utilizing restricted DI provider tokens
 */
export abstract class AbstractBaseEventServiceDispatcher {
    abstract dispatch(type: string, data: any): void;
}

/**
 * Extend this abstract class for utilizing restricted DI provider tokens
 */
export abstract class AbstractBaseEventServiceListener {
    abstract on(type: string): Observable<IEventData>;
}

export abstract class BaseEventService extends InstanceId implements AbstractBaseEventServiceDispatcher, AbstractBaseEventServiceListener, OnDestroy {

    private eventDispatchSubject = new Subject<IEventData>();
    private subjectMap = new Map<string, Subject<IEventData>>();

    constructor() {
        super();
        let originalOnDestroy = this.ngOnDestroy;
        this.ngOnDestroy = () => {
            this.destroy();
            originalOnDestroy.apply(this);
        };
    }

    ngOnDestroy(): void {
        // noop
    }

    private destroy() {
        this.subjectMap.forEach((value, key) => {
            value.complete(); // unsubscribe any observers: from on()
            this.subjectMap.delete(key);
        });
        this.eventDispatchSubject.complete(); // unsubscribe observers: from createObservable(), onAll()
    }

    private createObservable(eventType: string): Observable<IEventData> {
        let subject: Subject<IEventData>;
        if (!this.subjectMap.has(eventType)) {
            subject = new Subject();
            this.subjectMap.set(eventType, subject);

            this.eventDispatchSubject.asObservable()
                .pipe(
                    filter(value => value.type === eventType)
                )
                .subscribe(value => {
                    subject.next(value);
                });
        }
        else {
            subject = this.subjectMap.get(eventType);
        }
        return subject.asObservable(); // TODO: use Observable.create() for multicasting @see ScrollThrottleService
    }

    /**
     *
     * @param type string | enum
     * @param data
     */
    dispatch(type: string, data: any) {
        this.eventDispatchSubject.next({ type, data });
    }

    /**
     * @param type string | enum
     */
    on(type: string): Observable<IEventData> {
        return this.createObservable(type);
    }

    onAll(): Observable<IEventData> {
        return this.eventDispatchSubject.asObservable();
    }

    /**
     * Count of all subscriptions made via on(), optionally by type.
     * Note: does not include subscription made via onAll()
     * @param type
     */
    subscriberCount(type?: string): number {
        let count = 0;
        if (this.subjectMap.size > 0) {
            if (type) {
                let subject = this.subjectMap.get(type);
                count = subject && subject.observers && subject.observers.length || 0;
            }
            else {
                this.subjectMap.forEach((subject, key) => {
                    count += subject && subject.observers && subject.observers.length || 0;
                });
            }
        }
        return count;
    }

}
