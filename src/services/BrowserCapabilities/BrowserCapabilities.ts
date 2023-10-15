export interface BrowserCapabilities {
    supportsWebRTC: boolean;
    supportsMJPEGStream: boolean;
    supportsJpgCacheBusting: boolean;
    supportsH264Stream: boolean;
}

export const GetBrowserCapabilities = (): BrowserCapabilities => {
    const SupportsWebrtc = GetSupportsWebrtc();
    const SupportsMJPEGStream = GetSupportsMJPEGStream();
    const SupportsJpgCacheBusting = GetSupportsJpgCacheBusting();
    const SupportsH264Stream = GetSupportsH264Stream();

    return {
        supportsWebRTC: SupportsWebrtc,
        supportsMJPEGStream: SupportsMJPEGStream,
        supportsJpgCacheBusting: SupportsJpgCacheBusting,
        supportsH264Stream: SupportsH264Stream,
    };
};

const GetSupportsWebrtc = () => {
    return !!(
        window.RTCPeerConnection ||
        (window as any).mozRTCPeerConnection ||
        (window as any).webkitRTCPeerConnection ||
        (window as any).RTCIceGatherer
    );
};

const GetSupportsMJPEGStream = () => {
    return !!(
        window.HTMLImageElement &&
        window.HTMLImageElement.prototype &&
        window.HTMLImageElement.prototype.decode
    );
};

const GetSupportsJpgCacheBusting = () => {
    return !!(
        window.HTMLImageElement &&
        window.HTMLImageElement.prototype &&
        window.HTMLImageElement.prototype.decode
    );
};

const GetSupportsH264Stream = () => {
    return !!(window.HTMLVideoElement && window.HTMLVideoElement.prototype);
};
