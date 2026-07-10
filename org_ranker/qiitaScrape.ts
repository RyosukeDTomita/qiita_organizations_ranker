/**
 * Qiita組織メンバーの情報。メンバーページに埋め込まれたJSONから取得する。
 */
export interface OrgMember {
  /** ユーザー名(URLの一部) */
  urlName: string;
  /** Contribution数 */
  contribution: number;
  /** 投稿記事数 */
  articlesCount: number;
}

/**
 * メンバーページ1ページ分の抽出結果。
 */
export interface MembersPage {
  /** そのページに含まれるメンバー一覧 */
  members: OrgMember[];
  /** メンバー一覧全体のページ数 */
  totalPages: number;
}

/**
 * QiitaのOrganizationsから全メンバーの情報を取得します。
 *
 * メンバーページ( https://qiita.com/organizations/<org>/members )に埋め込まれた
 * JSONにはユーザー名・Contribution数・投稿記事数が含まれるため、ユーザーごとに
 * プロフィールページやAPIを叩かずに集計に必要な情報がまとめて得られます。
 * 一覧はページングされるため、1ページ目の`totalPages`を見て全ページを取得します。
 * @param orgName Qiita組織の名前(URLの一部)
 * @returns 全メンバーの情報の配列を解決するPromise
 */
export async function fetchQiitaOrgMembers(
  orgName: string,
): Promise<OrgMember[]> {
  if (!orgName) {
    throw new Error("Organization name is required");
  }

  const firstPage = await fetchMembersPage(orgName, 1);
  const members = [...firstPage.members];
  for (let page = 2; page <= firstPage.totalPages; page++) {
    const nextPage = await fetchMembersPage(orgName, page);
    members.push(...nextPage.members);
  }
  return members;
}

/**
 * メンバーページを1ページ取得し、埋め込みJSONからメンバー情報を抽出します。
 * @param orgName Qiita組織の名前(URLの一部)
 * @param page 取得するページ番号(1始まり)
 * @returns そのページのメンバー情報とページ数
 */
async function fetchMembersPage(
  orgName: string,
  page: number,
): Promise<MembersPage> {
  const url = `https://qiita.com/organizations/${orgName}/members?page=${page}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch organization page: ${response.status} ${response.statusText}`,
    );
  }

  const html = await response.text();
  return extractMembersFromHtml(html);
}

/**
 * メンバーページのHTMLからメンバー情報とページ数を抽出するhelper。
 *
 * メンバーページにはReact用のJSONが埋め込まれており、
 * `organization.paginatedMemberships.items[].user` に各メンバーの
 * `urlName` / `contribution` / `articles.totalCount` が、
 * `organization.paginatedMemberships.pageData.totalPages` にページ数が入っています。
 * @param html 解析対象のHTML文字列
 * @returns メンバー情報とページ数
 */
export function extractMembersFromHtml(html: string): MembersPage {
  const jsonMatch = html.match(
    /{"organization":{"paginatedMemberships.*?<\/script>/s,
  );

  if (!jsonMatch) {
    throw new Error(
      "Could not find JSON data containing organization members",
    );
  }

  const jsonStr = jsonMatch[0].replace(/<\/script>$/, "");

  let data: {
    organization?: {
      paginatedMemberships?: {
        items?: {
          user?: {
            urlName?: string | null;
            contribution?: number;
            articles?: { totalCount?: number };
          };
        }[];
        pageData?: { totalPages?: number };
      };
    };
  };
  try {
    data = JSON.parse(jsonStr);
  } catch (jsonError) {
    throw new Error(
      `Failed to parse JSON: ${
        jsonError instanceof Error ? jsonError.message : String(jsonError)
      }`,
    );
  }

  const paginated = data.organization?.paginatedMemberships;
  if (!paginated || !Array.isArray(paginated.items)) {
    throw new Error("JSON data was not in the expected format");
  }

  const members: OrgMember[] = paginated.items
    .map((item) => item.user)
    .filter((user): user is NonNullable<typeof user> =>
      user != null && typeof user.urlName === "string"
    )
    .map((user) => ({
      urlName: user.urlName as string,
      contribution: user.contribution ?? 0,
      articlesCount: user.articles?.totalCount ?? 0,
    }));

  const totalPages = paginated.pageData?.totalPages ?? 1;
  return { members, totalPages };
}
