# CI 与首次上线检查

## 分支与检查入口

产品开发主线使用 `main`，代码延续导入的 GuanceCloud 增强，不切换到旧仓库的同名分支。

- [主线构建](../.github/workflows/build.yml)：监听 `main` 和维护分支的 push，复用现有构建、测试、Muzzle 和 lint。
- [PR 构建](../.github/workflows/build-pull-request.yml)：复用已有 PR 检查；合入目标为 `main`。
- [公共构建](../.github/workflows/build-common.yml)：运行标签抓取工具的本地 Git 测试和最小 Gradle 工程的打包回归；现有 Gradle `check` 同时校验 Beacon 完整 Agent 的命名和 Manifest，并上传 `beacon-javaagent-*.jar` 开发制品。CI artifact 不等于正式 Release。
- Wrapper、元数据检查、PR 测试镜像构建、依赖审查、CodeQL 和工作流静态检查保留；其中部分检查需要相应 GitHub 功能和权限。

保留工作流定义不代表已经在 GuanceCloud 环境运行通过。首次远程验证后，再选择实际成功运行的检查名称作为分支保护的必需项。

## 继承工作流的隔离

继承的正式发布、快照/镜像发布、自动改依赖、自动改源码、Issue/PR 管理机器人及尚未适配的定时任务，通过 job 级仓库条件限制在原 OpenTelemetry 仓库运行。旧 Guance 发布流程限定在旧 GuanceCloud 仓库运行。

这些限制保留原任务实现及既有条件，不依靠“没有配置 secret”防止误运行。在 Beacon 及普通下游仓库中，受限任务会跳过；页面仍可能显示相应工作流或跳过的运行。

可复用的发布与故障通知任务也受限制。CodeQL 的扫描保留，其继承的定时失败 Issue 通知只在上游运行。Beacon 尚未启用自动发布、自动上游升级或 PR/Issue 管理机器人。

`*.lock.yml` 是继承的生成文件，当前也加了隔离条件。重新生成或合入上游版本时，必须重新核对这些条件，不能直接用生成结果覆盖后启用。未来按实际需要逐项适配，不整体取消仓库限制。

## 首次 GitHub 上线

1. 核对目标仓库、可见范围与 Actions 策略；首次推送前保持 Actions 关闭，或先完成允许执行的工作流审查。
2. 只推送准备好的 `main` 开发分支，并将远程默认分支设为 `main`；不盲推旧分支和全部历史标签。
3. 启用所需测试工作流，运行一次 PR 和主线构建，确认依赖、Runner、网络和检查权限可用。
4. 确认维护者名单，填写有效的 [CODEOWNERS](../.github/CODEOWNERS)，配置分支保护；当前文件没有生效的所有者规则。
5. 检查工作流和文档链接从预期读者权限下可访问，并更新 [Beacon 产品入口](https://github.com/GuanceCloud/beacon)中的待发布状态。

## 仍需确认

- 具有仓库权限的维护者或团队、远程分支保护及审批人。
- 正式制品托管、签名与发布凭证；产品版本、文件名和 Manifest 由 [Beacon 打包配置](agent.gradle.kts)管理。
- 实际支持矩阵与构建、运行验收结果。

这些项目未完成前，只能视为开发工程准备，不能宣布正式发行。发布顺序见[发行流程](RELEASING.md)。
