"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, toast, useConfig, useRouteCache, useSelection } from "@payloadcms/ui";
import { SelectAllStatus } from "@payloadcms/ui/providers/Selection";

type ApiError = {
  errors?: Array<{ message?: string }>;
  message?: string;
};

function errorMessage(payload: ApiError) {
  const messages = payload.errors?.map((error) => error.message).filter(Boolean) || [];
  return messages.join("; ") || payload.message || "Unknown error";
}

export default function BulkPublishPosts() {
  const router = useRouter();
  const { clearRouteCache } = useRouteCache();
  const { config } = useConfig();
  const { count, getQueryParams, selectedIDs, selectAll, toggleAll } = useSelection();
  const [isPublishing, setIsPublishing] = useState(false);

  if (!count) return null;

  const publishSelected = async () => {
    if (isPublishing) return;

    setIsPublishing(true);
    const api = config.routes.api;
    let succeeded = 0;
    const failures: string[] = [];

    try {
      if (selectAll === SelectAllStatus.AllAvailable) {
        const response = await fetch(
          `${api}/posts${getQueryParams({ status: { equals: "draft" } })}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "published" }),
          }
        );
        const payload = (await response.json().catch(() => ({}))) as ApiError & { docs?: unknown[] };
        succeeded = payload.docs?.length || 0;
        if (!response.ok || payload.errors?.length) failures.push(errorMessage(payload));
      } else {
        for (const id of selectedIDs) {
          const response = await fetch(`${api}/posts/${id}?depth=0`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "published" }),
          });
          const payload = (await response.json().catch(() => ({}))) as ApiError & {
            doc?: { titleVi?: string };
          };

          if (response.ok) {
            succeeded += 1;
          } else {
            failures.push(`${payload.doc?.titleVi || `Post #${id}`}: ${errorMessage(payload)}`);
          }
        }
      }

      if (succeeded) {
        toast.success(`Đã publish ${succeeded}/${count} bài viết.`);
      }
      if (failures.length) {
        toast.error(`Không thể publish ${failures.length} bài viết.`, {
          description: failures.join("\n"),
        });
      }
      if (!succeeded && !failures.length) {
        toast.message("Không có bài nháp nào cần publish.");
      }

      toggleAll();
      clearRouteCache();
      router.refresh();
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="bulk-publish-posts">
      <Button buttonStyle="primary" disabled={isPublishing} onClick={publishSelected} type="button">
        {isPublishing ? "Đang publish..." : `Publish đã chọn (${count})`}
      </Button>
    </div>
  );
}
