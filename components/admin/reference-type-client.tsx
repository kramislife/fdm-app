"use client";

import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useState,
  useTransition,
} from "react";
import { sileo } from "sileo";
import { AdminPage } from "./admin-page";
import { RowActionMenu, type ExtraAction } from "./row-action-menu";
import { AdminSheet } from "./admin-sheet";
import { DetailSheet } from "./detail-sheet";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import type { Column } from "./data-table";
import type { Pagination } from "@/lib/table";

type BaseRow = { id: number; name: string };
type ActionResult = { success: boolean; error?: string; description?: string };

export type ConfirmRowAction<TRow extends BaseRow> = {
  label: string;
  icon?: ReactNode;
  condition?: (row: TRow) => boolean;
  action: (id: number) => Promise<ActionResult>;
  title: string;
  description: string;
  successTitle?: string;
  successDescription?: (row: TRow) => string;
  confirmingText?: string;
};

export type ReferenceTypeClientProps<TRow extends BaseRow, TForm = {}> = {
  entityLabel: string;
  pageTitle: string;
  pageDescription: string;
  rows: TRow[];
  pagination: Pagination;
  columns: Column[];

  renderRow: (row: TRow) => Record<string, ReactNode>;
  renderDetail?: (row: TRow) => ReactNode;

  initialForm?: TForm;
  getFormFromRow?: (row: TRow) => TForm;

  renderForm?: (
    form: TForm,
    setForm: Dispatch<SetStateAction<TForm>>,
    isEditing: boolean,
  ) => ReactNode;
  onCreate?: (data: TForm) => Promise<ActionResult>;
  onUpdate?: (id: number, data: TForm) => Promise<ActionResult>;
  onDelete?: (id: number) => Promise<ActionResult>;
  extraRowActions?: (row: TRow) => ExtraAction[];
  confirmRowActions?: ConfirmRowAction<TRow>[];
};

