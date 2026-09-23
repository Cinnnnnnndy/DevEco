# DevEco

## 提交身份（本仓库所有分支一律生效）

每一条 commit 都以仓库主人的身份提交，而不是 Claude：

```
user.name  = Cindy_wxd
user.email = 209322477+Cinnnnnnndy@users.noreply.github.com
```

`.claude/hooks/set-git-identity.sh` 会在每次会话开始时把这两项写进 `.git/config`
（仓库级配置优先于云端沙箱全局 `~/.gitconfig` 里的 `Claude <noreply@anthropic.com>`）。
本机已配好本人身份时该 hook 不改动。hook 没跑到时，commit 前手动执行：

```bash
git config --local user.name  "Cindy_wxd"
git config --local user.email "209322477+Cinnnnnnndy@users.noreply.github.com"
git config --local commit.gpgsign false
```

提交后用 `git log -1 --pretty='%an <%ae>'` 复核，出现 `noreply@anthropic.com` 就改完重新提交。

不要在 commit message 里写 `Co-Authored-By: Claude ...` 或 `Claude-Session: ...` 尾注，
也不要在 PR 描述里加 Claude Code 署名——`.claude/settings.json` 的 `attribution` 已关掉它们。
