export function stripSatoriWrapper(svg: string) {
    return svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
}