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
import { RowActionMenu } from "./row-action-menu";
import { AdminSheet } from "./admin-sheet";
import { DetailSheet } from "./detail-sheet";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import type { Column } from "./data-table";
import type { Pagination } from "@/lib/table";

type BaseRow = { id: number; name: string };
type ActionResult = { success: boolean; error?: string; description?: string };

export type ReferenceTypeClientProps<TRow extends BaseRow, TForm> = {
  entityLabel: string;
  pageTitle: string;
  pageDescription: string;
  rows: TRow[];
  pagination: Pagination;
  columns: Column[];
  /** Map a row to table cells — do not include the actions column */
  renderRow: (row: TRow) => Record<string, ReactNode>;
  /** Render the read-only detail view — receives the row being viewed */
  renderDetail?: (row: TRow) => ReactNode;
  /** Initial blank form state used when opening the Add sheet */
  initialForm: TForm;
  /** Populate form from an existing row when opening the Edit sheet */
  getFormFromRow: (row: TRow) => TForm;
  /** Render the form fields — receives current form state and its setter */
  renderForm: (
    form: TForm,
    setForm: Dispatch<SetStateAction<TForm>>,
  ) => ReactNode;
  onCreate?: (data: TForm) => Promise<ActionResult>;
  onUpdate?: (id: number, data: TForm) => Promise<ActionResult>;
  onDelete?: (id: number) => Promise<ActionResult>;
};

export function ReferenceTypeClient<TRow extends BaseRow, TForm>({
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
}: ReferenceTypeClientProps<TRow, TForm>) {
  const [viewing, setViewing] = useState<TRow | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState<TRow | null>(null);
  const [deleting, setDeleting] = useState<TRow | null>(null);
  const [sheetMode, setSheetMode] = useState<"add" | "edit">("add");

  const [form, setForm] = useState<TForm>(initialForm);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const isSheetOpen = isAdding || !!editing;
  // sheetMode is set on open and never cleared on close — keeps the title
  // stable throughout the close animation
  const sheetTitle =
    sheetMode === "add" ? `Add ${entityLabel}` : `Edit ${entityLabel}`;

  const sheetDescription =
    sheetMode === "add"
      ? `Fill in the details to create a new ${entityLabel.toLowerCase()}`
      : `Update the details and settings for this ${entityLabel.toLowerCase()}`;

  function openView(row: TRow) {
    setViewing(row);
  }

  function closeView() {
    setViewing(null);
  }

  function openAdd() {
    setSheetMode("add");
    setForm(initialForm);
    setIsAdding(true);
  }

  function openEdit(row: TRow) {
    setViewing(null);
    setSheetMode("edit");
    setEditing(row);
    setForm(getFormFromRow(row));
  }

  function closeSheet() {
    setIsAdding(false);
    setEditing(null);
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

  const data = rows.map((row) => ({
    ...renderRow(row),
    actions: (
      <RowActionMenu
        onViewDetails={renderDetail ? () => openView(row) : undefined}
        onEdit={onUpdate ? () => openEdit(row) : undefined}
        onDelete={onDelete ? () => setDeleting(row) : undefined}
      />
    ),
  }));

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
      <AdminSheet
        open={isSheetOpen}
        onClose={closeSheet}
        title={sheetTitle}
        description={sheetDescription}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        submitLabel={sheetMode === "add" ? "Save" : "Update"}
      >
        {renderForm(form, setForm)}
      </AdminSheet>

      {/* Delete Confirm Dialog */}
      {onDelete && (
        <DeleteConfirmDialog
          open={!!deleting}
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
          title={`Delete ${entityLabel}?`}
          description={
            <>
              <span className="font-semibold text-foreground">
                {deleting?.name}
              </span>{" "}
              will be permanently removed. This action cannot be undone.
            </>
          }
        />
      )}
    </>
  );
}
