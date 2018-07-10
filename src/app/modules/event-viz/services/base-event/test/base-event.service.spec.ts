import { TestBed, inject } from '@angular/core/testing';

import { BaseEventService, IEventData } from './../base-event.service';
import { EventsAService, TestAEnum } from './events-a.service';
import { EventsBService, TestBEnum } from './events-b.service';


import { SubscriptionLike as ISubscription } from 'rxjs';
import { EventsCService } from './events-c.service';

describe('BaseEventService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                EventsAService,
                EventsBService,
                EventsCService
            ]
        });
    });

    it('should subscribe, dispatch, destroy',
        inject([EventsAService, EventsBService, EventsCService],
            (aService: EventsAService, bService: EventsBService, cService: EventsCService) => {

            expect(aService).toBeTruthy();
            expect(bService).toBeTruthy(); // For testing ngOnDestroy
            expect(cService).toBeTruthy(); // For testing ngOnDestroy

            expect(aService['__instanceID']).not.toBe(bService['__instanceID']);
            expect(bService['__instanceID']).not.toBe(cService['__instanceID']);
            expect(cService['__instanceID']).not.toBe(aService['__instanceID']);

            /** Event Type key, with array of Subscriptions*/
            let typeSubMap = new Map<string, Array<ISubscription>>();
            /** Subscription key, with array of IEventData */
            let subResultMap = new Map<ISubscription, Array<IEventData>>();

            typeSubMap.set(TestAEnum.ONE, []);
            typeSubMap.set(TestAEnum.TWO, []);

            // typeSubMap will have two entries, with arrays of 5 subscriptions each
            // subResultMap will have 10 entries, with empty arrays of results
            for (let i = 0; i < 5; i++) {
                let sub1 = aService.on(TestAEnum.ONE)
                    .subscribe(value => {
                        subResultMap.get(sub1).push(value);
                    });
                let sub2 = aService.on(TestAEnum.TWO)
                    .subscribe(value => {
                        subResultMap.get(sub2).push(value);
                    });
                typeSubMap.get(TestAEnum.ONE).push(sub1);
                typeSubMap.get(TestAEnum.TWO).push(sub2);

                subResultMap.set(sub1, []);
                subResultMap.set(sub2, []);
            }

            expect(typeSubMap.get(TestAEnum.ONE).length).toBe(5);
            expect(typeSubMap.get(TestAEnum.TWO).length).toBe(5);

            // Test the Subscriber Count method
            expect(aService.subscriberCount()).toBe(10);
            expect(aService.subscriberCount(TestAEnum.ONE)).toBe(5);
            expect(aService.subscriberCount(TestAEnum.TWO)).toBe(5);

            // 10 events of each type dispatched. Handled by 10 subs (5 of each type)
            for (let j = 0; j < 10; j++) {
                aService.dispatch(TestAEnum.ONE, (j + 1));
                aService.dispatch(TestAEnum.TWO, ((j + 1) * -1));
            }

            expect(subResultMap.size).toBe(10);

            let runCount = 0;
            let eventHandledCount = 0;
            typeSubMap.forEach((subArray, key) => {
                expect(subArray.length).toBe(5);
                if (key === TestAEnum.ONE) {
                    // 5 TestAEnum.ONE subscriptions
                    subArray.forEach(sub => {
                        expect(subResultMap.get(sub)[0].data).toBe(1);
                        expect(subResultMap.get(sub)[9].data).toBe(10);
                        runCount++;
                        eventHandledCount += subResultMap.get(sub).length;
                    });
                }
                else {
                    // 5 TestAEnum.TWO subscriptions
                    subArray.forEach(sub => {
                        expect(subResultMap.get(sub)[0].data).toBe(-1);
                        expect(subResultMap.get(sub)[9].data).toBe(-10);
                        runCount++;
                        eventHandledCount += subResultMap.get(sub).length;
                    });
                }
            });
            expect(runCount).toBe(10);
            expect(eventHandledCount).toBe(100);

            // Clean up - ngOnDestroy with super.ngOnDestroy() in sub class
            expect(aService.testObject).toBeTruthy();
            aService.ngOnDestroy();
            expect(aService.testObject).toBeFalsy();

            expect(aService.subscriberCount()).toBe(0);
            subResultMap.forEach( (result, sub ) => {
                expect(sub.closed).toBe(true);
            });

            // Test ngOnDestroy with no super.ngOnDestroy() in sub class
            bService.on(TestBEnum.THREE).subscribe( value => {});
            expect(bService.subscriberCount()).toBe(1);
            bService.ngOnDestroy();
            expect(bService.testObject).toBeFalsy();
            expect(bService.subscriberCount()).toBe(0);

            // Test ngOnDestroy with no ngOnDestroy in sub class
            cService.on(TestBEnum.FOUR).subscribe( value => {});
            expect(cService.subscriberCount()).toBe(1);
            cService.ngOnDestroy();
            expect(cService.subscriberCount()).toBe(0);

        }));
});
