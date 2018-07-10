import { AfterViewInit, Component, DoCheck, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SubscriptionLike, fromEvent } from 'rxjs';
import { ThrottleConfig } from 'rxjs/internal/operators/throttle';
import { ScrollTargetModel } from '../../../../shared/scroll-throttle/model/scroll-target.model';
import { AbstractScrollService, ScrollThrottleEnum } from '../../../../shared/scroll-throttle/services/scroll-throttle.service';
import { VizEventTypeEnum } from '../../../event-viz/containers/event-viz-container/event-viz-container.component';
import { AbstractVizDispatcher } from '../../../event-viz/services/event-viz.service';
import { Platform } from '@angular/cdk/platform';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'bc-demo-page',
    templateUrl: './demo-page.component.html',
    styleUrls: ['./demo-page.component.scss']
})
export class DemoPageComponent implements OnInit, AfterViewInit, DoCheck, OnDestroy {

    // Defaults to the Component instance, we want the ElementRef.nativeElement.firstElementChild
    @ViewChild('bcDemoControls', { read: ElementRef }) bcDemoControls: ElementRef<HTMLElement>;
    @ViewChild('topPage', { read: ElementRef }) topPage: ElementRef<HTMLElement>;

    private resizeSub: SubscriptionLike;
    private scrollTargetModel: ScrollTargetModel;
    private scrollEventSubscription: SubscriptionLike;

    scrollThrottleEnum = ScrollThrottleEnum; // Accessible from Template
    appliedThrottleType: ScrollThrottleEnum;

    // Used as an Input for DemoControlsComponent number input
    initialThrottleValue = 60;
    hideDemoControls = false;

    // Dynamic Throttle Specific
    private dynamicMinPercent = 0.8;
    private dynamicMax = 350;
    private dynamicMin = this.initialThrottleValue * this.dynamicMinPercent;

    constructor(
        private scrollService: AbstractScrollService,
        private eventVizService: AbstractVizDispatcher,
        private ngZone: NgZone
    ) {

    }

    ngOnInit() {
        this.ngZone.runOutsideAngular(() => {
            this.resizeSub = fromEvent(window, 'resize')
                .pipe(debounceTime(500))
                .subscribe( (event) => {
                    this.scrollTargetModel && this.scrollTargetModel.recalculateDefaults();
                });
        });
    }

    ngAfterViewInit() {
        this.subscribeToScroll();
        this.applyInitialThrottleTime();

        this.scrollTargetModel = new ScrollTargetModel(window, document);
        // offsetHeight inlcudes content+padding+border+scrollbars (clientHeight no border+scrollbars)
        let controlsHeight = (this.bcDemoControls.nativeElement.firstElementChild as HTMLElement).offsetHeight;
        this.scrollTargetModel.initialize(this.topPage.nativeElement, `${controlsHeight}px`);
    }

    ngDoCheck() {
        // Chrome 'smooth scrolling' affected by running animations - can prevent events being triggered
        // @see https://github.com/briancodes/angular-dublin-demo/issues/10
        let dispatchAsync = this.appliedThrottleType && (this.appliedThrottleType !== ScrollThrottleEnum.NONE) && !this.scrollService.isRunOutsideAngular;
        this.eventVizService.dispatch(VizEventTypeEnum.ChangeDetection, null, true, !!dispatchAsync);
    }

    ngOnDestroy() {
        this.scrollUnsubscribe();
        this.resizeSub && this.resizeSub.unsubscribe();
    }

    runOutsideAngularClickHandler(value: boolean) {
        this.clearCounters();
        this.scrollService.isRunOutsideAngular = value;
    }

    throttleTimeChangeHandler(value: number) {
        this.clearCounters();
        this.scrollService.defaultThrottleTime = value;
        this.dynamicMin = value * this.dynamicMinPercent; // 20% less than default
    }

    throttleSelectionHandler(value: ScrollThrottleEnum) {
        this.clearCounters();
        this.appliedThrottleType = value;

        switch (value) {
            case ScrollThrottleEnum.THROTTLE:
                // In prod, would use tailing:true, but for demo leaving false
                this.subscribeToScroll(value, null, { leading: true, trailing: true });
                break;
            case ScrollThrottleEnum.DYNAMIC_THROTTLE:
                this.subscribeToScroll(value, this.dynamicTimeCallback.bind(this), { leading: true, trailing: true });
                break;
            default:
                this.subscribeToScroll();
                break;
        }
    }

    private applyInitialThrottleTime() {
        this.scrollService.defaultThrottleTime = this.initialThrottleValue;
    }

    private clearCounters() {
        this.eventVizService.dispatch(VizEventTypeEnum.ClearCounters, true);
    }

    /**
     * Subscribe to the ScrollService
     *
     * @param value ScrollThrottleEnum
     * @param throttleValue number, callback function, or null. If null, we use the ScrollService.defaultThrottleTime
     * @param config RxJS ThrottleConfig - if 'undefined' defaults to {leading:true, trailing: false}
     */
    private subscribeToScroll(value: ScrollThrottleEnum = ScrollThrottleEnum.NONE, throttleValue?: number | Function, config?: ThrottleConfig) {
        this.scrollUnsubscribe();
        this.scrollEventSubscription = this.scrollService.onScroll(value, throttleValue, config)
            .subscribe(event => {
                this.ngZone.run(() => {
                    this.handleScrollEvent(event);
                });
            });
    }

    private handleScrollEvent(scrollEvent: any) {
        this.scrollPositionCheck();
        this.eventVizService.dispatch(VizEventTypeEnum.Scroll, scrollEvent);
    }

    private scrollPositionCheck() {
        if (this.scrollTargetModel && this.scrollTargetModel.isInitialized) {
            let pageYOffset = window.pageYOffset;
            let targetInViewport = this.scrollTargetModel.checkTargetInViewport(pageYOffset);
            this.hideDemoControls = !targetInViewport;
        }
    }

    private dynamicTimeCallback(): number {
        let defaultThrottleTime = this.scrollService.defaultThrottleTime;
        let calculatedThrottle = defaultThrottleTime *
            (this.scrollTargetModel.getViewportDistanceFromTarget() * 1.4);
        let dynamicTime = calculatedThrottle < this.dynamicMin ? this.dynamicMin :
            (calculatedThrottle > this.dynamicMax ? this.dynamicMax : calculatedThrottle);
        return dynamicTime;
    }

    private scrollUnsubscribe() {
        this.scrollEventSubscription && this.scrollEventSubscription.unsubscribe();
    }
}

