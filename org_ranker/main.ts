import {
  fetchQiitaOrgUsers,
  fetchQiitaUserContribution,
} from "./qiitaScrape.ts";
import { fetchQiitaUserStats, getQiitaApiKey } from "./qiitaApi.ts";

/**
 * ランキングの集計対象となる指標。
 * - followers: フォロワー数（Qiita API）
 * - contributions: Contribution数（プロフィールページのスクレイピング）
 * - items: 投稿記事数（Qiita API）
 */
type Metric = "followers" | "contributions" | "items";

/** 各指標の表示ラベル */
const METRIC_LABELS: Record<Metric, string> = {
  followers: "follower count",
  contributions: "contribution count",
  items: "article count",
};

/**
 * Contribution数はスクレイピングで取得するためAPI keyを必要としない。
 * followers / items はQiita APIを利用するためAPI keyが必要。
 */
function requiresApiKey(metric: Metric): boolean {
  return metric !== "contributions";
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

/**
 * 指定した指標について、ユーザーのカウントを取得します。
 * @param metric 集計対象の指標
 * @param apiKey Qiita API key（contributionsの場合はnull可）
 * @param username Qiitaのユーザー名
 * @returns 指標のカウント
 */
async function fetchCount(
  metric: Metric,
  apiKey: string | null,
  username: string,
): Promise<number> {
  if (metric === "contributions") {
    return await fetchQiitaUserContribution(username);
  }

  const stats = await fetchQiitaUserStats(apiKey ?? "", username);
  return metric === "followers" ? stats.followersCount : stats.itemsCount;
}

/**
 * QiitaのOrganizationsからユーザー名一覧を取得します。
 * @param orgName Qiita組織の名前（URLの一部）
 * @returns ユーザー名（文字列）の配列を解決するPromise
 */
async function listQiitaOrgMembers(orgName: string): Promise<string[]> {
  try {
    const usernames = await fetchQiitaOrgUsers(orgName);
    console.log(
      `Total members in ${orgName} organization: ${usernames.length}`,
    );
    return usernames;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error fetching organization members: ${error.message}`);
    } else {
      console.error(`Error fetching organization members: ${String(error)}`);
    }
    return [];
  }
}

if (import.meta.main) {
  // 実行時の引数でOrganization名と指標を取得
  const args = Deno.args;
  if (args.length !== 2) {
    console.error(
      "Usage: deno run --allow-net --allow-env --allow-read main.ts <org_name> <metric>",
    );
    console.error("  metric: followers | contributions | items");
    Deno.exit(1);
  }
  const orgName = args[0];

  let metric: Metric;
  try {
    metric = parseMetric(args[1]);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    Deno.exit(1);
  }

  const usernames = await listQiitaOrgMembers(orgName);

  // followers / items の場合のみQiita API keyを取得
  let apiKey: string | null = null;
  if (requiresApiKey(metric)) {
    try {
      apiKey = await getQiitaApiKey();
      if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") {
        throw new Error("Invalid or empty API key received");
      }
    } catch (error) {
      console.error(`Failed to get valid API key: ${error}`);
      Deno.exit(1);
    }
  }

  // 各ユーザーのカウントとユーザー名のペアを作成
  const userCounts: { username: string; count: number }[] = [];
  for (const username of usernames) {
    try {
      const count = await fetchCount(metric, apiKey, username);
      userCounts.push({ username, count });
    } catch (error) {
      console.error(`Error processing user ${username}: ${error}`);
      // Add with zero count and continue with next user
      userCounts.push({ username, count: 0 });
    }
  }

  // カウントの多い順にソート
  userCounts.sort((a, b) => b.count - a.count);

  // ソート結果を表示
  const label = METRIC_LABELS[metric];
  console.log(`\nUsers ranked by ${label}:`);
  userCounts.forEach((user, index) => {
    console.log(
      `${index + 1}. User: ${user.username}, ${label}: ${user.count}`,
    );
  });
}
