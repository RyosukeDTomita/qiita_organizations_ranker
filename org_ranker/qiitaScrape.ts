/**
 * QiitaのOrganizationsからユーザー一覧を取得します。
 * @param orgName Qiita組織の名前（URLの一部）
 * @returns メンバーのユーザー名の配列を解決するPromise
 */
export async function fetchQiitaOrgUsers(orgName: string): Promise<string[]> {
  if (!orgName) {
    throw new Error("Organization name is required");
  }

  const url = `https://qiita.com/organizations/${orgName}/members`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch organization page: ${response.status} ${response.statusText}`,
      );
    }

    const html = await response.text();
    const data = extractJsonFromHtml(html);

    if (
      data.organization && data.organization.memberships &&
      data.organization.memberships.edges
    ) {
      return data.organization.memberships.edges
        .map((edge: any) => edge.node.user.urlName)
        .filter((name: string | null) => name !== null);
    } else {
      console.warn("JSON data was not in the expected format");
      return [];
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        `Error fetching Qiita organization members: ${error.message}`,
      );
    } else {
      console.error(
        `Error fetching Qiita organization members: ${String(error)}`,
      );
    }
    return [];
  }
}

/**
 * QiitaのユーザープロフィールページをスクレイピングしてContribution数を取得します。
 *
 * Contribution数はQiita APIでは取得できないため、プロフィールページ
 * （ https://qiita.com/<username> ）に埋め込まれたJSONから抽出します。
 * @param username Qiitaのユーザー名
 * @returns Contribution数を解決するPromise
 */
export async function fetchQiitaUserContribution(
  username: string,
): Promise<number> {
  if (!username) {
    throw new Error("Username is required");
  }

  const url = `https://qiita.com/${username}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch user page: ${response.status} ${response.statusText}`,
      );
    }

    const html = await response.text();
    return extractContributionFromHtml(html);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error fetching Qiita user contribution: ${error.message}`);
    } else {
      console.error(`Error fetching Qiita user contribution: ${String(error)}`);
    }
    return 0;
  }
}

/**
 * ユーザープロフィールページのHTMLからContribution数を抽出するhelper。
 *
 * プロフィールページにはReact用のJSONが
 * `<script data-component-name="UserMainPage" ...>...</script>`
 * の形で埋め込まれており、その中の `user.contribution` を利用します。
 * @param html 解析対象のHTML文字列
 * @returns Contribution数
 */
export function extractContributionFromHtml(html: string): number {
  const jsonMatch = html.match(
    /data-component-name="UserMainPage"[^>]*>(.*?)<\/script>/s,
  );

  if (!jsonMatch) {
    throw new Error("Could not find JSON data containing user contribution");
  }

  try {
    const data = JSON.parse(jsonMatch[1]);
    return data.user?.contribution ?? 0;
  } catch (jsonError) {
    throw new Error(
      `Failed to parse JSON: ${
        jsonError instanceof Error ? jsonError.message : String(jsonError)
      }`,
    );
  }
}

/**
 * HTML内に含まれるJSON形式のデータを抽出してパースするhelper
 * @param html 解析対象のHTML文字列
 * @returns パースされたJSONオブジェクト
 */
function extractJsonFromHtml(html: string): any {
  const jsonMatch = html.match(
    /{\"organization\":{\"paginatedMemberships.*?<\/script>/s,
  );

  if (!jsonMatch) {
    throw new Error(
      "Could not find JSON data containing organization members",
    );
  }

  const jsonStr = jsonMatch[0].replace(/<\/script>$/g, "");

  try {
    return JSON.parse(jsonStr);
  } catch (jsonError) {
    throw new Error(
      `Failed to parse JSON: ${
        jsonError instanceof Error ? jsonError.message : String(jsonError)
      }`,
    );
  }
}
