const CLASS_MAP = {
    btn: 'px-4 py-2 rounded-md font-medium transition-colors',
    'btn-primary': 'bg-primary text-white hover:bg-primary/90',
    'btn-secondary': 'bg-muted text-foreground hover:bg-muted/80',
    card: 'rounded-lg border border-border bg-card p-6 shadow-sm',
    grid: 'grid gap-6',
    'grid-cols-2': 'grid-cols-2',
    'grid-cols-3': 'grid-cols-3',
    'text-center': 'text-center',
    'text-right': 'text-right',
};
const VARIANT_KEYWORDS = {
    primary: 'default',
    secondary: 'secondary',
    ghost: 'ghost',
};
export const StyleMapper = {
    mapClassList(classAttr) {
        if (!classAttr)
            return [];
        const tokens = classAttr.split(/\s+/).filter(Boolean);
        const mapped = tokens.flatMap((token) => {
            const candidate = CLASS_MAP[token];
            return candidate ? candidate.split(/\s+/) : [token];
        });
        return Array.from(new Set(mapped));
    },
    inferVariant(classAttr) {
        if (!classAttr)
            return 'default';
        const lower = classAttr.toLowerCase();
        const match = Object.entries(VARIANT_KEYWORDS).find(([keyword]) => lower.includes(keyword));
        return match ? match[1] : 'default';
    },
};
