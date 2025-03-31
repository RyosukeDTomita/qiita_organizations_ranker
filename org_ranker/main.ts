import { fetchQiitaOrgUsers } from "./qiitaScrape.ts";
import { fetchQiitaUserFollowers, getQiitaApiKey } from "./qiitaApi.ts";

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
  const usernames = await listQiitaOrgMembers("nri");

  // Ensure API key is properly fetched before processing any users
  let apiKey: string;
  try {
    apiKey = await getQiitaApiKey();
    if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") {
      throw new Error("Invalid or empty API key received");
    }
  } catch (error) {
    console.error(`Failed to get valid API key: ${error}`);
    Deno.exit(1);
  }

  // 各ユーザーのフォロワー数とユーザー名のペアを作成
  const userFollowers: { username: string; count: number }[] = [];
  for (const username of usernames) {
    try {
      const followers = await fetchQiitaUserFollowers(apiKey, username);
      userFollowers.push({
        username,
        count: followers,
      });
    } catch (error) {
      console.error(`Error processing user ${username}: ${error}`);
      // Add with zero count and continue with next user
      userFollowers.push({
        username,
        count: 0,
      });
    }
  }

  // フォロワー数の多い順にソート
  userFollowers.sort((a, b) => b.count - a.count);

  // ソート結果を表示
  console.log("\nUsers ranked by follower count:");
  userFollowers.forEach((user, index) => {
    console.log(
      `${index + 1}. User: ${user.username}, Followers: ${user.count}`,
    );
  });
}
