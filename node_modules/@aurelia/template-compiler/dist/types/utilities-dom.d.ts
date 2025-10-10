export type IRenderLocation<T extends ChildNode = ChildNode> = T & {
    $start?: IRenderLocation<T>;
};
//# sourceMappingURL=utilities-dom.d.ts.map