import { Pentacode, Segment, HaloLayer, HaloRoute, Swatch, DrawSettings, CanvasInfo } from './base';
import * as hsvg from './hsvg';
import * as hmath from './hmath';
import * as SVG from '@svgdotjs/svg.js';


///
/// A new shiny thing!
/// 
/// Was crafted with love to be more usable, easily scannable and faster to encode. 
/// It doesn't look quite as fun as a recursive pentacode, but it's way more predictable. 
/// I decided on it being the standard!
///


const MAX_CIRCLES: number = 7; // Excluding the metadata circle


export class DrawSettingsDirect extends DrawSettings {
    circleDistance: number; // Distance between circles

    public constructor(swatch: Swatch = new Swatch(), circleDistance: number|null = null, spin: number|null = null, initialRadius: number|null = null, 
            strokeWidth: number|null = null, stripSpacing: number|null = null, edgeMargin: number|null = null) {
        super(swatch, spin, initialRadius, strokeWidth, stripSpacing, edgeMargin);
        this.circleDistance = circleDistance ?? 8;
    }
}

export class CanvasInfoDirect extends CanvasInfo {
    public constructor(size: number = 0, center: number = 0) {
        super(size, center);
    }
    
    static init(route: HaloRoute, ds: DrawSettingsDirect): CanvasInfoDirect {
        let maxRadius: number = ds.initialRadius + ds.circleDistance/2*(route.layers.length); // We don't do -1 because we also need to account for a metadata circle
        let canvasSize: number = maxRadius*2 + ds.strokeWidth + ds.edgeMargin; // Full stroke width since it's a diameter we're talking about
        let center: number = canvasSize/2;
        return new CanvasInfoDirect(canvasSize, center);
    }
}

export class BinaryEntry {
    value: number;
    size: number;

    public constructor(value: number, size: number) {
        this.value = value;
        this.size = size;
    }
}

export class Metadata {
    byteAmount: BinaryEntry;
    circleAmount: BinaryEntry;
    spin: BinaryEntry;

    public constructor(byteAmount: number = 0, circleAmount: number = 0, spin: number = 0) {
        this.byteAmount = new BinaryEntry(byteAmount, Metadata.byteAmountSize);
        this.circleAmount = new BinaryEntry(circleAmount, Metadata.circleAmountSize);
        this.spin = new BinaryEntry(Pentacode.spinMap.get(spin)!, Metadata.spinSize);
    }

    static get byteAmountSize(): number { return 16; }  // 2^16 -> 65536 bytes max
    static get circleAmountSize(): number { return 4; } // 2^4  -> 16 circles max
    static get spinSize(): number { return 2; }         // 2^2  -> 4 different spin values
    get entries(): BinaryEntry[] { 
        return [
            this.byteAmount, this.circleAmount, this.spin
        ];
    }
    get length(): number {
        let result: number = 0;
        this.entries.forEach(function(v) { result += v.size; });
        return result;
    }

    public toHaloLayer(): HaloLayer {
        let result: string = '';
        this.entries.forEach(function(v) {
            result += Pentacode.dec2bin(v.value).padStart(v.size, '0');
        });
        return new HaloLayer(Segment.fromBinary(result));
    }
}

export class PentacodeDirect extends Pentacode {
    byteAmount: number = 0;
    routes: Map<number, HaloRoute> = new Map;

    public constructor(text: string, binaryText: string|null = null, binaryTextPretty: string|null = null, 
            byteAmount: number|null = null, routes: Map<number, HaloRoute>|null = null) {
        super(text, binaryText, binaryTextPretty);

        this.byteAmount = byteAmount ?? this.binaryText.length/8;
        this.routes = routes ?? PentacodeDirect.circles2routes( PentacodeDirect.arrangeCircles(this.binaryText) ); 
    }

    static copy(pentacode: PentacodeDirect): PentacodeDirect {
        return new PentacodeDirect(
            pentacode.text, pentacode.binaryText, pentacode.binaryTextPretty, 
            pentacode.byteAmount, pentacode.routes
        );
    }
    public copy(): PentacodeDirect {
        return PentacodeDirect.copy(this);
    }

    // Breaks the input binary into n chunks, where n is amount of circles
    static chunk(binary: string, n: number): string[] {
        let result: string[] = [];
        let bitsPerCircle: number = Math.floor(binary.length/n);
        let leftoverBits: number = binary.length - bitsPerCircle*n;

        // Since we floor "bitsPerCircle" there's some leftover bits.
        // We'd want to spread those evenly across the first n circles, where n = "leftoverBits".
        // The following loop will be accounting for exactly that.

        // Loop through amount of circles and make slices that'll represent them
        for (let i = 0; i < n; i++) {

            let start: number = i*bitsPerCircle;
            let end: number = (i+1)*bitsPerCircle;

            if (leftoverBits == 0) {
                result.push( binary.slice(start, end) );
            } else {
                let bitCounter: number = Math.min(i, leftoverBits); // Current bit shift
                let bitFlag: number = Number(bitCounter < leftoverBits); // Represents if we need to add an extra bit at the end or not
                result.push( binary.slice(start + bitCounter, end + (bitCounter+bitFlag)) ); // A bit silly, but seems to be working
            }
        }

        return result;
    }

