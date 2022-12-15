import { Mask, Point, Rectangle } from '../Geometry';

export const scaleRectangle = (
    roi: Rectangle,
    scaleX: number,
    scaleY: number,
) => {
    let scaledRoi = roi;

    scaledRoi.x *= scaleX;
    scaledRoi.width *= scaleX;

    scaledRoi.y *= scaleY;
    scaledRoi.height *= scaleY;

    return scaledRoi;
};

export const scaleMask = (mask: Mask, scaleX: number, scaleY: number) => {
    return mask.map(point => ({
        x: point.x * scaleX,
        y: point.y * scaleY,
    }));
};

export const scaleMasks = (masks: Mask[], scaleX: number, scaleY: number) => {
    let copy = [];
    for (let i = 0; i < masks.length; i++) {
        copy.push(scaleMask(masks[i], scaleX, scaleY));
    }

    return copy;
};

export function getRectangleDimensions(p1: Point, p2: Point) {
    const lt = {
        x: Math.round(Math.min(p1.x, p2.x)),
        y: Math.round(Math.min(p1.y, p2.y)),
    };
    const br = {
        x: Math.round(Math.max(p1.x, p2.x)),
        y: Math.round(Math.max(p1.y, p2.y)),
    };

    const width = br.x - lt.x;
    const height = br.y - lt.y;

    return { lt, width, height };
}

export function getRandom(min: number, max: number) {
    return Math.round(Math.random() * (max - min) + min);
}

// if point is inside the polygon it returns > 0,
// if outside < 0 else 0 if lies on an edge (or coincides with a vertex)
export function pointPolygonTest(pts: Point[], pt: Point) {
    // ray cast alg.
    var points = [];

    if (pts.length > 0 && typeof pts[0].x === 'string') {
        for (var j in pts) points.push({ x: pts[j].x, y: pts[j].y });
    } else {
        points = pts;
    }

    var result = 0;
    var i,
        total = points.length,
        counter = 0;

    var ip = { x: Math.round(pt.x), y: Math.round(pt.y) };

    if (total === 0) return -1;

    var v0,
        v = points[total - 1];

    for (i = 0; i < total; i++) {
        v0 = v;
        v = points[i];

        if (
            (v0.y <= ip.y && v.y <= ip.y) ||
            (v0.y > ip.y && v.y > ip.y) ||
            (v0.x < ip.x && v.x < ip.x)
        ) {
            if (
                ip.y === v.y &&
                (ip.x === v.x ||
                    (ip.y === v0.y &&
                        ((v0.x <= ip.x && ip.x <= v.x) ||
                            (v.x <= ip.x && ip.x <= v0.x))))
            )
                return 0;
            continue;
        }

        var dist =
            Math.round((ip.y - v0.y) * (v.x - v0.x)) -
            Math.round((ip.x - v0.x) * (v.y - v0.y));

        if (dist === 0) return 0;
        if (v.y < v0.y) dist = -dist;

        counter += (dist > 0) as unknown as number;
    }

    result = counter % 2 === 0 ? -1 : 1;
    return result;
}
