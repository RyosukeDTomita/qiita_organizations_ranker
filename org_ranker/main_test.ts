import { assertEquals } from "@std/assert";
import { extractContributionFromHtml } from "./qiitaScrape.ts";

Deno.test("extractContributionFromHtml: プロフィールページのJSONからcontributionを抽出する", () => {
  const json = JSON.stringify({ user: { contribution: 32847 } });
  const html =
    `<script type="application/json" class="js-react-on-rails-component" data-component-name="UserMainPage" data-dom-id="UserMainPage-react-component-xxxx">${json}</script>`;

  assertEquals(extractContributionFromHtml(html), 32847);
});

Deno.test("extractContributionFromHtml: contributionが無い場合は0を返す", () => {
  const json = JSON.stringify({ user: { followersCount: 10 } });
  const html =
    `<script data-component-name="UserMainPage" data-dom-id="x">${json}</script>`;

  assertEquals(extractContributionFromHtml(html), 0);
});
