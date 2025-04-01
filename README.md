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

- Organizationsの全ユーザのフォロワー数を集計してランキングする。

  ```shell
  Fetching Qiita organization members page: https://qiita.com/organizations/sigma/members
  Total members in sigma organization: 4

  Users ranked by follower count:
  1. User: hoge, Followers: 777
  2. User: fuga, Followers: 666
  3. User: hogehoge, Followers: 188
  4. User: sigma_devsecops, Followers: 160
  ```

---

## ENVIRONMENT

Deno: 2.2.5

---

## PREPARING

### For Dev Container

1. install VSCode, Docker
2. install VSCode Extensions *Dev ContainerS*
3. On the VSCode, `Ctrl shift p` and run `Dev Containers: Rebuild Containers`
4. create .env and add `QIITA_API_KEY`

  ```shell
  cat << EOF > org_ranker/.env
  QIITA_API_KEY=hogehogefugafuga
  EOF
  ```

### Docker

1. create .env and add `QIITA_API_KEY`

  ```shell
  cat << EOF > org_ranker/.env
  QIITA_API_KEY=hogehogefugafuga
  EOF
  ```

2. build docker image

  ```shell
  docker compose build
  ```

---

## HOW TO USE

### deno run(Dev Container)

```shell
cd org_ranker
deno run --allow-net --allow-env --allow-read main.ts <organization_name>
```

### docker run

```shell
docker compose run deno_app <organization_name>
```

---

## DENO MEMO

### install

公式ドキュメント通りにinstallすると~/.deno/配下にinstallされてしまう。
Dockerで使う場合などはユーザの$HOME配下にインストールされると不便なので，/usr/local/配下にinstallした

```shell
RUN curl -fsSL https://deno.land/install.sh | sudo DENO_INSTALL=/usr/local sh
```

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
