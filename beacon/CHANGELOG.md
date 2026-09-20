# Beacon Java Changelog

这里只记录 Beacon 产品变化。根目录 [CHANGELOG.md](../CHANGELOG.md)保留上游日志；OTel 标签和完整提交由[基线文件](upstream.lock.json)记录。

## Unreleased

### 工程与发行

- 产品主线使用 `main`，保留完整上游历史和 GuanceCloud 下游增强。
- 使用独立产品版本，开发起点为 `0.1.0-SNAPSHOT`；这不是已经发布的版本。
- 完整 Agent 命名为 `beacon-javaagent-<Beacon版本>.jar`，Manifest 记录 Beacon 版本、模块构建版本及上游标签和提交，制品内嵌来源记录。
- 隔离继承的发布和管理自动化，保留构建检查，独立维护 Beacon 同步与发行流程。
- 用本日志记录产品变化，不再维护独立的下游差异台账。

### 初始导入

- 从 GuanceCloud `guance-v2` 的 `73a8f7edd0415f0e8651d3d1f3f295e6e6d4d1ea` 导入完整源码；采用的官方发布祖先为 OTel Java Instrumentation `v2.30.0`。
- 继承 JDBC 旧配置兼容、实验性 JFR Profiling / DataKit 导出、Spring AI、Spring AI Alibaba Agent、HSF 插桩。这些是原分支已有实现，不是迁移后新开发或已通过 Beacon 验收的能力。

后续 Profiling Extension 迁移尚未实现，方向见[开发说明](README.md#profiling-的扩展边界)；完成后再登记实际变更。
