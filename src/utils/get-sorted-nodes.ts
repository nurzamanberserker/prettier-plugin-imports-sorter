import { clone, isEqual } from 'lodash';
import { addComments, removeComments } from '@babel/types';

import { naturalSort } from '../natural-sort';
import { getSortedNodesGroup } from './get-sorted-nodes-group';
import { GetSortedNodes, ImportGroups, ImportOrLine } from '../types';
import { getSortedImportSpecifiers } from './get-sorted-import-specifiers';
import { THIRD_PARTY_MODULES_SPECIAL_WORD, newLineNode } from '../constants';
import { getImportNodesMatchedGroup } from './get-import-nodes-matched-group';

/**
 * This function returns all the nodes which are in the importOrder array.
 * The plugin considered these import nodes as local import declarations.
 * @param nodes all import nodes
 * @param options
 */
export const getSortedNodes: GetSortedNodes = (nodes, options) => {
    naturalSort.insensitive = options.importOrderCaseInsensitive;

    let { importOrder } = options;
    const {
        importOrderSeparation,
        importOrderSortSpecifiers,
        importOrderGroupNamespaceSpecifiers,
    } = options;

    const originalNodes = nodes.map(clone);
    const finalNodes: ImportOrLine[] = [];

    if (!importOrder.includes(THIRD_PARTY_MODULES_SPECIAL_WORD)) {
        importOrder = [THIRD_PARTY_MODULES_SPECIAL_WORD, ...importOrder];
    }

    const importOrderGroups = importOrder.reduce<ImportGroups>(
        (groups, regexp) => ({
            ...groups,
            [regexp]: [],
        }),
        {},
    );

    const importOrderWithOutThirdPartyPlaceholder = importOrder.filter(
        (group) => group !== THIRD_PARTY_MODULES_SPECIAL_WORD,
    );

    for (const node of originalNodes) {
        const matchedGroup = getImportNodesMatchedGroup(
            node,
            importOrderWithOutThirdPartyPlaceholder,
        );
        importOrderGroups[matchedGroup].push(node);
    }

    for (const group of importOrder) {
        const groupNodes = importOrderGroups[group];

        if (groupNodes.length === 0) continue;

        const multiLineImports = groupNodes.filter(
            (node) => node.loc?.start.line !== node.loc?.end.line,
        );
        const singleLineImports = groupNodes.filter(
            (node) => node.loc?.start.line === node.loc?.end.line,
        );

        // Only sort single line imports
        const sortedInsideGroup = getSortedNodesGroup(singleLineImports, {
            importOrderGroupNamespaceSpecifiers,
        });

        const sortedInsideGroupWithMultiLineImports = [
            ...sortedInsideGroup,
            ...multiLineImports,
        ];

        // Sort the import specifiers
        if (importOrderSortSpecifiers) {
            sortedInsideGroupWithMultiLineImports.forEach((node) =>
                getSortedImportSpecifiers(node),
            );
        }

        finalNodes.push(...sortedInsideGroupWithMultiLineImports);

        if (importOrderSeparation) {
            finalNodes.push(newLineNode);
        }
    }

    if (finalNodes.length > 0 && !importOrderSeparation) {
        // a newline after all imports
        finalNodes.push(newLineNode);
    }

    // maintain a copy of the nodes to extract comments from
    const finalNodesClone = finalNodes.map(clone);

    const firstNodesComments = nodes[0].leadingComments;

    // Remove all comments from sorted nodes
    finalNodes.forEach(removeComments);

    // insert comments other than the first comments
    finalNodes.forEach((node, index) => {
        if (isEqual(nodes[0].loc, node.loc)) return;

        addComments(
            node,
            'leading',
            finalNodesClone[index].leadingComments || [],
        );
    });

    if (firstNodesComments) {
        const firstNodesLastComment =
            firstNodesComments[firstNodesComments.length - 1];
        const totalNewLines =
            (nodes[0]?.loc?.start.line || 0) -
            firstNodesLastComment.loc.end.line -
            1;

        if (totalNewLines > 0) {
            finalNodes.unshift(newLineNode);
            finalNodes[0].leadingComments = [];
        }

        addComments(finalNodes[0], 'leading', firstNodesComments);
    }

    return finalNodes;
};
