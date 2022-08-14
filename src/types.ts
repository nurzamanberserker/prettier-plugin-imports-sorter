import { RequiredOptions } from 'prettier';
import { ExpressionStatement, ImportDeclaration } from '@babel/types';

export interface PrettierOptions extends RequiredOptions {
    importOrder: string[];
    importOrderCaseInsensitive: boolean;
    // should be of type ParserPlugin from '@babel/parser' but prettier does not support nested arrays in options
    importOrderParserPlugins: string[];
    importOrderSeparation: boolean;
    importOrderSortByPrintWidth: boolean;
    importOrderGroupNamespaceSpecifiers: boolean;
    importOrderSortSpecifiers: boolean;
}

export type ImportGroups = Record<string, ImportDeclaration[]>;
export type ImportOrLine = ImportDeclaration | ExpressionStatement;

export type GetSortedNodes = (
    nodes: ImportDeclaration[],
    options: Pick<
        PrettierOptions,
        | 'importOrder'
        | 'importOrderCaseInsensitive'
        | 'importOrderSeparation'
        | 'importOrderSortByPrintWidth'
        | 'importOrderGroupNamespaceSpecifiers'
        | 'importOrderSortSpecifiers'
    >,
) => ImportOrLine[];
