# Git運用ルール

## 背景

このプロジェクトは**2つの更新経路**があります：
1. **ローカルでのコード編集** → `git commit` → `git push`
2. **管理画面（admin.html）からのコンテンツ更新** → GitHub API経由で直接コミット

そのため、通常の`git push`では競合が発生する可能性があります。

## 推奨される運用方法

### ✅ 方法1: `git sync` コマンドを使う（推奨）

```bash
# コード変更後
git add .
git commit -m "コミットメッセージ"

# syncコマンドで自動的にpull --rebase → pushを実行
git sync
```

### ✅ 方法2: 手動で実行

```bash
git add .
git commit -m "コミットメッセージ"
git pull --rebase
git push
```

## 自動保護機能

`git push`を実行した際、リモートに新しい変更がある場合は**自動的にエラー**が表示され、pushが拒否されます。

その場合は以下を実行してください：

```bash
git pull --rebase
git push
```

または

```bash
git sync
```

## トラブルシューティング

### rebase中に競合が発生した場合

```bash
# 競合を手動で解決後
git add .
git rebase --continue

# その後push
git push
```

### rebaseを中止したい場合

```bash
git rebase --abort
```

## まとめ

**常に `git sync` を使うことを推奨します**

これにより、管理画面からの更新とローカルでのコード編集が安全に共存できます。
