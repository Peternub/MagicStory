import "server-only";

import { queryDatabase } from "@/lib/db/client";
import { usesPostgresDataBackend } from "@/lib/data/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isMissingColumnError } from "@/lib/supabase/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ChildRecord } from "@/lib/types/database";
import type { ChildInput } from "@/lib/validators/children";

export type EditableChild = Omit<ChildRecord, "gender"> & {
  gender?: ChildRecord["gender"];
};

export type ChildMutationResult =
  | { ok: true }
  | { ok: false; reason: "limit" | "missing_gender" | "unknown" };

function mapPostgresMutationError(error: unknown): ChildMutationResult {
  if (error instanceof Error && error.message.includes("CHILDREN_LIMIT_REACHED")) {
    return { ok: false, reason: "limit" };
  }

  return { ok: false, reason: "unknown" };
}

export async function countChildrenByUser(userId: string) {
  if (usesPostgresDataBackend()) {
    const result = await queryDatabase<{ count: number }>(
      "select count(*)::integer as count from public.children where user_id = $1",
      [userId]
    );
    return result.rows[0]?.count ?? 0;
  }

  const supabase = createSupabaseAdminClient();
  const { count, error } = await supabase
    .from("children")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    throw new Error("CHILDREN_COUNT_FAILED");
  }

  return count ?? 0;
}

export async function listChildrenByUser(userId: string) {
  if (usesPostgresDataBackend()) {
    const result = await queryDatabase<ChildRecord>(
      `
        select
          id,
          user_id,
          name,
          age,
          gender,
          interests,
          fears,
          additional_context,
          created_at,
          updated_at
        from public.children
        where user_id = $1
        order by created_at desc
      `,
      [userId]
    );
    return result.rows;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("children")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("CHILDREN_LIST_FAILED");
  }

  return (data ?? []) as ChildRecord[];
}

export async function listChildrenForSelection(userId: string) {
  const children = await listChildrenByUser(userId);
  return [...children].sort((left, right) => left.name.localeCompare(right.name, "ru"));
}

export async function findChildByUser(userId: string, childId: string) {
  if (usesPostgresDataBackend()) {
    const result = await queryDatabase<ChildRecord>(
      `
        select
          id,
          user_id,
          name,
          age,
          gender,
          interests,
          fears,
          additional_context,
          created_at,
          updated_at
        from public.children
        where id = $1 and user_id = $2
        limit 1
      `,
      [childId, userId]
    );

    return {
      child: result.rows[0] ?? null,
      hasMissingGenderColumn: false
    };
  }

  const supabase = await createSupabaseServerClient();
  const childResult = await supabase
    .from("children")
    .select(
      "id, user_id, name, age, gender, interests, fears, additional_context, created_at, updated_at"
    )
    .eq("id", childId)
    .eq("user_id", userId)
    .single();

  if (isMissingColumnError(childResult.error, "gender")) {
    const fallbackResult = await supabase
      .from("children")
      .select(
        "id, user_id, name, age, interests, fears, additional_context, created_at, updated_at"
      )
      .eq("id", childId)
      .eq("user_id", userId)
      .single();

    return {
      child: fallbackResult.error
        ? null
        : ({ ...fallbackResult.data, gender: undefined } as EditableChild),
      hasMissingGenderColumn: true
    };
  }

  return {
    child: childResult.error ? null : (childResult.data as ChildRecord),
    hasMissingGenderColumn: false
  };
}

export async function createChildRecord(userId: string, input: ChildInput) {
  if (usesPostgresDataBackend()) {
    try {
      await queryDatabase(
        `
          insert into public.children (
            user_id, name, age, gender, interests, fears, additional_context
          )
          values ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          userId,
          input.name,
          input.age,
          input.gender,
          input.interests,
          input.fears,
          input.additional_context
        ]
      );
      return { ok: true } as const;
    } catch (error) {
      return mapPostgresMutationError(error);
    }
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("children").insert({
    ...input,
    user_id: userId
  });

  if (!error) {
    return { ok: true } as const;
  }

  if (error.message.includes("CHILDREN_LIMIT_REACHED")) {
    return { ok: false, reason: "limit" } as const;
  }

  if (isMissingColumnError(error, "gender")) {
    return { ok: false, reason: "missing_gender" } as const;
  }

  return { ok: false, reason: "unknown" } as const;
}

export async function updateChildRecord(
  userId: string,
  childId: string,
  input: ChildInput
) {
  if (usesPostgresDataBackend()) {
    try {
      await queryDatabase(
        `
          update public.children
          set
            name = $3,
            age = $4,
            gender = $5,
            interests = $6,
            fears = $7,
            additional_context = $8
          where id = $1 and user_id = $2
        `,
        [
          childId,
          userId,
          input.name,
          input.age,
          input.gender,
          input.interests,
          input.fears,
          input.additional_context
        ]
      );
      return { ok: true } as const;
    } catch (error) {
      return mapPostgresMutationError(error);
    }
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("children")
    .update(input)
    .eq("id", childId)
    .eq("user_id", userId);

  if (!error) {
    return { ok: true } as const;
  }

  if (isMissingColumnError(error, "gender")) {
    return { ok: false, reason: "missing_gender" } as const;
  }

  return { ok: false, reason: "unknown" } as const;
}

export async function deleteChildRecord(userId: string, childId: string) {
  if (usesPostgresDataBackend()) {
    await queryDatabase(
      "delete from public.children where id = $1 and user_id = $2",
      [childId, userId]
    );
    return;
  }

  const supabase = await createSupabaseServerClient();
  await supabase.from("children").delete().eq("id", childId).eq("user_id", userId);
}
