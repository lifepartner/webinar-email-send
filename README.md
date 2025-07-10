# お問い合わせフォーム - Node.js + Express + Nodemailer

このプロジェクトは、Node.js + Express + Nodemailerを使用したお問い合わせフォームの実装です。

## プロジェクト構造

```
├── index.html          # フロントエンド（お問い合わせフォーム）
├── thanks.html         # 送信完了ページ
├── css/               # スタイルシート
├── js/
│   └── form-handler.js # フォーム処理JavaScript
├── images/            # 画像ファイル
└── backend/           # バックエンド
    ├── server.js      # Expressサーバー
    ├── package.json   # Node.js依存関係
    └── env.example    # 環境変数テンプレート
```

## セットアップ手順

### 1. バックエンドのセットアップ

```bash
# バックエンドディレクトリに移動
cd backend

# 依存関係をインストール
npm install

# 環境変数ファイルを作成
cp env.example .env
```

### 2. 環境変数の設定

`backend/.env`ファイルを編集して、以下の設定を行ってください：

```env
# Server Configuration
PORT=3000

# Email Configuration (Gmailの場合)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Admin Email (where contact form submissions will be sent)
ADMIN_EMAIL=admin@example.com

# Company Information
COMPANY_NAME=Your Company Name
COMPANY_EMAIL=noreply@example.com
```

#### Gmail設定について

Gmailを使用する場合、以下の手順でアプリパスワードを取得してください：

1. Googleアカウントの設定にアクセス
2. セキュリティ → 2段階認証を有効化
3. アプリパスワードを生成
4. 生成されたパスワードを`SMTP_PASS`に設定

### 3. バックエンドサーバーの起動

```bash
# 開発モードで起動
npm run dev

# または本番モードで起動
npm start
```

サーバーが正常に起動すると、以下のメッセージが表示されます：
```
Server is running on port 3000
Health check: http://localhost:3000/api/health
Contact form endpoint: http://localhost:3000/api/contact
```

### 4. フロントエンドの起動

フロントエンドは静的ファイルなので、任意のWebサーバーで提供できます：

- Live Server (VS Code拡張)
- Python: `python -m http.server 8000`
- Node.js: `npx serve .`

## 使用方法

1. バックエンドサーバーを起動（ポート3000）
2. フロントエンドを起動（任意のポート）
3. ブラウザでフロントエンドにアクセス
4. お問い合わせフォームに情報を入力して送信
5. 管理者とお客様の両方にメールが送信されます

## API エンドポイント

### POST /api/contact

お問い合わせフォームの送信処理

**リクエストボディ:**
```json
{
  "company": "企業名",
  "name1": "氏",
  "name2": "名",
  "kana1": "氏（かな）",
  "kana2": "名（かな）",
  "email": "email@example.com",
  "phone": "電話番号",
  "industry": "業種",
  "inquiry": "お問い合わせ内容"
}
```

**レスポンス:**
```json
{
  "success": true,
  "message": "お問い合わせを送信しました"
}
```

### GET /api/health

サーバーの健全性チェック

**レスポンス:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 機能

- ✅ フォームバリデーション（フロントエンド・バックエンド両方）
- ✅ 管理者への通知メール送信
- ✅ お客様への自動返信メール送信
- ✅ エラーハンドリング
- ✅ CORS設定
- ✅ セキュリティヘッダー（Helmet）
- ✅ 環境変数による設定管理

## トラブルシューティング

### メール送信エラー

1. SMTP設定を確認
2. Gmailの場合、アプリパスワードが正しく設定されているか確認
3. ファイアウォールやセキュリティソフトの設定を確認

### CORSエラー

1. フロントエンドのURLが`backend/server.js`のCORS設定に含まれているか確認
2. 必要に応じてCORS設定を更新

### ポート競合

1. ポート3000が使用中の場合は、`.env`ファイルで`PORT`を変更
2. フロントエンドのJavaScriptファイルでAPI_BASE_URLを更新

## ライセンス

MIT License "# webinar-email-send" 
