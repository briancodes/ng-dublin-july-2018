export interface IScrollTargetModel {
    readonly isInitialized: boolean;
    initialize(targetElement: HTMLElement, targetVisibleOffset: string): void;
    recalculateDefaults(): void;
    checkTargetInViewport(pageYOffset: number): boolean;
    getViewportDistanceFromTarget(): number;
}

export class ScrollTargetModel implements IScrollTargetModel {

    private targetElement: HTMLElement;
    private targetVisibleOffset: string;

    private halfTargetHeight: number;
    private halfViewportHeight: number;
    private targetCenterToTop: number;

    private _isInitialized = false;

    private timesVPFromTarget = 0;

    /** Supply abstractions of the window/document for unit tests */
    constructor(private window: Window, private document: Document) {
    }

    private calculateDefaultPositions(): void {
        if (this._isInitialized) {
            this.halfTargetHeight = this.targetElement.offsetHeight / 2;
            this.halfViewportHeight = this.document.documentElement.clientHeight / 2;
            this.targetCenterToTop = this.targetElement.getBoundingClientRect().top + this.window.pageYOffset + this.halfTargetHeight;
        }
        else {
            console.warn('ScrollThrottle - called but not initialize!');
        }
    }

    get isInitialized(): boolean {
        return this._isInitialized;
    }

    /**
     * A positive targetVisibleOffset indicates that a percentage/px height of
     * element must be in the view before the element is considered to be in the
     * Viewport. A negative value is the offscreen distance at which point we consider
     * the Element to be visible.
     *
     * @param targetElement HtmlElement
     * @param targetVisibleOffset either % or px. Negative or positive e.g. 100%, 10px, -20px
     */
    initialize(targetElement: HTMLElement, targetVisibleOffset: string): void {
        this._isInitialized = true;
        this.targetElement = targetElement;
        this.targetVisibleOffset = targetVisibleOffset;
        this.calculateDefaultPositions();
    }

    recalculateDefaults(): void {
        this.calculateDefaultPositions();
    }

    // TODO bbishop: there are edge cases not covered e.g. target larger than viewport
    // and targetVisibleOffset 100px, or px's > viewport height. Outside scope of this
    // demo
    checkTargetInViewport(pageYOffset: number): boolean {
        if (!this._isInitialized) {
            console.warn('ScrollThrottle - called but not initialize!');
        }
        // vp is the viewport
        let vpCenterToTop = pageYOffset + this.halfViewportHeight;
        let vpCenterToTargetCenterAbs = Math.abs(vpCenterToTop - this.targetCenterToTop);
        let vpEdgeToTargetCenter = vpCenterToTargetCenterAbs - this.halfViewportHeight;
        let vpEdgeToTargetEdge = vpEdgeToTargetCenter - this.halfTargetHeight;

        let vpEdgeToTargetEdgeOffset = vpEdgeToTargetEdge;
        // We have viewport edge to target edge, now add the percentage (+/-) of element that must be visible
        if (this.targetVisibleOffset) {
            if (this.targetVisibleOffset.endsWith('%')) {
                let offset = Number(this.targetVisibleOffset.slice(0, -1));
                vpEdgeToTargetEdgeOffset += this.halfTargetHeight * 2 * offset * 0.01;
            } else if (this.targetVisibleOffset.endsWith('px')) {
                let offset = Number(this.targetVisibleOffset.slice(0, -2));
                vpEdgeToTargetEdgeOffset += offset;
            }
        }
        // vpEdgeToTargetEdgeOffset <= 0 means target is in the viewport
        let isTargetVisible = vpEdgeToTargetEdgeOffset <= 0;

        // 0 would be target in view, 1 would be one VP distance away from target
        this.timesVPFromTarget = vpEdgeToTargetEdgeOffset <= 0 ? 0 :
            vpEdgeToTargetEdgeOffset / (this.halfViewportHeight * 2);

        return isTargetVisible;
    }

    /**
     * Returns the distance from the edge of the viewport to the target (including offset).
     * Value is represented in terms of Viewport height units e.g. a distance of 0.5 represents half
     * the viewport height
     */
    getViewportDistanceFromTarget(): number {
        return this.timesVPFromTarget;
    }

}
