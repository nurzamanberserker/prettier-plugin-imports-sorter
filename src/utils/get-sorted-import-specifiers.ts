import { ImportDeclaration } from '@babel/types';

import { PrettierOptions } from '../types';
import { naturalSort } from '../natural-sort';

/**
 * This function returns import nodes with alphabetically sorted module
 * specifiers
 * @param node Import declaration node
 */
export const getSortedImportSpecifiers = (
    node: ImportDeclaration,
    options: Pick<PrettierOptions, 'importOrderSortByPrintWidth'>,
) => {
    node.specifiers.sort((a, b) => {
        if (a.type !== b.type) {
            return a.type === 'ImportDefaultSpecifier' ? -1 : 1;
        }

        // Sort specifiers by print width if importOrderSortByPrintWidth is true and column data is available
        if (
            options.importOrderSortByPrintWidth &&
            a.loc?.end.column &&
            b.loc?.end.column
        ) {
            return naturalSort(a.loc.end.column, b.loc.end.column);
        }

        return naturalSort(a.local.name, b.local.name);
    });
    return node;
};
