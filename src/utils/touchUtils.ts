export function getOffsetPosition(evt: TouchEvent): { offsetX: number, offsetY: number } {
    let parent = evt.target as HTMLElement;

    let position = {
        offsetX: evt.targetTouches[0].pageX,
        offsetY: evt.targetTouches[0].pageY,
    };

    while (parent.offsetParent) {
        position.offsetX -= parent.offsetLeft - parent.scrollLeft;
        position.offsetY -= parent.offsetTop - parent.scrollTop;

        parent = parent.offsetParent as HTMLElement;
    }

    return position;
}
