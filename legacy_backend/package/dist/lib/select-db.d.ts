import type { CliArgs, DbDetails, DbType } from '../types.js';
type DbChoice = {
    dbConnectionPrefix?: `${string}/`;
    dbConnectionSuffix?: string;
    title: string;
    value: DbType;
};
export declare const dbChoiceRecord: Record<DbType, DbChoice>;
export declare function selectDb(args: CliArgs, projectName: string): Promise<DbDetails>;
export {};
//# sourceMappingURL=select-db.d.ts.map