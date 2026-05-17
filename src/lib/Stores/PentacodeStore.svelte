<script module lang="ts">

  import * as SVG from '@svgdotjs/svg.js';
  import { writable, type Writable } from 'svelte/store';
  import { HaloRoute, Swatch, CanvasInfo } from '../Pentacoder/base';
  import { PentacodeDirect, DrawSettingsDirect, CanvasInfoDirect } from '../Pentacoder/direct';
  import pentagram from '../../assets/pentagram.svg';

  class Pentacode {
    public freshlyGeneratedFlag: boolean = true; // Makes appear animation play
    
    private pID: number = $state(0);
    private pCode: PentacodeDirect|undefined;
    private cachedDraw: SVG.G|undefined;
    private cachedDebugDraw: SVG.G|undefined;

    private ringAmount: number = $state(1);
    private spin: number = $state(90);
    private pColor: string = $state('#605dff');
    private sColor: string = $state('#f43098');

    get pentacode(): PentacodeDirect|undefined {
      return this.pCode;
    }
    set pentacode(pentacode: PentacodeDirect) {
      if (pentacode != null) {
        this.pCode = pentacode;
        this.pID += 1;
        this.reset();
      }
    }

    get id(): number {
      return this.pID;
    }

    get spinValues(): number[] {
      return PentacodeDirect.spinValues;
    }

    get ringAmountString(): string {
      return String(this.ringAmount);
    }
    set ringAmountString(value: string) {
      this.ringAmount = Number(value);
    }

    get spinString(): string {
      return String(this.spin);
    }
    set spinString(value: string) {
      this.spin = Number(value);
    }

    get primaryColor(): string {
      return this.pColor;
    }
    set primaryColor(value: string) {
      this.pColor = value;
    }

    get secondaryColor(): string {
      return this.sColor;
    }
    set secondaryColor(value: string) {
      this.sColor = value;
    }

    get canvasInfo(): CanvasInfo {
      return CanvasInfoDirect.init(
        this.getRoute(),
        this.drawSettings
      );
    }

    get drawSettings(): DrawSettingsDirect {
      return new DrawSettingsDirect(
        new Swatch(this.primaryColor, this.secondaryColor), 
        null, this.spin
      );
    }

    // Not perfectly optimized, but should work well enough tbh
    public getSVG(debug: boolean = false) {
      if (debug) { 
        return this.pCode!.route2svg(this.getRoute(), this.drawSettings, true);
      } else {
        const draw: SVG.G = this.pCode!.route2svg(this.getRoute(), this.drawSettings, false, pentagram);
        this.updateCache(draw);
        return draw;
      }
    }

    private reset(): void {
      if (this.pCode!.routes.has(2)) { this.ringAmount = 2; } 
      else { this.ringAmount = 1; }
      this.freshlyGeneratedFlag = true;
    }

    // I pass draw here strictly out of optimization means
    private updateCache(draw: SVG.G): void {
      this.cachedDraw = draw;
      this.cachedDebugDraw = this.pCode!.route2svg(this.getRoute(), this.drawSettings, false, pentagram);
    }

    public getRoute(): HaloRoute {
      return this.pCode!.routes.get(this.ringAmount)!;
    }

    public getCircleList(): number[] {
      let result: number[] = [];
      for (let key of this.pCode!.routes.keys()) { result.push(key); }
      return result;
    }

    public checkValid(): boolean {
      return this.pentacode != null;
    }

    // https://stackoverflow.com/questions/19894779/xml-parsing-error-prefix-not-bound-to-a-namespace
    public getOutputSVG(debug: boolean = false): string {
      let draw: SVG.G = debug ? this.cachedDebugDraw! : this.cachedDraw!;

      let svg: string = draw.svg();
      let size: number = this.canvasInfo.size;
      let fullSVG: string = `<svg viewBox="0,0,${size},${size}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${svg}</svg>`;

      return fullSVG;
    }
  }

  export const debug: Writable<boolean> = writable<boolean>(false);
  export const pentacode: Writable<Pentacode> = writable<Pentacode>(new Pentacode());
  
</script>