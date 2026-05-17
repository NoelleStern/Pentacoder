import * as SVG from '@svgdotjs/svg.js';
import * as hmath from './hmath';
import * as hsvg from './hsvg';

    
///
/// HaloRoutes - represent a collection of circles
/// HaloLayers - represent individual circles
/// Segments   - represent individual arcs
///
/// Therefore HaloRoutes consist of HaloLayers and HaloLayers consist of Segments
///


// An individual circle arc/segment consisting only of value and length
export class Segment {
    value: number;  // Practically a boolean, but it's a bit more confusing to work with actual booleans further in the code
    length: number = 1; // Amount of consecutive numbers of the same value

    public constructor(value: number = 0, length: number = 0) {
        this.value = value;
        this.length = length;
    }

    public static fromBinary(binary: string): Segment[] {
        return Pentacode.groups2segments(Pentacode.binary2groups(binary));
    }

    public toString(): string { 
        return `Segment(value: ${this.value}, length: ${this.length})`;
    } 

    public copy(): Segment {
        return new Segment(this.value, this.length);
    }
}

// A singular circle representation
export class HaloLayer {
    segments: Segment[] = []; // Array filled with segments
    length: number = 0; // Combined length of strips

    public constructor(segments: Segment[]) {
        this.segments = segments;
        this.length = HaloLayer.segmentsLength(segments);
    }

    public toString(): string { 
        return `HaloLayer(length: ${this.length}, segments: ${this.segments})`;
    }

    static segmentsLength(segments: Segment[]): number {
        let result: number = 0;
        for (let s of segments) {
            result += s.length;
        }
        return result;
    }

    static segments2binary(segments: Segment[]): string {
        let result: string = '';
        for (let s of segments) {
            result += String(s.value).repeat(s.length) + String(Number(!Boolean(s.value)));
        }
        return result;
    }

    static segments2str(segments: Segment[], blanks: string = ''): string {
        let result: string = '';
        for (let s of segments) {
            result += String(s.value).repeat(s.length) + blanks;
        }
        return result;
    }
    
    public toBinary(): string {
        return HaloLayer.segments2binary(this.segments)
    }

    public copy(): HaloLayer {
        let result: Segment[] = [];
        for (let s of this.segments) {
            result.push(s.copy());
        }
        return new HaloLayer(result);
    }
}

// One possible combination of all of the circles together
export class HaloRoute {
    layers: HaloLayer[];
    valid: boolean = true; // Only viable for PentacodeRecursive

    public constructor(layers: HaloLayer[]) {
        this.layers = layers;
    }

    public invalidate(): HaloRoute {
        this.valid = false;
        return this;
    }

    // Returns last layer
    public last(): HaloLayer{
        return this.layers[this.layers.length-1];
    }

    public toString(separator: string = '', blanks: string = ''): string {
        let result: string = '';

        for (let i = 0; i < this.layers.length-1; i++) {
            let l: HaloLayer = this.layers[i]
            result += HaloLayer.segments2str(l.segments, blanks) + separator
        }

        return result + HaloLayer.segments2str(this.layers[this.layers.length-1].segments, blanks)
    }

    public copy(): HaloRoute {
        let result: HaloLayer[] = [];
        for (let l of this.layers) {
            result.push(l.copy());
        }
        return new HaloRoute(result);
    }
}

// Color swatch
export class Swatch {
    primaryColor: string;
    secondaryColor: string;
    bgColor: string;
    debugColor: string;

    public constructor(primaryColor: string = '#ff579c', secondaryColor: string = '#807aa8', 
            bgColor: string = '#24223a', debugColor: string = 'lime') {
        this.primaryColor = primaryColor;
        this.secondaryColor = secondaryColor;
        this.bgColor = bgColor;
        this.debugColor = debugColor;
    }
}

