export function isMobile() {
    return (navigator as any)?.userAgentData?.mobile;
}

export function isTouchScreen() {
    return window.matchMedia('(pointer: coarse)').matches;
}

export function disableReloadOnOverscroll() {
    document.body.classList.add('disable-touch-reloading');
}

export function enableReloadOnOverscroll() {
    document.body.classList.remove('disable-touch-reloading');
}
