import { load } from "https://deno.land/std/dotenv/mod.ts";
import { dirname, fromFileUrl, join } from "https://deno.land/std/path/mod.ts";

/**
 * QiitaのAPI keyを取得するための関数
 */
export async function getQiitaApiKey(): Promise<string> {
  // .envファイルの絶対パスを構築
  const currentDir = dirname(fromFileUrl(import.meta.url));
  const envPath = join(currentDir, ".env");

  // .envファイルから環境変数を読み込む
  const env = await load({ envPath });
  const apiKey = env["QIITA_API_KEY"] || Deno.env.get("QIITA_API_KEY");

  if (!apiKey) {
    throw new Error(
      "QIITA_API_KEY is not set in the .env file or environment variables.",
    );
  }
  return apiKey;
}

/**
 * Qiita APIで取得するユーザーの統計情報
 */
export interface QiitaUserStats {
  /** フォロワー数 */
  followersCount: number;
  /** 投稿記事数 */
  itemsCount: number;
}

/**
 * Qiita APIを使用してユーザーの統計情報（フォロワー数・記事数）を取得する関数
 */
export async function fetchQiitaUserStats(
  apiKey: string,
  username: string,
): Promise<QiitaUserStats> {
  // Validate apiKey to ensure it's a non-empty string
  if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") {
    console.error(`Invalid API key provided for user ${username}`);
    return { followersCount: 0, itemsCount: 0 };
  }

  const url = `https://qiita.com/api/v2/users/${username}`;
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${apiKey}`);

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Failed to fetch user information: ${response.status}`);
    }
    const userData = await response.json();
    return {
      followersCount: userData.followers_count || 0,
      itemsCount: userData.items_count || 0,
    };
  } catch (error) {
    console.error(`Error fetching user stats: ${error}`);
    return { followersCount: 0, itemsCount: 0 };
  }
}