// Drawing settings
export class DrawSettings {
    swatch: Swatch; // Colors!
    initialRadius: number; // First circle radius
    strokeWidth: number; // Strip width
    stripSpacing: number; // Distance between strips in % ... it's more or less a magic number
    edgeMargin: number; // Additional margin from the edge
    spin: number;

    public constructor(swatch: Swatch = new Swatch(), spin: number|null = null, initialRadius: number|null = null, 
            strokeWidth: number|null = null, stripSpacing: number|null = null, edgeMargin: number|null = null) {
        this.swatch = swatch;
        this.spin = spin ?? 0;
        this.initialRadius = initialRadius ?? 45;
        this.strokeWidth = strokeWidth ?? 2;
        this.stripSpacing = stripSpacing ?? 18;
        this.edgeMargin = edgeMargin ?? 15;
    }
}

// Basic canvas info
export class CanvasInfo {
    size: number;
    center: number;

    public constructor(size: number = 0, center: number = 0) {
        this.size = size;
        this.center = center;
    }
}

// Basic Pentacode class
export class Pentacode {
    text: string = ''; // Text to encode
    binaryText: string = ''; // Text in binary format for processing
    binaryTextPretty: string = ''; // Text in binary format for viewing

    public constructor(text: string, binaryText: string | null = null, binaryTextPretty: string | null = null) {
        this.text = text;
        this.binaryTextPretty = binaryTextPretty ?? Pentacode.str2binary(text, ' ');
        this.binaryText = binaryText ?? this.binaryTextPretty.replaceAll(' ', '');
    }

    static get spinValues(): number[] { return [0, 90, 180, 270]; } // Array of values
    static get spinMap(): Map<number, number> { return new Map([[0, 0], [90, 1], [180, 2], [270, 3]]); } // Helps converting spin into enum

    // UTF-8 seems to support all of the Unicode characters while still being pretty optimal
    // Should always produce whole bytes
    // https://stackoverflow.com/questions/55955730/how-to-convert-a-string-into-its-real-binary-representation-utf-8-or-whatever
    static str2binary(string: string, delimiter: string = ''): string {
        const te: TextEncoder = new TextEncoder(); // UTF-8 encoder
        return Array.from(te.encode(string)).map(i => i.toString(2).padStart(8, '0')).join(delimiter);
    }

    // https://stackoverflow.com/questions/9939760/how-do-i-convert-an-integer-to-binary-in-javascript
    static dec2bin(dec: number): string {
        return (dec >>> 0).toString(2);
    }

    // Converts binary to a list of consecutive bit groups
    // Groups 0s and 1s together in [[1, 1, 1], [0, 0], [1, 1], ...] like format
    static binary2groups(binary: string): string[][] {
        let result: string[][] = [];

        let arr: string[] = binary.split(''); // String to character array
        let last: string = arr[0];
        let g: string[] = [];
        
        for (let n of arr) {
            if (n == last) {
                g.push(n);
            } else {
                result.push(g);
                g = [n];
            }
            
            last = n;
        }
        result.push(g); // Otherwise the last group gets lost
        
        return result;
    }

    // Converts groups to array of segments that directly represent the pentacode
    static groups2segments(groups: string[][]): Segment[] {
        let result: Segment[] = [];
        
        // Form groups and prepare everything for future usage
        result.push( new Segment(Number(groups[0][0]), groups[0].length) ); // First group we can simply append without any trickery
        groups.shift(); // Remove first group

        // Actual algorithm
        let wasOmitted: boolean = false;
        for (let g of groups) {
            if (g.length > 1) {
                if (wasOmitted) {
                    result.push( new Segment(Number(g[0]), g.length) );
                    wasOmitted = false;
                } else {
                    result.push( new Segment(Number(g[0]), g.length-1) );
                }
            } else {
                if (wasOmitted) {
                    result.push( new Segment(Number(g[0]), g.length) );
                    wasOmitted = false;
                } else {
                    wasOmitted = true;
                }
            }
        }

        return result;
    }

