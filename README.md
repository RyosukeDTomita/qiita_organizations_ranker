# Qiita Organizations Ranker

![un license](https://img.shields.io/github/license/RyosukeDTomita/qiita_organizations_ranker)

## INDEX

- [ABOUT](#about)
- [ENVIRONMENT](#environment)
- [PREPARING](#preparing)
- [HOW TO USE](#how-to-use)
- [DENO MEMO](#deno-memo)

---

## ABOUT

QiitaのOrganizationsのデータを集めるプロジェクト

### 実装機能一覧

- Organizationsの全ユーザを指定した指標で集計してランキングする。指標は実行時の第2引数で切り替える。
  - `followers`: フォロワー数（Qiita API）
  - `contributions`: Contribution数（プロフィールページのスクレイピング。Qiita APIでは取得できないため）
  - `items`: 投稿記事数（Qiita API）

  ```shell
  Total members in sigma organization: 4

  Users ranked by follower count:
  1. User: hoge, follower count: 777
  2. User: fuga, follower count: 666
  3. User: hogehoge, follower count: 188
  4. User: sigma_devsecops, follower count: 160
  ```

---

## ENVIRONMENT

- Nix (flakes有効化)
- Deno (flakeのdevShellで提供)

---

## PREPARING

### Nix flake

1. [Nix](https://nixos.org/download/) をインストールし、flakesを有効化する。

2. `followers` / `items` 指標を使う場合は `.env` に `QIITA_API_KEY` を設定する（`contributions` 指標はスクレイピングのためAPI keyは不要）。

  ```shell
  cat << EOF > org_ranker/.env
  QIITA_API_KEY=hogehogefugafuga
  EOF
  ```

3. 開発シェルに入る。

  ```shell
  nix develop
  # direnvを使う場合は `direnv allow` でディレクトリに入ると自動で読み込まれる
  ```

---

## HOW TO USE

`<metric>` には `followers` / `contributions` / `items` のいずれかを指定する。

```shell
deno task start <organization_name> <metric>
```

```shell
deno task start <organization_name> followers
deno task start <organization_name> contributions
deno task start <organization_name> items
```

---

## DENO MEMO

### denoコマンド

#### project作成

[Makind Deno project](https://docs.deno.com/runtime/getting_started/first_project/)

```shell
deno init org_ranker
```

#### スクリプト実行

```shell
cd org_ranker
deno run main.ts
deno test
```

#### fmt

```shell
deno fmt
deno fmt --watch # ファイルが変更されると自動でフォーマットされる
```

#### 型チェック

```shell
deno check main.ts
```

#### compile

> On the first invocation of deno compile, Deno will download the relevant binary and cache it in $DENO_DIR. [deno compile](https://docs.deno.com/runtime/reference/cli/compile/)

deno compileはデフォルトで依存関係を自動的に解決するのでmain.tsを指定してcompileするだけで良い。

```shell
deno compile --allow-net --allow-env --allow-read --output main main.ts
```

### taskとは

[deno taskの使い方](https://qiita.com/access3151fq/items/54b9b644d1a25469d337)

`npm run`で実行するやつみたいなものだと思っておけば良さそう
deno.jsonにtaskを定義できるみたい。

```shell
deno task dev
```
