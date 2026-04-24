
# 書道教室Schedule

このプロジェクトは、NextJS、Firebase、Genkitを使用して構築された書道教室向けのスケジュール管理システムです。

## GitHubへのアップロード手順

このコードをGitHubに上げるには、ご自身のPCのターミナルで以下のコマンドを順番に実行してください。

1. **Gitの初期化**
   ```bash
   git init
   ```

2. **ファイルの追加**
   ```bash
   git add .
   ```

3. **最初のコミット**
   ```bash
   git commit -m "initial commit"
   ```

4. **GitHubリポジトリとの紐付け**
   （GitHubでリポジトリを作成した後、表示されるURLをコピーしてください）
   ```bash
   git remote add origin <あなたのリポジトリURL>
   ```

5. **アップロード（Push）**
   ```bash
   git branch -M main
   git push -u origin main
   ```

## 注意事項
- `FIREBASE_SERVICE_ACCOUNT_KEY` などの機密情報は、絶対にGitHubに公開しないでください。環境変数として設定するようにしてください。