    // Splits binary into different amount of circles
    static arrangeCircles(binary: string): Map<number, string[]> {
        let result: Map<number, string[]> = new Map();
        const max: number = Math.min(binary.length/8, MAX_CIRCLES); // Maximal possible amount of circles

        // "i" represents the amount of circles
        for (let i = 1; i <= max; i++) {
            result.set(i, PentacodeDirect.chunk(binary, i));
        }

        return result;
    }

    // Converts circles of bits to HaloRoutes
    static circles2routes(circles: Map<number, string[]>): Map<number, HaloRoute> {
        let result: Map<number, HaloRoute> = new Map();

        circles.forEach(function(value, key) {
            let layers: HaloLayer[] = [];
            for (let i = 0; i < value.length; i++) {
                // "Segment.fromBinary" gives us a Segment array which we can create a 
                // HaloLayer from and HaloLayer array is a basis of a HaloRoute
                layers.push( new HaloLayer(Segment.fromBinary(value[i])) );
            }
            result.set(key, new HaloRoute(layers));
        });

        return result;
    }

    // Creates a Metadata object for a given route and settings
    public getMetadataCircle(route: HaloRoute, ds: DrawSettings): Metadata {
        return new Metadata(this.byteAmount, route.layers.length, ds.spin);
    }

    // Converts a given route to an svg image
    public route2svg(route: HaloRoute, ds: DrawSettingsDirect, debug: boolean = false, image: string = ''): SVG.G {
        let canvas: CanvasInfoDirect = CanvasInfoDirect.init(route, ds);
        let draw: SVG.G = hsvg.createCanvas(canvas.size);
        if (debug) { Pentacode.addDebugStyle(draw); }

        let metadata: Metadata = this.getMetadataCircle(route, ds);
        let bitsPerCircle: number = Math.floor((metadata.byteAmount.value*8)/metadata.circleAmount.value);

        // Iterate through data circles and draw them
        for (let i = 0; i < route.layers.length; i++) {
            let layer = route.layers[i];
            let ri: number = (route.layers.length-1)-i; // Reverse i
            let beginning: number = hmath.radians(ds.spin)*(i+1); // "i+1" since I want spin to apply immediately
            let radius: number = ds.initialRadius + ds.circleDistance/2*ri;
            let impliedLastBit = (layer.length + layer.segments.length) == bitsPerCircle; // If they're equal, it means last bit is implied
            Pentacode.createArcs(draw, route.layers[i], ds, canvas, beginning, radius, i, debug, impliedLastBit);
        }

        // Draw the metadata circle
        let radius: number = ds.initialRadius + ((ds.circleDistance/2)*route.layers.length);
        Pentacode.createArcs(draw, metadata.toHaloLayer(), ds, canvas, 0, radius, route.layers.length, debug);

        // Add finder patterns
        let fp1: SVG.G = Pentacode.createFinderPattern(draw, ds.swatch.secondaryColor, ds.swatch.primaryColor);
        let fp2: SVG.G = Pentacode.createFinderPattern(draw, ds.swatch.secondaryColor, ds.swatch.primaryColor);
        let fp3: SVG.G = Pentacode.createFinderPattern(draw, ds.swatch.secondaryColor, ds.swatch.primaryColor);
        
        let circle: SVG.Element = fp1.get(0);
        let width: number = circle.attr('stroke-width');
        let size: number = circle.attr('r')*2 + width; // Total size of the finder pattern
        let scale: number = ds.strokeWidth/width; // Makes it the same width as "strokeWidth"
        let offsetShort: number = ds.edgeMargin/2;
        let offsetLong: number = canvas.size-ds.edgeMargin/2-size;
        
        fp1.transform({ origin: 'top left', translate: [offsetShort, offsetShort], scale: scale }); // Top left
        fp2.transform({ origin: 'top right', translate: [offsetLong, offsetShort], scale: scale }); // Top right
        fp3.transform({ origin: 'bottom left', translate: [offsetShort, offsetLong], scale: scale }); // Bottom left

        // Embed an image
        if (image) {
            let i: HTMLImageElement = new Image();
            i.src = image;
            i.decode();

            let img: SVG.Image = draw.image(image);
            let pos: number = canvas.size/2 - (ds.initialRadius-1)/Math.sqrt(2);
            let size: number = (ds.initialRadius-1)*2/Math.sqrt(2);
            img.size(size, size).move(pos, pos);
        }

        return draw;
    }
}