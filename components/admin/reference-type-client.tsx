"use client";

import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import { AdminPage } from "./admin-page";
import { RowActionMenu, type ExtraAction } from "./row-action-menu";
import { AdminSheet } from "./admin-sheet";
import { DetailSheet } from "./detail-sheet";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import type { Column } from "./data-table";
import type { Pagination } from "@/lib/table";

// ------------------------------- Types -----------------------------------------

type BaseRow = { id: number; name: string };

type ActionResult = {
  success: boolean;
  title?: string;
  error?: string;
  description?: string;
  errors?: Record<string, string>;
  warning?: string;
};

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
    errors: Record<string, string | undefined>,
    initialValues: TForm,
  ) => ReactNode;
  validate?: (form: TForm) => Record<string, string | undefined>;
  onCreate?: (data: TForm) => Promise<ActionResult>;
  onUpdate?: (id: number, data: TForm) => Promise<ActionResult>;
  onDelete?: (id: number) => Promise<ActionResult>;
  canDelete?: (row: TRow) => boolean;
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
    validate,
    onCreate,
    onUpdate,
    onDelete,
    canDelete,
    extraRowActions,
    confirmRowActions,
  } = props;

  // ------------------------------- State -----------------------------------------

  const [viewing, setViewing] = useState<TRow | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState<TRow | null>(null);
  const [deleting, setDeleting] = useState<TRow | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [confirmingAction, setConfirmingAction] = useState<{
    row: TRow;
    def: ConfirmRowAction<TRow>;
  } | null>(null);

  const [form, setForm] = useState<TForm>(initialForm ?? ({} as TForm));
  const [initialValues, setInitialValues] = useState<TForm>(
    initialForm ?? ({} as TForm),
  );
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isConfirming, startConfirmTransition] = useTransition();

  const isSheetOpen = isAdding || !!editing;
  const sheetTitle = isEditMode ? `Edit ${entityLabel}` : `Add ${entityLabel}`;
  const sheetDescription = isEditMode
    ? `Update the details and settings for this ${entityLabel.toLowerCase()}`
    : `Fill in the details to create a new ${entityLabel.toLowerCase()}`;

  // ------------------------------- Handlers: Navigation ---------------------------

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
    setInitialValues(initialForm);
    setErrors({});
    setIsAdding(true);
  }

  function openEdit(row: TRow) {
    if (!getFormFromRow || !onUpdate) return;
    setViewing(null);
    setIsEditMode(true);
    setEditing(row);
    const initialData = getFormFromRow(row);
    setForm(initialData);
    setInitialValues(initialData);
    setErrors({});
  }

  function closeSheet() {
    setIsAdding(false);
    setEditing(null);
    setErrors({});
  }

  // ------------------------------- Handlers: Actions -----------------------------

  function handleSubmit() {
    const isEditing = !!editing;

    if (validate) {
      const fieldErrors = validate(form);
      const hasErrors = Object.values(fieldErrors).some(Boolean);
      if (hasErrors) {
        setErrors(fieldErrors);
        return;
      }
    }

    startTransition(async () => {
      const result = editing
        ? await onUpdate?.(editing.id, form)
        : await onCreate?.(form);

      if (!result) return;

      if (result.success) {
        toast.success(
          result.title ?? (isEditing ? "Changes saved!" : "All set!"),
          {
            description:
              result.description ??
              (isEditing
                ? `${entityLabel} has been updated successfully.`
                : `${entityLabel} has been created and is ready to use.`),
          },
        );
        if (result.warning) {
          toast.warning("Note", { description: result.warning });
        }
        closeSheet();
      } else {
        if (result.errors) setErrors(result.errors);
        toast.error(result.title ?? "Something went wrong", {
          description:
            result.error ??
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
        toast.success(result.title ?? "Deleted successfully", {
          description: result.description ?? `${entityLabel} has been removed.`,
        });
        setDeleting(null);
      } else {
        toast.error(result.title ?? "Couldn't delete", {
          description:
            result.error ??
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
        toast.success(result.title ?? def.successTitle ?? "Done!", {
          description: result.description ?? def.successDescription?.(row),
        });
        setConfirmingAction(null);
      } else {
        toast.error(result.title ?? "Something went wrong", {
          description: result.error ?? result.description,
        });
      }
    });
  }

  // ------------------------------- Data Processing ---------------------------------

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
          onDelete={
            onDelete && (!canDelete || canDelete(row))
              ? () => setDeleting(row)
              : undefined
          }
          extraItems={[...(extraRowActions?.(row) ?? []), ...confirmItems]}
        />
      ),
    };
  });

  // ------------------------------- Render -----------------------------------------

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
          {renderForm(form, setForm, isEditMode, errors, initialValues)}
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
          description={confirmingAction?.def.description}
          confirmingText={confirmingAction?.def.confirmingText}
        />
      )}
    </>
  );
}
