import { Platform, TaskQueue } from '@aurelia/platform';
export declare class BrowserPlatform<TGlobal extends typeof globalThis = typeof globalThis> extends Platform<TGlobal> {
    static getOrCreate<TGlobal extends typeof globalThis = typeof globalThis>(g: TGlobal, overrides?: Partial<Exclude<BrowserPlatform, 'globalThis'>>): BrowserPlatform<TGlobal>;
    static set(g: typeof globalThis, platform: BrowserPlatform): void;
    readonly Node: TGlobal['Node'];
    readonly Element: TGlobal['Element'];
    readonly HTMLElement: TGlobal['HTMLElement'];
    readonly CustomEvent: TGlobal['CustomEvent'];
    readonly CSSStyleSheet: TGlobal['CSSStyleSheet'];
    readonly ShadowRoot: TGlobal['ShadowRoot'];
    readonly MutationObserver: TGlobal['MutationObserver'];
    readonly window: TGlobal['window'];
    readonly document: TGlobal['document'];
    readonly customElements: TGlobal['customElements'];
    readonly fetch: TGlobal['window']['fetch'];
    readonly requestAnimationFrame: TGlobal['requestAnimationFrame'];
    readonly cancelAnimationFrame: TGlobal['cancelAnimationFrame'];
    readonly clearInterval: TGlobal['window']['clearInterval'];
    readonly clearTimeout: TGlobal['window']['clearTimeout'];
    readonly setInterval: TGlobal['window']['setInterval'];
    readonly setTimeout: TGlobal['window']['setTimeout'];
    readonly domQueue: TaskQueue;
    /**
     * @deprecated Use `platform.domQueue` instead.
     */
    get domWriteQueue(): TaskQueue;
    /**
     * @deprecated Use `platform.domQueue` instead.
     */
    get domReadQueue(): TaskQueue;
    constructor(g: TGlobal, overrides?: Partial<Exclude<BrowserPlatform, 'globalThis'>>);
}
//# sourceMappingURL=index.d.ts.map