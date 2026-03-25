"use client";

import type { Column } from "@/components/admin/data-table";
import type { Pagination } from "@/lib/utils/table";
import type { FormSelectGroup } from "@/components/shared/form-fields";

import { formatName } from "@/lib/utils/format";
import { useEffect, useState } from "react";
import { ReferenceTypeClient } from "@/components/admin/reference-type-client";
import { TextCell, UserCell, DateCell } from "@/components/shared/cells";
import { FormSelect } from "@/components/shared/form-fields";
import {
  DetailSection,
  DetailField,
  DetailMeta,
} from "@/components/shared/detail-field";
import { updateChapterMinistry, getActiveUsersForChapter } from "./actions";

// ------------------------------- Types -----------------------------------------

export type ChapterMinistryRow = {
  id: number;
  name: string;
  ministryTypeKey: string;
  chapter_id: number;
  chapter_name: string;
  member_count: number;
  head: {
    id: number;
    first_name: string;
    last_name: string;
  } | null;
  updated_at: string;
  updated_by: { first_name: string; last_name: string } | null;
};

type UserWithMinistry = {
  id: number;
  first_name: string;
  last_name: string;
  chapter_ministry_id: number | null;
  ministry_name: string | null;
};

type ChapterMinistryForm = {
  userId: string;
  chapterName: string;
  ministryName: string;
  chapterMinistryId: number | null;
};

type Props = {
  chapterMinistries: ChapterMinistryRow[];
  pagination: Pagination;
  isSuperAdmin: boolean;
  userChapter: { id: number; name: string } | null;
};

// ------------------------------- Constants -----------------------------------------

const EMPTY_FORM: ChapterMinistryForm = {
  userId: "",
  chapterName: "",
  ministryName: "",
  chapterMinistryId: null,
};

const FIELD_LABELS = {
  name: "Ministry",
  chapter: "Chapter",
  head: "Ministry Head",
  members: "Members",
};

const ALL_COLUMNS: Column[] = [
  { key: "name", label: FIELD_LABELS.name, sortable: true },
  {
    key: "chapter",
    label: FIELD_LABELS.chapter,
    sortable: true,
    align: "center",
  },
  { key: "head", label: FIELD_LABELS.head },
  { key: "members", label: FIELD_LABELS.members, align: "center" },
  { key: "updated_at", label: "Last Updated", sortable: true },
  { key: "actions", label: "Actions", align: "center" },
];

const CHAPTER_COLUMNS: Column[] = ALL_COLUMNS.filter(
  (c) => c.key !== "chapter",
);

// ------------------------------- Validation -----------------------------------------

function validate(
  form: ChapterMinistryForm,
): Record<string, string | undefined> {
  const errors: Record<string, string | undefined> = {};
  if (!form.userId) {
    errors.userId = "Please select a ministry head.";
  }
  return errors;
}

// ------------------------------- Component -----------------------------------------

