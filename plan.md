# YouTube動画操作Chrome拡張機能 - SpeedPilot

## 概要
YouTubeなどの動画をキーボードショートカットで操作できるChrome拡張機能

## 要件
- TypeScriptで記述
- YouTubeなどの動画をキーボードショートカットで操作できるようにする
- ショートカットでできることは再生速度の変更、指定秒数飛ばす
- 再生速度、指定秒数は設定画面で設定できるようにする
- 現在の再生速度は動画の左上に小さくオーバーレイ表示
- 操作したい動画が表示されているページのHTML構造は変更せずにこれらを実現

## 技術スタック
- TypeScript（tscでビルド、Webpackは使用しない）
- Biome（コードフォーマット・リント）
- Chrome Extension Manifest V3

## プロジェクト構造
```
speedpilot/
├── manifest.json         # Chrome拡張機能のマニフェストファイル
├── src/
│   ├── content.ts       # 動画ページに挿入されるコンテンツスクリプト
│   ├── background.ts    # バックグラウンドスクリプト
│   ├── popup/
│   │   ├── popup.html   # 設定画面のHTML
│   │   ├── popup.ts     # 設定画面のTypeScript
│   │   └── popup.css    # 設定画面のスタイル
│   └── types/
│       └── index.ts     # 型定義
├── dist/                # TypeScriptコンパイル出力ディレクトリ
├── package.json         # npm設定
├── tsconfig.json        # TypeScript設定
└── biome.json          # Biome設定（コードフォーマット・リント）
```

## 主な機能

### 1. 再生速度変更
- デフォルトで+/-0.25倍速
- 設定画面で増減幅をカスタマイズ可能
- 0.25倍速〜4倍速の範囲で調整

### 2. 前後スキップ
- デフォルトで±10秒
- 設定画面でスキップ秒数をカスタマイズ可能

### 3. 速度表示オーバーレイ
- 動画左上に半透明で表示
- 速度変更時に一時的に強調表示
- ページのHTML構造は変更しない（絶対位置で配置）

### 4. 設定保存
- Chrome Storage APIで設定を永続化
- 設定はすべてのタブで共有

## デフォルトキーボードショートカット
- `[`: 速度を下げる
- `]`: 速度を上げる
- `←`: 後方スキップ
- `→`: 前方スキップ
- `Space`: 再生/一時停止（既存機能を維持）

## 対応サイト
- YouTube
- その他のHTML5 video要素を使用する動画サイト

## ビルド設定
### npm scripts
- `build`: TypeScriptコンパイル
- `watch`: ファイル変更監視
- `format`: Biomeでフォーマット
- `lint`: Biomeでリント

## Chrome拡張機能の権限
- `storage`: 設定の保存
- `activeTab`: 現在のタブでの動作
- `host_permissions`: 動画サイトへのアクセス