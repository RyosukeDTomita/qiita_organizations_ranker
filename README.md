# Qiita Organizations Ranker

![un license](https://img.shields.io/github/license/RyosukeDTomita/qiita_organizations_ranker)

## INDEX

- [ABOUT](#about)
- [LICENSE](#license)
- [ENVIRONMENT](#environment)
- [PREPARING](#preparing)
- [HOW TO USE](#how-to-use)
- [DENO MEMO](#deno-memo)

---

## ABOUT

---

## ENVIRONMENT

Deno: 2.2.5

---

## PREPARING

TBD

---

## HOW TO USE

```shell
cd org_ranker
deno run --allow-net --allow-env --allow-read main.ts
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

### taskとは

[deno taskの使い方](https://qiita.com/access3151fq/items/54b9b644d1a25469d337)

`npm run`で実行するやつみたいなものだと思っておけば良さそう
deno.jsonにtaskを定義できるみたい。

```shell
deno task dev
```
