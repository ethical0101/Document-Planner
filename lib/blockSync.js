/**
 * Helpers for syncing Editor.js documents between collaborators at the block
 * level, so remote changes never re-render the whole editor.
 */

const blockKey = (block) => JSON.stringify([block.type, block.data, block.tunes ?? null]);

export function blocksEqual(a, b) {
  return blockKey(a) === blockKey(b);
}

export function parseBlocks(output) {
  if (!output || typeof output !== "string") return [];
  try {
    const data = JSON.parse(output);
    return Array.isArray(data?.blocks) ? data.blocks.filter((b) => b?.id && b?.type) : [];
  } catch {
    return [];
  }
}

/**
 * Three-way merge of block lists.
 *
 * - `base`:   the blocks this client last synced with the server
 * - `local`:  what the editor contains now
 * - `remote`: the latest blocks on the server
 *
 * Local edits (changed, added, removed or moved blocks) are applied on top of
 * the remote blocks, so concurrent edits to different blocks are all kept.
 * When both sides edit the same block, the local version wins.
 */
export function mergeBlocks(base, local, remote) {
  const baseById = new Map(base.map((b) => [b.id, b]));
  const localIds = new Set(local.map((b) => b.id));
  const basePrev = new Map(base.map((b, i) => [b.id, i > 0 ? base[i - 1].id : null]));

  // Blocks deleted locally are removed from the result.
  let result = remote.filter((b) => !(baseById.has(b.id) && !localIds.has(b.id)));

  local.forEach((block, i) => {
    const prevId = i > 0 ? local[i - 1].id : null;
    const baseBlock = baseById.get(block.id);
    const added = !baseBlock;
    const changed = added || !blocksEqual(baseBlock, block);
    const moved = !added && basePrev.get(block.id) !== prevId;
    if (!changed && !moved) return;

    const index = result.findIndex((b) => b.id === block.id);
    if (index !== -1 && !moved) {
      result[index] = block;
      return;
    }
    // Insert or reposition right after the block that precedes it locally.
    // A block that only moved keeps its remote content.
    const placed = !changed && index !== -1 ? result[index] : block;
    if (index !== -1) result.splice(index, 1);
    const prevIndex = prevId ? result.findIndex((b) => b.id === prevId) : -1;
    result = [...result.slice(0, prevIndex + 1), placed, ...result.slice(prevIndex + 1)];
  });

  return result;
}

/**
 * Returns true when local blocks differ from the last synced state.
 */
export function hasLocalChanges(base, local) {
  if (base.length !== local.length) return true;
  return local.some((block, i) => base[i].id !== block.id || !blocksEqual(base[i], block));
}
