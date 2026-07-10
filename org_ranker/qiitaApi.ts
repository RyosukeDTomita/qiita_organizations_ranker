import { load } from "@std/dotenv";
import { dirname, fromFileUrl, join } from "@std/path";

/**
 * QiitaのAPI keyを取得します。
 *
 * `.env` または環境変数から読み込み、未設定・空文字の場合はエラーにします。
 * これによりAPI keyの検証はこの関数に一元化され、呼び出し側は有効なkeyが
 * 返ることを前提にできます。
 * @returns 検証済みのAPI key
 */
export async function getQiitaApiKey(): Promise<string> {
  // .envファイルの絶対パスを構築
  const currentDir = dirname(fromFileUrl(import.meta.url));
  const envPath = join(currentDir, ".env");

  // .envファイルから環境変数を読み込む
  const env = await load({ envPath });
  const apiKey = env["QIITA_API_KEY"] || Deno.env.get("QIITA_API_KEY");

  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "QIITA_API_KEY is not set in the .env file or environment variables.",
    );
  }
  return apiKey;
}

/**
 * Qiita APIを使用してユーザーのフォロワー数を取得します。
 *
 * 取得に失敗した場合は例外を投げます(呼び出し側で失敗ユーザーを
 * ランキングから除外できるようにするため、0でフォールバックしません)。
 * @param apiKey 検証済みのQiita API key
 * @param username Qiitaのユーザー名
 * @returns フォロワー数
 */
export async function fetchQiitaUserFollowers(
  apiKey: string,
  username: string,
): Promise<number> {
  const url = `https://qiita.com/api/v2/users/${username}`;
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${apiKey}`);

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch user ${username}: ${response.status} ${response.statusText}`,
    );
  }
  const userData = await response.json();
  return userData.followers_count ?? 0;
}