export function ReferenceTypeClient<TRow extends BaseRow, TForm = {}>(
  props: ReferenceTypeClientProps<TRow, TForm>,
) {
  const {
    entityLabel,
    pageTitle,
    pageDescription,
    rows,
    pagination,
    columns,
    renderRow,
    initialForm,
    getFormFromRow,
    renderForm,
    renderDetail,
    onCreate,
    onUpdate,
    onDelete,
    extraRowActions,
    confirmRowActions,
  } = props;
  const [viewing, setViewing] = useState<TRow | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState<TRow | null>(null);
  const [deleting, setDeleting] = useState<TRow | null>(null);
  // Tracks edit vs add mode separately so the sheet title/description doesn't
  // flicker to "Add" while the close animation is still running.
  const [isEditMode, setIsEditMode] = useState(false);
  const [confirmingAction, setConfirmingAction] = useState<{
    row: TRow;
    def: ConfirmRowAction<TRow>;
  } | null>(null);

  const [form, setForm] = useState<TForm>(initialForm ?? ({} as TForm));
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isConfirming, startConfirmTransition] = useTransition();

  const isSheetOpen = isAdding || !!editing;

  const sheetTitle = isEditMode
    ? `Edit ${entityLabel}`
    : `Add ${entityLabel}`;

  const sheetDescription = isEditMode
    ? `Update the details and settings for this ${entityLabel.toLowerCase()}`
    : `Fill in the details to create a new ${entityLabel.toLowerCase()}`;

  function openView(row: TRow) {
    setViewing(row);
  }

  function closeView() {
    setViewing(null);
  }

  function openAdd() {
    if (!initialForm || !onCreate) return;
    setIsEditMode(false);
    setForm(initialForm);
    setIsAdding(true);
  }

  function openEdit(row: TRow) {
    if (!getFormFromRow || !onUpdate) return;
    setViewing(null);
    setIsEditMode(true);
    setEditing(row);
    setForm(getFormFromRow(row));
  }

  function closeSheet() {
    setIsAdding(false);
    setEditing(null);
    // isEditMode intentionally not reset here — prevents title flicker during close animation
  }

  function handleSubmit() {
    const isEditing = !!editing;

    startTransition(async () => {
      const result = editing
        ? await onUpdate?.(editing.id, form)
        : await onCreate?.(form);

      if (!result) return;

      if (result.success) {
        sileo.success({
          title: isEditing ? "Changes saved!" : "All set!",
          description:
            result.description ??
            (isEditing
              ? `${entityLabel} has been updated successfully.`
              : `${entityLabel} has been created and is ready to use.`),
        });
        closeSheet();
      } else {
        sileo.error({
          title: "Something went wrong",
          description:
            result.description ??
            `We couldn't save the ${entityLabel.toLowerCase()}. Please try again.`,
        });
      }
    });
  }

  function handleDelete() {
    if (!deleting || !onDelete) return;

    startDeleteTransition(async () => {
      const result = await onDelete(deleting.id);

      if (result.success) {
        sileo.success({
          title: "Deleted successfully",
          description: result.description ?? `${entityLabel} has been removed.`,
        });
        setDeleting(null);
      } else {
        sileo.error({
          title: "Couldn't delete",
          description:
            result.description ??
            `We couldn't delete the ${entityLabel.toLowerCase()}. Please try again.`,
        });
      }
    });
  }

  function handleConfirmAction() {
    if (!confirmingAction) return;
    const { row, def } = confirmingAction;

    startConfirmTransition(async () => {
      const result = await def.action(row.id);

      if (result.success) {
        sileo.success({
          title: def.successTitle ?? "Done!",
          description: result.description ?? def.successDescription?.(row),
        });
        setConfirmingAction(null);
      } else {
        sileo.error({
          title: "Something went wrong",
          description: result.error ?? result.description,
        });
      }
    });
  }

  const data = rows.map((row) => {
    const confirmItems: ExtraAction[] = (confirmRowActions ?? [])
      .filter((a) => !a.condition || a.condition(row))
      .map((a) => ({
        label: a.label,
        icon: a.icon,
        onClick: () => setConfirmingAction({ row, def: a }),
      }));

    return {
      ...renderRow(row),
      actions: (
        <RowActionMenu
          onViewDetails={renderDetail ? () => openView(row) : undefined}
          onEdit={onUpdate ? () => openEdit(row) : undefined}
          onDelete={onDelete ? () => setDeleting(row) : undefined}
          extraItems={[...(extraRowActions?.(row) ?? []), ...confirmItems]}
        />
      ),
    };
  });

  return (
    <>
      {/* Admin Page - Table and Form */}
      <AdminPage
        title={pageTitle}
        description={pageDescription}
        columns={columns}
        data={data}
        pagination={pagination}
        action={
          onCreate
            ? { label: `Add ${entityLabel}`, onClick: openAdd }
            : undefined
        }
      />

      {/* View Details Sheet */}
      <DetailSheet
        open={!!viewing}
        onClose={closeView}
        onEdit={viewing && onUpdate ? () => openEdit(viewing) : undefined}
        title={`${entityLabel} Details`}
        description={`View complete information about this ${entityLabel.toLowerCase()}`}
      >
        {viewing && renderDetail?.(viewing)}
      </DetailSheet>

      {/* Add and Edit Forms */}
      {renderForm && (
        <AdminSheet
          open={isSheetOpen}
          onClose={closeSheet}
          title={sheetTitle}
          description={sheetDescription}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          submitLabel={isEditMode ? "Update" : "Save"}
        >
          {renderForm(form, setForm, isEditMode)}
        </AdminSheet>
      )}

      {/* Delete Confirm Dialog */}
      {onDelete && (
        <DeleteConfirmDialog
          open={!!deleting}
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
          title={`Delete ${entityLabel}?`}
          name={deleting?.name}
        />
      )}

      {/* Confirm Row Action Dialog */}
      {confirmRowActions && confirmRowActions.length > 0 && (
        <DeleteConfirmDialog
          open={!!confirmingAction}
          onClose={() => setConfirmingAction(null)}
          onConfirm={handleConfirmAction}
          isDeleting={isConfirming}
          title={confirmingAction?.def.title ?? ""}
          name={confirmingAction?.row.name}
          nameSuffix={confirmingAction?.def.description}
          confirmingText={confirmingAction?.def.confirmingText}
        />
      )}
    </>
  );
}
