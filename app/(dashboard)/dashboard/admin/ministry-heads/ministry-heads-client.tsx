"use client";

import type { Column } from "@/components/admin/data-table";
import type { Pagination } from "@/lib/table";

import { useEffect, useState } from "react";
import { ReferenceTypeClient } from "@/components/admin/reference-type-client";
import { TextCell, UserCell, DateCell } from "@/components/shared/cells";
import { FormInput, FormSelect } from "@/components/shared/form-fields";
import {
  DetailSection,
  DetailField,
  DetailMeta,
} from "@/components/shared/detail-field";
import { updateMinistryHead, getActiveUsersForChapter } from "./actions";

export type MinistryHeadRow = {
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
  created_at: string;
  updated_at: string;
  updated_by: { first_name: string; last_name: string } | null;
};

type Props = {
  ministryHeads: MinistryHeadRow[];
  pagination: Pagination;
  isSuperAdmin: boolean;
  userChapter: { id: number; name: string } | null;
};

type MinistryHeadForm = {
  userId: string;
  chapterName: string;
  ministryName: string;
};

const EMPTY_FORM: MinistryHeadForm = {
  userId: "",
  chapterName: "",
  ministryName: "",
};

const FIELD_LABELS = {
  name: "Ministry",
  chapter: "Chapter",
  head: "Ministry Head",
  members: "Members",
};

const columns: Column[] = [
  { key: "name", label: FIELD_LABELS.name, sortable: true },
  {
    key: "chapter",
    label: FIELD_LABELS.chapter,
    sortable: true,
    align: "center",
  },
  { key: "head", label: FIELD_LABELS.head },
  { key: "members", label: FIELD_LABELS.members, align: "center" },
  { key: "created_at", label: "Created At", sortable: true },
  { key: "actions", label: "Actions", align: "center" },
];

export function MinistryHeadsClient({ ministryHeads, pagination }: Props) {
  const [activeChapterId, setActiveChapterId] = useState<number | null>(null);
  const [users, setUsers] = useState<
    { id: number; first_name: string; last_name: string }[]
  >([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    if (activeChapterId) {
      setIsLoadingUsers(true);
      getActiveUsersForChapter(activeChapterId).then((result) => {
        setUsers(result);
        setIsLoadingUsers(false);
      });
    }
  }, [activeChapterId]);

  return (
    <ReferenceTypeClient<MinistryHeadRow, MinistryHeadForm>
      entityLabel="Ministry Head"
      pageTitle="Ministry Heads"
      pageDescription="View and manage chapter ministry heads"
      rows={ministryHeads}
      pagination={pagination}
      columns={columns}
      renderRow={(row) => ({
        name: <TextCell value={row.name} />,
        chapter: <TextCell value={row.chapter_name} />,
        head: <UserCell user={row.head} />,
        members: <TextCell value={row.member_count} />,
        created_at: <DateCell date={row.created_at} />,
      })}
      renderDetail={(row) => (
        <>
          <DetailSection>
            <DetailField label={FIELD_LABELS.name}>
              <TextCell value={row.name} />
            </DetailField>
            <DetailField label={FIELD_LABELS.chapter}>
              <TextCell value={row.chapter_name} />
            </DetailField>
            <DetailField label={FIELD_LABELS.head}>
              <UserCell user={row.head} />
            </DetailField>
            <DetailField label={FIELD_LABELS.members}>
              <TextCell value={row.member_count} />
            </DetailField>
          </DetailSection>
          <DetailMeta
            id={row.id}
            createdAt={row.created_at}
            updatedAt={row.updated_at}
            updatedBy={row.updated_by}
          />
        </>
      )}
      initialForm={EMPTY_FORM}
      getFormFromRow={(row) => {
        setActiveChapterId(row.chapter_id);
        return {
          userId: row.head?.id.toString() || "",
          chapterName: row.chapter_name,
          ministryName: row.name,
        };
      }}
      renderForm={(form, setForm) => (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-2">
            <FormInput
              label={FIELD_LABELS.chapter}
              id="display-chapter"
              readOnly
              disabled
              value={form.chapterName}
            />
            <FormInput
              label={FIELD_LABELS.name}
              id="display-ministry"
              readOnly
              disabled
              value={form.ministryName}
            />
          </div>
          <FormSelect
            label={FIELD_LABELS.head}
            id="ministry-head"
            value={form.userId}
            onValueChange={(v) => setForm((f) => ({ ...f, userId: v }))}
            options={users.map((u) => ({
              value: u.id.toString(),
              label: `${u.first_name} ${u.last_name}`,
            }))}
            disabled={isLoadingUsers}
            required
            description="Only active members from this chapter are eligible for leadership assignment"
          />
        </div>
      )}
      onUpdate={updateMinistryHead}
    />
  );
}