    // Creates a readable name for a given SVG arc. "i" is circle "j" is segment
    static nameArc(i: number, j: number, referenceFlag: boolean = false): string {
        if (!referenceFlag) { return `Arc_${i+1}.${j+1}` }
        else { return `#Arc_${i+1}.${j+1}` }
    }

    // Creates SVG arcs. Surprisingly versatile!
    static createArcs(draw: SVG.G, layer: HaloLayer, ds: DrawSettings, canvas: CanvasInfo, 
            beginning: number, radius: number, i: number, debug: boolean, impliedLastBit: boolean = false) {
        let actualSpacing: number = ((ds.stripSpacing + ds.strokeWidth)/2) / hmath.circumference(radius); // https://developer.mozilla.org/en-US/docs/Web/CSS/stroke-linecap
        let stripElementLength: number = (2*Math.PI) / layer.length;

        // Iterate through segments
        for (let j = 0; j < layer.segments.length; j++) {
            let segment: Segment = layer.segments[j];
            let color: string = segment.value ? ds.swatch.primaryColor : ds.swatch.secondaryColor;
            let end: number = beginning + (stripElementLength*segment.length);

            let arc: SVG.Path = hsvg.createArc(
                draw, canvas.center, canvas.center,
                beginning+actualSpacing, end-actualSpacing, 
                radius, ds.strokeWidth, undefined, undefined, color, Pentacode.nameArc(i, j)
            );

            if (debug) {
                if (debug) {
                    arc.attr({
                        'stroke-opacity': '0',
                    });
                }
        
                // Circle text
                let circleText: SVG.Text = draw.plain(String(segment.value).repeat(segment.length)).attr({
                    'dy': ds.strokeWidth/2,
                    'fill': ds.swatch.debugColor,
                    'text-anchor': 'middle',
                    'class': 'binaryTeehee',
                });

                // I guess it's not a thing anymore?
                //
                // if (debug.firefoxFlag) { 
                //     // Firefox displays SVGs differently
                //     circleText.attr({
                //         'transform': `translate(0 ${canvas.size})`,
                //     })
                // }

                circleText.path().attr({
                    'href': Pentacode.nameArc(i, j, true),
                    'text-anchor': 'middle',
                    'startOffset': '50%',
                });
        
                if (j < layer.segments.length-1 || impliedLastBit) {
                    // Gap text
                    let point: hmath.Point = hmath.ar2point(end, radius-ds.strokeWidth/2);
                    draw.plain(String(Number(!Boolean(segment.value)))).attr({
                        'x': point.x, 'y': -point.y,
                        'fill': ds.swatch.debugColor,
                        'text-anchor': 'middle',
                        'transform': `translate(${canvas.center} ${canvas.center}) rotate(${hmath.degrees(end)}, ${point.x}, ${-point.y})`,
                        'class': 'binaryTeehee',
                    });
                }
            }

            beginning = end;
        }
    }

    // Creates a basic finder pattern
    static createFinderPattern(draw: SVG.G, outerColor: string = 'black', innerColor: string = 'black'): SVG.G {
        let result: SVG.G = draw.group();

        const strokeWidth: number = 0.8;
        const center: number = 2.5 + (strokeWidth/2);
        result.circle(5).cx(center).cy(center).fill('none').stroke({ color: outerColor, width: strokeWidth });
        result.circle(2.5).cx(center).cy(center).fill(innerColor);

        // Doesn't account for "strokeWidth" without those
        result.circle(1).fill('transparent'); // Top left
        result.circle(1).cx(4.5+strokeWidth).cy(4.5+strokeWidth).fill('transparent'); // Bottom right

        return result;
    }

    // Adds a debug style to a given "draw", otherwise the debug text looks wrong
    static addDebugStyle(draw: SVG.G): void {
        let style: SVG.Style = draw.style();
        style.rule('.binaryTeehee', {font: '5px sans-serif'});
    }
}
