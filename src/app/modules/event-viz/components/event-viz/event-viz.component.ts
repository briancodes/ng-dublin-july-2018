import { AfterViewInit, ChangeDetectionStrategy, Component, DoCheck, ElementRef, EmbeddedViewRef, Input, OnDestroy, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { SubscriptionLike, timer } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { IEventData } from '../../services/base-event/base-event.service';
import { AbstractVizListener } from '../../services/event-viz.service';

interface ITemplateContext {
    color: string;
}

export interface IVizLayout {
    eventLeft: number;
    eventBottom: number;
    eventHeightPercent: number;
    panelHeightEm: number;
}

@Component({
    selector: 'bc-event-viz',
    template: `
        <div #eventsPanel class="events-panel" [style.height.em]="eventIndicatorLayout.panelHeightEm">
          <!-- Template Container -->
          <ng-container #ngContainer></ng-container>
          <!-- Template -->
          <ng-template #ngTemplate let-color="color">
            <div #cloneRef class="clone"
                  (animationend)="animationEndHandler($event)"
                  [style.left.px]="eventIndicatorLayout.eventLeft"
                  [style.bottom.px]="eventIndicatorLayout.eventBottom">
              <div class="rectangle" [style.background-color]="color"></div>
            </div>
          </ng-template>
          <span #counter class="counter"
                  [style.background-color]="eventColor">
          </span>
        </div>
    `,
    styleUrls: ['./event-viz.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventVizComponent implements OnInit, OnDestroy, AfterViewInit, DoCheck {

    @ViewChild('eventsPanel') eventsPanel: ElementRef;
    @ViewChild('counter') counter: ElementRef;

    @ViewChild('ngContainer', { read: ViewContainerRef })
    private viewContainerRef: ViewContainerRef;

    @ViewChild('ngTemplate')
    private templateRef: TemplateRef<any>;

    /**
     * QueryList is a 'live' list of cloned template elements.
     * It's like an extended version of the document.getElementsByClassName() HTMLCollection
     */
    @ViewChildren('cloneRef', { read: ElementRef })
    private clonedElementsQueryList: QueryList<ElementRef>;

    /** Recommend passing a string enum for this Input */
    @Input() vizEventType: string;
    @Input() clearEventType: string;
    @Input() eventColor: string;
    @Input() eventIndicatorLayout: IVizLayout;
    /** Maintain a cache of cloned elements - prevent repeatedly creating/destroying */
    @Input() elementCacheSize = 50;
    @Input('paused')
    set paused(value: boolean) {
        this._paused = value;
        this.updatePausedState();
    }
    @Input('toggleClear')
    set toggleClear(value: boolean) {
        this.eventCount = 0;
        this.updateCounter();
    }

    private _paused: boolean;
    private eventsSubscription: SubscriptionLike;
    private clearSubscription: SubscriptionLike;
    private embeddedViewRefsMap = new Map<HTMLElement, EmbeddedViewRef<ITemplateContext>>();
    private cacheArray = new Array<EmbeddedViewRef<ITemplateContext>>();
    private cacheAutoClearDelay = 20000;

    private eventCount = 0;

    constructor(
        private eventVizService: AbstractVizListener,
    ) {

    }

    ngOnInit() {
        this.eventsSubscription = this.eventVizService.on(this.vizEventType)
            .pipe(
                tap((event) => {
                    if (!this._paused) {
                        this.addClonedElement(event);
                        this.updateCounter();
                    }
                }),
                switchMap(() => timer(this.cacheAutoClearDelay))
            )
            .subscribe(() => {
                if (!this._paused) {
                    this.clearViewRefCache();
                }
            });
        this.clearSubscription = this.eventVizService.on(this.clearEventType)
            .subscribe(() => {
                this.toggleClear = true;
            });
    }

    ngAfterViewInit() {
        this.updatePausedState();
        this.updateCounter();
    }

    ngOnDestroy() {
        this.clearAll();
    }

    ngDoCheck() {
    }

    // **********************
    // Internal Methods
    // **********************

    private clearAll(final = true) {
        this.embeddedViewRefsMap.forEach((value, key) => {
            if (value) { value.destroy(); }
        });
        this.embeddedViewRefsMap.clear();

        this.viewContainerRef && this.viewContainerRef.clear();

        if (final) {
            this.eventsSubscription && this.eventsSubscription.unsubscribe(); // TODO bbishop: debug with *ngIf
            this.clearSubscription && this.clearSubscription.unsubscribe();
            this.clearViewRefCache();
        }
    }

    private clearViewRefCache() {
        this.cacheArray.forEach(ref => {
            ref.destroy();
        });
        this.cacheArray = []; // If more than one ref would use arr.length=0;
    }

    // ************************
    // Handlers
    // ************************

    private addClonedElement(event: IEventData) {
        let viewRef;
        if (this.cacheArray.length > 0) {
            viewRef = this.viewContainerRef.insert(this.cacheArray.pop(), 0);
        }
        else {
            // Add a clone of the template to the DOM
            let context = { color: this.eventColor };
            // Add each new element at 0 -> new elements will be the first siblings of the container
            viewRef = this.viewContainerRef.createEmbeddedView<ITemplateContext>(this.templateRef, context, 0);
            // Store a reference to the ViewRef using the created HTMLElement as a key
            viewRef.detectChanges(); // We are outside angular zone - need 'context' to be applied
        }
        this.embeddedViewRefsMap.set(viewRef.rootNodes[0], viewRef);
        this.eventCount += 1;
    }

    animationEndHandler(event: AnimationEvent) {
        let element = event.target as HTMLElement;
        let viewRef = this.embeddedViewRefsMap.get(element);
        if (viewRef) {
            // ViewContainerRef.remove() or detach() was not updating DOM until a changeDetection tick.
            // ViewRef.detatch + detectChanges was necessary to immediately update from DOM
            this.viewContainerRef.detach(this.viewContainerRef.indexOf(viewRef));
            viewRef.detectChanges();
            if (this.cacheArray.length < this.elementCacheSize) {
                // Add to cache for reuse
                this.cacheArray.push(viewRef);
            }
            else {
                viewRef.destroy();
            }
            this.embeddedViewRefsMap.delete(element);
        }
        else {
            console.warn('a view slipped through remove after animation end');
        }
    }

    private updateCounter() {
        // Can't rely on change detection binding as runOutsideOfAngular applied
        if (this.counter && this.counter.nativeElement) {
            (this.counter.nativeElement as HTMLElement).textContent = `${this.eventCount}`;
        }
    }

    private updatePausedState() {
        if (this._paused) {
            (this.eventsPanel.nativeElement as HTMLElement).classList.add('pause-animation');
        }
        else {
            (this.eventsPanel.nativeElement as HTMLElement).classList.remove('pause-animation');
        }
    }
}
