import { assertEquals } from "@std/assert";
import { extractMembersFromHtml } from "./qiitaScrape.ts";

Deno.test("extractMembersFromHtml: メンバーページのJSONからContribution数と記事数を抽出する", () => {
  const json = JSON.stringify({
    organization: {
      paginatedMemberships: {
        items: [
          {
            user: {
              urlName: "alice",
              contribution: 100,
              articles: { totalCount: 5 },
            },
          },
          {
            user: {
              urlName: "bob",
              contribution: 50,
              articles: { totalCount: 3 },
            },
          },
        ],
        pageData: { totalPages: 2 },
      },
    },
  });
  const html =
    `<script type="application/json" data-component-name="OrganizationMembershipsIndexPage">${json}</script>`;

  const result = extractMembersFromHtml(html);
  assertEquals(result.totalPages, 2);
  assertEquals(result.members, [
    { urlName: "alice", contribution: 100, articlesCount: 5 },
    { urlName: "bob", contribution: 50, articlesCount: 3 },
  ]);
});

Deno.test("extractMembersFromHtml: 欠けているフィールドは0で補い、urlNameが無いユーザーは除外する", () => {
  const json = JSON.stringify({
    organization: {
      paginatedMemberships: {
        items: [
          { user: { urlName: "carol" } },
          { user: { profileImageUrl: "https://example.com/x.png" } },
        ],
      },
    },
  });
  const html = `<script data-component-name="x">${json}</script>`;

  const result = extractMembersFromHtml(html);
  // totalPagesの指定が無い場合は1にフォールバックする
  assertEquals(result.totalPages, 1);
  assertEquals(result.members, [
    { urlName: "carol", contribution: 0, articlesCount: 0 },
  ]);
});
