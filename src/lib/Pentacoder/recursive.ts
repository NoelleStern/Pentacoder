import { Pentacode, Segment, HaloLayer, HaloRoute, DrawSettings, CanvasInfo, DebugSettings } from './base';
import * as hsvg from './hsvg';
import * as hmath from './hmath';
import * as SVG from '@svgdotjs/svg.js';


///
/// Oh dang, this is legacy code!
/// 
/// Initially I had no goal of making pentacodes any useful. 
/// They only had to look fun and represent the data only vaguely.
/// And so recursive algorithm was born. It's meant to generate full 
/// circles of equal base element length. Therefore each following circle
/// is bigger than the previous one.
///
/// Even though it produces decent-looking results, it's no good for scanning. 
/// As it wasn't specifically meant to be from the get-go. It's also super slow at 
/// processing longer messages due to its recursive nature and it's no good either.
///


export class CanvasInfoRecursive extends CanvasInfo {
    baseStripLength: number;

    public constructor(size: number = 0, center: number = 0, baseStripLength: number = 0) {
        super(size, center);
        this.baseStripLength = baseStripLength;
    }
    
    static init(route: HaloRoute, ds: DrawSettings): CanvasInfoRecursive {
        let circum: number = hmath.circumference(ds.initialRadius);
        let baseStripLength: number = circum / route.layers[0].length;
        let maxRadius: number = hmath.radius(baseStripLength*route.layers[route.layers.length-1].length);
        let canvasSize: number = maxRadius*2 + ds.strokeWidth + ds.edgeMargin; // Full stroke width since it's a diameter we're talking about
        let center: number = canvasSize/2;
        return new CanvasInfoRecursive(canvasSize, center, baseStripLength);
    }
}

export class PentacodeRecursive extends Pentacode {
    overflowBit: boolean = false;
    segments: Segment[] = [];
    routes: Map<number, HaloRoute[]> = new Map;

    public constructor(text: string, binaryText: string|null = null,
            binaryTextPretty: string|null = null, overflowBit: boolean|null = null, 
            segments: Segment[]|null = null,  routes: Map<number, HaloRoute[]>|null = null) {
        super(text, binaryText, binaryTextPretty);

        this.overflowBit = overflowBit ?? PentacodeRecursive.determineOverflowBit(this.binaryText);
        this.segments = segments ?? Segment.fromBinary(this.binaryText);
        this.routes = routes ?? PentacodeRecursive.possibleRoutesMap(this.segments);
    }

    static copy(pentacode: PentacodeRecursive): PentacodeRecursive {
        return new PentacodeRecursive(
            pentacode.text, pentacode.binaryText, pentacode.binaryTextPretty,
            pentacode.overflowBit, pentacode.segments, pentacode.routes
        );
    }
    public copy(): PentacodeRecursive {
        return PentacodeRecursive.copy(this);
    }
    
    // "layer" as in to layer - to split into different parts. Is kinda the main function
    static layer(route: HaloRoute, segments: Segment[]): HaloRoute[] {
        let result: HaloRoute[] = [];
        let length: number = segments.length;

        if (length == 0) { // We've successfully found a valid route!
            return [ route ];
        } else if (length == 1) { // We can't build a circle out of one strip
            return [];
        } else {
            let flag: boolean = false
            if (HaloLayer.segmentsLength(segments) > route.last().length) {
                // It's way faster going trough the segments backwards in combination with the flag check
                for (let i = length-1; i > 1; i--) {
                    let layer: HaloLayer = new HaloLayer(segments.slice(0, i+1))

                    if (layer.length > route.last().length) {
                        let newRoute: HaloRoute = route.copy();
                        newRoute.layers.push(layer);
                        let routes: HaloRoute[] = PentacodeRecursive.layer(newRoute, segments.slice(i+1, length));

                        if (routes?.length) {
                            flag = true;
                            result = result.concat(routes);
                        } else if (!flag) {
                            break;
                        }
                    }
                }
            }
        }
        
        return result;
    }

    static routes2map(routes: HaloRoute[]): Map<number, HaloRoute[]> {
        let result: Map<number, HaloRoute[]> = new Map();

        for (let v of routes) {
            let size: number = v.layers.length;
            if (!result.has(size)) { result.set(size, []); } // Add empty array to map
            result.get(size)!.push(v); // Trust me bro
        }

        return result;
    }

    // It should probably have a recursive function at its core
    static possibleRoutes(segments: Segment[], reverse: boolean = true): HaloRoute[] {
        let result: HaloRoute[] = [];

        for (let i = 1; i < segments.length; i++) {
            let vars: HaloRoute[] = PentacodeRecursive.layer( 
                new HaloRoute(
                    [ new HaloLayer(segments.slice(0, i+1)) ]
                ), 
                segments.slice(i+1, segments.length)
            );


            if (!(!Array.isArray(vars) || !vars.length)) { 
                result = result.concat(vars); 
            }
        }
        
        if (reverse) { result.reverse(); }
        return result;
    }

    static possibleRoutesMap(segments: Segment[]): Map<number, HaloRoute[]> {
        return PentacodeRecursive.routes2map( PentacodeRecursive.possibleRoutes(segments) );
    }

    // If the last bit doesn't equal the second to last - it's an overflow bit
    // Overflow bit is not represented by anything, but is still a part of the data
    static determineOverflowBit(binaryText: string): boolean {
        return binaryText[binaryText.length-1] != binaryText[binaryText.length-2]
    }

    // Converts a given route to an svg image
    static route2svg(route: HaloRoute, ds: DrawSettings, debug: DebugSettings|null = null): SVG.G {
        let canvas: CanvasInfoRecursive = CanvasInfoRecursive.init(route, ds);
        let draw: SVG.G = hsvg.createCanvas(canvas.size);
        if (debug) { Pentacode.addDebugStyle(draw); }

        // Iterate through circles
        for (let i = 0; i < route.layers.length; i++) {
            let layer: HaloLayer = route.layers[i];
            let beginning: number = hmath.radians(ds.spin) * i; // Why is there no Math.radians?
            let radius: number = (canvas.baseStripLength*layer.length) / (2*Math.PI); // C=2πr => r=C/2π
            Pentacode.createArcs(draw, layer, ds, canvas, beginning, radius, i, debug);
        }

        return draw;
    }

    /* Object specific */
    public getAvailableCirclesList(): number[] {
        let result: number[] = [];
        for (let key of this.routes.keys()) { result.push(key); }
        return result;
    }

    public getAvailableRoutesList(circleAmount: number): number[] {
        let result: number[] = [];
        let l = this.routes.get(circleAmount)!.length;
        for (let i = 0; i < l; i++) { result.push(i+1); }
        return result;
    }

    public getAvailableRoutesNumber(circleAmount: number): number {
        return this.routes.get(circleAmount)!.length;
    }
}