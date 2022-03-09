# feedback-service

時間割アプリ [Twin:te](https://app.twinte.net) のv3バックエンドの一部です。  
受け取ったフィードバックを適切な形に変換し Trello に新規カードとして追加します。
なおこの Trello は一般には公開されていません。

## 推奨開発環境

docker + vscode を使うことで簡単に開発可能。

1. [RemoteDevelopment](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack)拡張機能をインストール
2. このプロジェクトのフォルダを開く
3. 右下に `Folder contains a Dev Container configuration file. Reopen folder to develop in a container` と案内が表示されるので`Reopen in Container`を選択する。（表示されない場合はコマンドパレットを開き`open folder in container`と入力する）
4. node14の開発用コンテナが立ち上がりVSCodeで開かれる。また、`.devcontainer/docker-compose.yml` に任意のサービスを追加するとvscode起動時に一緒に起動できる（データベース等）。

## npmコマンド一覧

| コマンド | 説明                                                      |
| :------- | :-------------------------------------------------------- |
| dev      | 開発起動                                                  |
| proto    | protoファイルから型定義を生成(proto-gen.shを実行している) |
| client   | grpcリクエストが送れるCLIを起動                           |
| test     | テストを実行                                              |
| build    | distにビルド結果を出力                                    |

## 環境変数

開発、テストには .dev.env が必要です。  
各環境変数の説明は以下に記しました。

| 名前            | 説明                                                   |
| :-------------- | :----------------------------------------------------- |
| TRELLO_KEY      | Trello API Key                                         |
| TRELLO_TOKEN    | trello API Token                                       |
| LIST_ID         | フィードバック内容が記された新規カードを作成するリスト |
| BUG_REPORT      | バグ報告用ラベル ID                                    |
| FEATURE_REQUEST | 機能開発要望用ラベル ID                                |
| CONTACT         | お問い合わせ用ラベル ID                                |
| OTHER           | その他用ラベル ID                                      |

※ Trello では Borad > List > Card という階層関係があります。  
※ ラベルとは各カードに付与することができるもので、それぞれのカードはフィードバックのタイプによって適切なラベルが１つ付与されます。

これらの変数を入手するには、状況に合わせて２通りの入手方法のうちどちらかをお選び下さい。

### 共用 Trello アカウントを利用する場合

Twin:te アカウントで共用のテスト用 Trello アカウントを作成しています。  
それを利用するための .dev.env を共有します。
@hosokawaR まで

### 独自に Trello アカウントを作成する場合

少々煩雑ですが、以下の手順で独自の Trello アカウントを用いることができます。

#### 1. Trello にサインイン or サインアップ

[サインアップ](https://trello.com/signup)

#### 2. API Key, Token を入手

[開発者向け API キー](https://trello.com/app-key)のページで Key を入手、同じページにあるリンクから Token も入手

#### 3. 各種 ID を入手

以下のコマンドと URL を組み合わせることで各種 ID を入手できます。  
ラベルは事前に問い合わせ種別ごとに割り当てる必要があります。

詳しくは公式の[API Intoroduction](https://developer.atlassian.com/cloud/trello/guides/rest-api/api-introduction/)参照

```bash
header="Authorization: OAuth oauth_consumer_key=\"${TRELLO_KEY}\", oauth_token=\"${TRELLO_TOKEN}\""
curl -H "${header}" <URL> | jq  # 整形
```

| 入手できるもの                             | URL                                             |
| :----------------------------------------- | :---------------------------------------------- |
| 自分が所有する Board ID                    | `https://trello.com/1/members/me/boards`        |
| Card を追加する List ID                    | `https://trello.com/1/boards/<BOARD ID>/lists`        |
| Label ID（事前にラベルを設定する必要あり） | `https://trello.com/1/boards/<BOARD ID>/labels` |
