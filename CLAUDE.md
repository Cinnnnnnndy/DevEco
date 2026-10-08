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

## demo 28 冻屏分析报告：只迭代 V2

- `demos/28-appfreeze-report/index.html` 是 **V1**（Agent 版），冻结保留，不再改动。
- `demos/28-appfreeze-report/v2.html` 是 **V2**（原报告内容完整版、官网视觉、单文件可下载），之后所有修改都只改它。
  页面内的 `#v1` 哈希表示“源码不可达”这一状态，跟 V1 / V2 版本号没有关系。
- V2 的迭代规则：**原报告内容不动，只改呈现形式**。两份原报告（`analysis/appfreeze-report/input/`）里的每一句都要逐字保留；重复的信息可以合并，顺序可以调整，排版可以改，但不改写措辞、不补写原报告没有的结论或摘要。**时间线可视化保留**。
  改完跑一遍覆盖检查：原报告每一句都能在页面文本里找到。
- 启动页卡片的主链接指向 V2，缩略图是 `site/thumbs/28-appfreeze-report-v2.jpg`（重截方法：用 headless Chromium 打开 v2.html，参考 `site/tools/thumb.py`）。
