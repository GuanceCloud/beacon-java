# 同步 OpenTelemetry

## Remote 和标签

当前本地已配置：

- `origin`：预配置的 Beacon Java 目标仓库，尚未推送。
- `legacy`：旧 GuanceCloud 仓库，只作为历史来源。
- `upstream`：官方源码仓库；官方分支抓取至 `upstream/*`，标签抓取至 `refs/upstream-tags/*`。

`git fetch upstream` 已禁用自动混入普通标签；独立标签 refspec 不使用强制更新，官方标签发生改写时应停止并审查。

Git remote/refspec 属于本地配置，不会随提交传给新克隆。未来从 Beacon 仓库全量克隆后，需要执行一次：

```bash
git remote add legacy https://github.com/GuanceCloud/opentelemetry-java-instrumentation.git
git remote add upstream https://github.com/open-telemetry/opentelemetry-java-instrumentation.git
git config remote.upstream.tagOpt --no-tags
git config --add remote.upstream.fetch 'refs/tags/*:refs/upstream-tags/*'
git config remote.pushDefault origin
git fetch --no-tags upstream
```

本地初始化已完成以上设置，不要重复添加。先用 `git remote -v` 和 `git config --get-all remote.upstream.fetch` 核对。

## 每次同步

以下是待执行流程，不是本次初始化已执行的升级：

1. 确保工作区干净，切回 `beacon`，先正常更新已配置的产品远程跟踪分支。
2. `git fetch --no-tags upstream` 抓取官方版本；阅读目标正式版本的 Release Notes，评估 SDK、语义约定及配置变化。
3. 从 `beacon` 新建 `sync/otel-vX.Y.Z` 分支，将 `refs/upstream-tags/vX.Y.Z` 解析为完整提交并固定下来。
4. 使用普通 merge 合入，保留共同历史，不使用 squash、目录覆盖或 unrelated histories。

```bash
# 示例变量：先替换成经评审选定的真实官方标签；不要原样执行占位值。
OTEL_TARGET_TAG='vX.Y.Z'
git switch beacon
git switch -c "sync/otel-${OTEL_TARGET_TAG}"
OTEL_TARGET_COMMIT=$(git rev-parse --verify "refs/upstream-tags/${OTEL_TARGET_TAG}^{commit}")
git merge --no-ff --no-commit "$OTEL_TARGET_COMMIT"
```

5. 逐项解决冲突，不全局采用 ours/theirs。更新差异登记、`upstream.lock.json` 和测试。无法完成时可在确认没有需保留的冲突解决工作后 `git merge --abort`。
6. 合并提交前验证目标提交已在合并父链中；提交完成后执行 `git merge-base --is-ancestor "$OTEL_TARGET_COMMIT" HEAD`，要求退出码为 0。
7. 构建、改动模块单测、muzzle/版本矩阵、Agent 烟测、自有增强回归和数据兼容验收通过后，提交同步 PR。
8. 将同步分支以保留提交历史的方式合入 `beacon`，不要 squash 整个上游同步 PR。普通自有功能 PR 可以另行采用团队约定。

## 版本边界

保持 Gradle 的 SDK/BOM/Instrumentation 依赖组合与选定上游的构建约束一致；不能将每个依赖分别自动升到 latest 就认为兼容。先完成源码同步，再处理安全补丁和额外依赖升级。

`upstream.lock.json` 记录已整合且经过说明的固定来源，而不是网上最新版本号。当前 `v2.30.0` 仅证明其提交是导入提交的祖先，不证明当前下游与官方输出完全相同。

## 同步策略

后续可增加定时检测正式 Release、自动建同步分支/PR 的流程；目前未启用。产品发行必须人工审批，不能在检测到版本后直接推送生产制品。