export function ChapterMinistriesClient({
  chapterMinistries,
  pagination,
  isSuperAdmin,
}: Props) {
  const [activeChapterId, setActiveChapterId] = useState<number | null>(null);
  const [users, setUsers] = useState<UserWithMinistry[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    if (!activeChapterId) return;
    let cancelled = false;
    setIsLoadingUsers(true);
    getActiveUsersForChapter(activeChapterId)
      .then((result) => {
        if (cancelled) return;
        setUsers(result);
        setIsLoadingUsers(false);
      })
      .catch(() => {
        if (cancelled) return;
        setIsLoadingUsers(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeChapterId]);

  /**
   * Builds grouped options for the ministry head select.
   *
   * - "Available Members": verified chapter members with no active ministry head role
   * - "Currently Assigned": the existing head of this specific ministry (if any)
   * - Members already heading a DIFFERENT ministry are excluded entirely
   */
  function getUserGroups(chapterMinistryId: number | null): FormSelectGroup[] {
    const available = users.filter((u) => u.chapter_ministry_id === null);
    const currentHead = users.filter(
      (u) =>
        u.chapter_ministry_id !== null &&
        u.chapter_ministry_id === chapterMinistryId,
    );
    const leadingOther = users.filter(
      (u) =>
        u.chapter_ministry_id !== null &&
        u.chapter_ministry_id !== chapterMinistryId,
    );

    const toOption = (u: UserWithMinistry) => ({
      value: u.id.toString(),
      label: formatName(u),
    });

    const sortByLabel = (a: { label: string }, b: { label: string }) =>
      a.label.localeCompare(b.label);

    return [
      {
        label: "Available Members",
        options: available.map(toOption).sort(sortByLabel),
      },
      ...(currentHead.length > 0
        ? [
            {
              label: "Currently Assigned",
              options: currentHead.map(toOption).sort(sortByLabel),
            },
          ]
        : []),
      ...(leadingOther.length > 0
        ? [
            {
              label: "Leading Another Ministry",
              options: leadingOther.map(toOption).sort(sortByLabel),
            },
          ]
        : []),
    ];
  }

  return (
    <ReferenceTypeClient<ChapterMinistryRow, ChapterMinistryForm>
      entityLabel="Ministry Head"
      pageTitle="Chapter Ministries"
      pageDescription="View and manage ministry heads per chapter"
      rows={chapterMinistries}
      pagination={pagination}
      columns={isSuperAdmin ? ALL_COLUMNS : CHAPTER_COLUMNS}
      renderRow={(row) => ({
        name: <TextCell value={row.name} />,
        chapter: <TextCell value={row.chapter_name} capitalize />,
        head: <UserCell user={row.head} />,
        members: <TextCell value={row.member_count} />,
        updated_at: <DateCell date={row.updated_at} />,
      })}
      renderDetail={(row) => (
        <>
          <DetailSection>
            <DetailField label={FIELD_LABELS.name}>
              <TextCell value={row.name} />
            </DetailField>
            {isSuperAdmin && (
              <DetailField label={FIELD_LABELS.chapter}>
                <TextCell value={row.chapter_name} capitalize />
              </DetailField>
            )}
            <DetailField label={FIELD_LABELS.head}>
              <UserCell user={row.head} />
            </DetailField>
            <DetailField label={FIELD_LABELS.members}>
              <TextCell value={row.member_count} />
            </DetailField>
          </DetailSection>
          <DetailMeta
            id={row.id}
            updatedAt={row.updated_at}
            updatedBy={row.updated_by}
          />
        </>
      )}
      initialForm={EMPTY_FORM}
      getFormFromRow={(row) => {
        setActiveChapterId(row.chapter_id);
        return {
          userId: row.head?.id.toString() ?? "",
          chapterName: row.chapter_name,
          ministryName: row.name,
          chapterMinistryId: row.id,
        };
      }}
      validate={validate}
      renderForm={(form, setForm, _isEditing, errors, _initialValues) => {
        const selectedUser = users.find((u) => u.id.toString() === form.userId);
        const alreadyLeadsOther =
          selectedUser !== undefined &&
          selectedUser.chapter_ministry_id !== null &&
          selectedUser.chapter_ministry_id !== form.chapterMinistryId;

        return (
          <div className="space-y-5">
            <DetailSection>
              {isSuperAdmin && (
                <DetailField label={FIELD_LABELS.chapter}>
                  <TextCell value={form.chapterName} capitalize />
                </DetailField>
              )}
              <DetailField label={FIELD_LABELS.name}>
                <TextCell value={form.ministryName} />
              </DetailField>
            </DetailSection>
            <FormSelect
              label={FIELD_LABELS.head}
              id="ministry-head"
              value={form.userId}
              onValueChange={(v) => setForm((f) => ({ ...f, userId: v }))}
              groups={getUserGroups(form.chapterMinistryId)}
              disabled={isLoadingUsers}
              required
              error={errors.userId}
              description={
                isLoadingUsers
                  ? "Loading members..."
                  : alreadyLeadsOther
                    ? undefined
                    : "All verified members of this chapter are shown."
              }
              labelClassName="font-bold"
            />
            {alreadyLeadsOther && (
              <p className="text-xs text-amber-600 -mt-3">
                Note: This member is already assigned as head of{" "}
                {selectedUser.ministry_name} in this chapter.
              </p>
            )}
          </div>
        );
      }}
      onUpdate={async (id, form) =>
        updateChapterMinistry(id, { userId: form.userId })
      }
    />
  );
}
