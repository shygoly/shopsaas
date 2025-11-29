import type { DbType, StorageAdapterType } from '../types.js';
type DbAdapterReplacement = {
    configReplacement: (envName?: string) => string[];
    importReplacement: string;
    packageName: string;
};
export declare const dbReplacements: Record<DbType, DbAdapterReplacement>;
type StorageAdapterReplacement = {
    configReplacement: string[];
    importReplacement?: string;
    packageName?: string;
};
export declare const storageReplacements: Record<StorageAdapterType, StorageAdapterReplacement>;
/**
 * Generic config replacement
 */
type ConfigReplacement = {
    configReplacement: {
        match: string;
        replacement: string;
    };
    importReplacement: string;
    packageName: string;
};
export declare const configReplacements: Record<string, ConfigReplacement>;
export {};
//# sourceMappingURL=replacements.d.ts.map