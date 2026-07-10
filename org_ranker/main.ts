import { fetchQiitaOrgMembers, OrgMember } from "./qiitaScrape.ts";
import { fetchQiitaUserFollowers, getQiitaApiKey } from "./qiitaApi.ts";

/**
 * ランキングの集計対象となる指標。
 * - followers: フォロワー数(Qiita API)
 * - contributions: Contribution数(メンバーページのスクレイピング)
 * - items: 投稿記事数(メンバーページのスクレイピング)
 */
type Metric = "followers" | "contributions" | "items";

/** 各指標の表示ラベル */
const METRIC_LABELS: Record<Metric, string> = {
  followers: "follower count",
  contributions: "contribution count",
  items: "article count",
};

/** ランキング1件分(ユーザー名とカウント) */
interface RankedUser {
  username: string;
  count: number;
}

/**
 * コマンドライン引数の指標文字列をMetric型に変換します。
 * @param value 引数で渡された指標文字列
 * @returns Metric
 */
function parseMetric(value: string): Metric {
  if (value === "followers" || value === "contributions" || value === "items") {
    return value;
  }
  throw new Error(
    `Invalid metric: ${value}. Use one of: followers, contributions, items`,
  );
}

/** 使い方(--help)を表示します。 */
function printHelp(): void {
  console.log(
    `Qiita Organizations Ranker

Usage: deno run --allow-net [--allow-env --allow-read] main.ts <metric> <org_name>

Arguments:
  metric    集計対象の指標: followers | contributions | items
  org_name  Qiita組織の名前(URLの一部)

Metrics:
  followers      フォロワー数(Qiita API。QIITA_API_KEYが必要)
  contributions  Contribution数(メンバーページのスクレイピング)
  items          投稿記事数(メンバーページのスクレイピング)

Options:
  -h, --help  このヘルプを表示する

Examples:
  deno task followers <org_name>
  deno task contributions <org_name>
  deno task items <org_name>`,
  );
}

/**
 * followers指標について、各メンバーのフォロワー数をQiita APIで取得します。
 * 取得に失敗したユーザーはランキングに含めず、失敗ユーザー名の配列に集めます。
 * @param members 集計対象のメンバー一覧
 * @param apiKey 検証済みのQiita API key
 * @returns ランキング対象ユーザーと、取得に失敗したユーザー名
 */
async function rankByFollowers(
  members: OrgMember[],
  apiKey: string,
): Promise<{ ranked: RankedUser[]; failed: string[] }> {
  const ranked: RankedUser[] = [];
  const failed: string[] = [];
  for (const member of members) {
    try {
      const count = await fetchQiitaUserFollowers(apiKey, member.urlName);
      ranked.push({ username: member.urlName, count });
    } catch (error) {
      console.error(
        `Error fetching ${member.urlName}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      failed.push(member.urlName);
    }
  }
  return { ranked, failed };
}

if (import.meta.main) {
  const args = Deno.args;

  if (args.includes("-h") || args.includes("--help")) {
    printHelp();
    Deno.exit(0);
  }

  if (args.length !== 2) {
    console.error(
      "Usage: deno run --allow-net [--allow-env --allow-read] main.ts <metric> <org_name>",
    );
    console.error("  metric: followers | contributions | items");
    console.error("Run with --help for details.");
    Deno.exit(1);
  }

  let metric: Metric;
  try {
    metric = parseMetric(args[0]);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    Deno.exit(1);
  }
  const orgName = args[1];

  // メンバー一覧を取得(ユーザー名・Contribution数・記事数を含む)
  let members: OrgMember[];
  try {
    members = await fetchQiitaOrgMembers(orgName);
  } catch (error) {
    console.error(
      `Error fetching organization members: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    Deno.exit(1);
  }

  console.log(`Total members in ${orgName} organization: ${members.length}`);
  if (members.length === 0) {
    console.error(
      `No members found for organization "${orgName}". Check the organization name.`,
    );
    Deno.exit(1);
  }

  let ranked: RankedUser[];
  let failed: string[] = [];

  if (metric === "contributions") {
    ranked = members.map((m) => ({
      username: m.urlName,
      count: m.contribution,
    }));
  } else if (metric === "items") {
    ranked = members.map((m) => ({
      username: m.urlName,
      count: m.articlesCount,
    }));
  } else {
    // followersのみQiita APIで取得
    let apiKey: string;
    try {
      apiKey = await getQiitaApiKey();
    } catch (error) {
      console.error(
        `Failed to get valid API key: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      Deno.exit(1);
    }
    ({ ranked, failed } = await rankByFollowers(members, apiKey));
  }

  // カウントの多い順にソート
  ranked.sort((a, b) => b.count - a.count);

  // ソート結果を表示
  const label = METRIC_LABELS[metric];
  console.log(`\nUsers ranked by ${label}:`);
  ranked.forEach((user, index) => {
    console.log(
      `${index + 1}. User: ${user.username}, ${label}: ${user.count}`,
    );
  });

  // 取得に失敗したユーザーは順位から除外し、末尾でまとめて報告する
  if (failed.length > 0) {
    console.log(`\nFailed to fetch (${failed.length}): ${failed.join(", ")}`);
  }
}
