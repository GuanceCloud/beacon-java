# Beacon Java 开发入口

本仓库保留完整 OTel Java Instrumentation 源码和提交历史，不是仅加载扩展的二次打包工程。

## 当前基线

- 导入：`GuanceCloud/opentelemetry-java-instrumentation` 的 `guance-v2`，提交 `73a8f7edd0415f0e8651d3d1f3f295e6e6d4d1ea`。
- 官方发布祖先：`v2.30.0`，提交 `080c1d32ca676ba7b0210c21b60cce8e7ac39058`，已验证祖先关系。
- 下游构建版本仍为 `2.30.2` / `2.30.2-alpha`，不是 Beacon 的发行版本。
- `beacon` 是新产品主线；旧分支保存在 `legacy/*` 引用中，旧标签原样保留。
- 已抓取官方引用，但没有将新的官方版本合入产品主线。

## 工程约定

- 保留根目录 `instrumentation/`、`javaagent/` 等上游布局，直接在对应模块开发原生插桩增强。
- `beacon/` 存放下游管理文档和元数据，目前不是新 Gradle 模块。
- 保留上游包名、LICENSE、第三方声明和构建版本逻辑，不做全仓品牌替换。
- 提交自有增强时同步维护差异登记及对应测试，尽可能向上游贡献通用改动。
- 开发遵守根目录 [AGENTS.md](../AGENTS.md) 和 [CONTRIBUTING.md](../CONTRIBUTING.md)。

## 操作入口

- [固定来源记录](upstream.lock.json)
- [上游同步步骤](UPSTREAM.md)
- [发布步骤与当前缺口](RELEASING.md)
- [下游差异审计](changes/README.md)

本次只初始化仓库与文档，未执行 Gradle 构建或运行测试。继承的 CI/CD 不代表 Beacon 发布自动化已就绪。
