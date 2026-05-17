// Web Workers tutorial: https://www.youtube.com/watch?v=Gcp7triXFjg
import { PentacodeDirect } from '../Pentacoder/direct';

// Cloning algorithm used by postMessage does not transport prototypes and functions!
onmessage = (msg: MessageEvent<string>) => {
    let text: string = msg.data;
    let pentacode: PentacodeDirect = new PentacodeDirect(text);
    postMessage(pentacode);
}