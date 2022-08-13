import { Import, ImportDeclaration } from '@babel/types';

import { naturalSort } from '../natural-sort';
import { PrettierOptions } from '../types';

export const getSortedNodesGroup = (
    imports: ImportDeclaration[],
    options: Pick<PrettierOptions, 'importOrderGroupNamespaceSpecifiers'>,
) => {
    return imports.sort((a, b) => {
        if (options.importOrderGroupNamespaceSpecifiers) {
            const diff = namespaceSpecifierSort(a, b);
            if (diff !== 0) return diff;
        }

        // Make ladder import if column data is available
        if (a.loc?.end.column && b.loc?.end.column) {
            return naturalSort(a.loc.end.column, b.loc.end.column);
        }

        return naturalSort(a.source.value, b.source.value);
    });
};

function namespaceSpecifierSort(a: ImportDeclaration, b: ImportDeclaration) {
    const aFirstSpecifier = a.specifiers.find(
        (s) => s.type === 'ImportNamespaceSpecifier',
    )
        ? 1
        : 0;
    const bFirstSpecifier = b.specifiers.find(
        (s) => s.type === 'ImportNamespaceSpecifier',
    )
        ? 1
        : 0;
    return bFirstSpecifier - aFirstSpecifier;
}
