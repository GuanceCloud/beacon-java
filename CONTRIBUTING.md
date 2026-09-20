# 贡献指南

Beacon Java 的功能、缺陷和 PR 在本仓库处理，PR 目标分支为 `main`。涉及通用 OpenTelemetry 行为的改进，在本仓库明确复现和影响后，再按上游贡献流程提交。

## 开发准备

使用 Git 完整克隆和 JDK 21，在仓库根目录执行以下命令。仅配置 remote 不会自动获取历史或改变 GitHub 默认分支。

```bash
java -version
./gradlew :javaagent:assemble
```

完整 Agent 产物为 `javaagent/build/libs/beacon-javaagent-<Beacon版本>.jar`，产品版本由 [beacon/version.properties](beacon/version.properties) 唯一定义。`assemble` 同时校验制品名称、Manifest 产品标识和内嵌上游来源；这不替代功能测试或正式发行验收。

[Beacon 打包配置](beacon/agent.gradle.kts)只定制完整 Agent 的文件名、Manifest 和来源记录，不替换上游模块版本、Maven 坐标或 Java 包名。[version.gradle.kts](version.gradle.kts)继续管理继承的模块构建版本，OTel 官方来源单独记录在[基线文件](beacon/upstream.lock.json)。`base`、`dontuse` 等内部辅助 JAR 不是 Beacon 安装包。

不要把官方 Sonatype 快照当作 Beacon 快照，当前没有 Beacon 快照发布渠道。

## 修改与测试

- 原生插桩改动放在对应上游模块，保留既有布局、包名和许可证。
- 实现与回归测试在同一 PR 提交，说明用户可见影响、配置变化和兼容范围。
- 普通功能 PR 可按团队规则整理提交；上游同步 PR 必须保留上游祖先关系。
- 用户可见变化写入 [Beacon Changelog](beacon/CHANGELOG.md) 的 `Unreleased`；详细实现和测试证据保留在 PR/CI，不另建差异台账。破坏性变化必须提供迁移说明。
- 根目录 [CHANGELOG.md](CHANGELOG.md)保留上游日志；Beacon 日志不重复抄录上游全部变化。当前日志手工维护，不依赖上游标签机器人。

## 技术参考

- [代码风格](docs/contributing/style-guide.md)
- [测试运行](docs/contributing/running-tests.md)
- [编写 instrumentation](docs/contributing/writing-instrumentation.md)
- [Agent 结构](docs/contributing/javaagent-structure.md)
- [Muzzle 兼容检查](docs/contributing/muzzle.md)
- [调试](docs/contributing/debugging.md)
- [IntelliJ 配置](docs/contributing/intellij-setup-and-troubleshooting.md)

这些技术文档随所采用的源码维护。不要将其中的上游发布地址、组织权限或机器人行为直接视作 Beacon 已有能力。

## 维护工具验证

上游标签抓取脚本只依赖 Bash 和 Git。修改脚本后运行以下测试，测试另需 Node.js 18 或更高版本：

```bash
bash -n beacon/scripts/fetch-upstream-tag.sh
node --test beacon/scripts/fetch-upstream-tag.test.cjs
```

脚本测试只使用临时本地 Git 仓库，不访问网络，不运行源码合并或发布。

修改产品打包配置后运行：

```bash
node --test beacon/scripts/agent-packaging.test.cjs
```

该测试用仓库 Gradle Wrapper 在临时最小工程中执行实际打包配置，验证产品版本、文件名、Manifest 和错误拒绝；首次运行可能需要下载 Gradle。它不构建完整 Agent，不能代替 `:javaagent:assemble`。

## 上线与发行

首次 GitHub 上线前完成 [CI 检查](beacon/CI.md)，正式发行按[发行流程](beacon/RELEASING.md)执行。维护者名单与远程分支保护需由仓库管理员确认，不沿用上游组织的 CODEOWNERS。
