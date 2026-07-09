import { useCallback, useState } from "react";

/**
 * Generic hook that manages delete dialog state for any entity.
 *
 * Usage:
 *   const deleteDialog = useDeleteDialog({
 *     onConfirm: (target) => mutate([target.guid]),
 *   });
 *
 *   // Open from anywhere:
 *   deleteDialog.open(rowData);
 *
 *   // In JSX:
 *   <DeleteDialog
 *     open={deleteDialog.isOpen}
 *     isLoading={isPending}
 *     onClose={deleteDialog.close}
 *     onConfirm={deleteDialog.confirm}
 *   />
 *
 * @param {object}   options
 * @param {function} options.onConfirm  — called with (target) when user confirms
 */
export function useDeleteDialog({ onConfirm } = {}) {
  const [isOpen,  setIsOpen]  = useState(false);
  const [target,  setTarget]  = useState(null);

  /** Call this with the row/entity to delete. Opens the dialog. */
  const open = useCallback((entity) => {
    setTarget(entity);
    setIsOpen(true);
  }, []);

  /** Programmatically close without deleting (also called on Cancel). */
  const close = useCallback(() => {
    setIsOpen(false);
    // Keep target alive briefly so the dialog can animate out without flicker
    setTimeout(() => setTarget(null), 300);
  }, []);

  /** Called when user clicks the Confirm / Delete button. */
  const confirm = useCallback(() => {
    if (onConfirm && target) {
      onConfirm(target);
    }
    close();
  }, [onConfirm, target, close]);

  return {
    isOpen,
    target,
    open,
    close,
    confirm,
  };
}
