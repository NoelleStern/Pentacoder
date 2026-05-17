import * as hmath from './hmath';
import * as SVG from '@svgdotjs/svg.js'

import { Point } from './hmath';


// SVG stuff references:
// https://www.nan.fyi/svg-paths/arcs
// http://www.pindari.com/svg-arc.html
// https://codepen.io/AmeliaBR/pen/AWBbaO
// https://github.com/orsinium-labs/svg.py
// https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#arcs
// https://stackoverflow.com/questions/68772327/svg-how-to-draw-multiple-semicircles-arcs-path
// https://stackoverflow.com/questions/69318545/how-to-create-rounded-corners-in-semi-circle-svg


export function createArc(draw: SVG.Containable, x: number = 0, y: number = 0, startAngle: number, 
        endAngle: number, radius: number, strokeWidth: number = 5, strokeMiterlimit: number = 10, 
        strokeLinecap: string = 'round',  color: string = 'red', id: string | null = null): SVG.Path {
    let startPoint: Point = hmath.ar2point(startAngle, radius);
    let endPoint: Point = hmath.ar2point(endAngle, radius);

    let largeArcFlag: boolean = false;
    if (endAngle-startAngle > Math.PI) {
        largeArcFlag = true;
    }

    return draw.path(
        [
            `M ${startPoint.x} ${startPoint.y}`,
            `A ${radius}, ${radius}, 0, ${Number(largeArcFlag)}, 0, ${endPoint.x}, ${endPoint.y}`
        ]
    ).attr({
        id: (id != null) ? id : 'none',
        fill: 'none',
        stroke: color,
        'stroke-width': strokeWidth,
        'stroke-linecap': strokeLinecap,
        'stroke-miterlimit': strokeMiterlimit,
        'transform-origin': 'center',
        'transform': `scale(1 -1) translate(${x} ${y})`
    });
}

export function createCanvas(size: number): SVG.G {
    return SVG.SVG().group().size(size, size); //.viewbox(0,0,size,size);
}

export function createBackground(draw: SVG.Containable, color: string): SVG.Rect{
    return draw.rect('100%', '100%').attr(color=color);
}