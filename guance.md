# 二次开发

> 历史归档：本文仅保留旧 Guance 仓库的开发记录，不适用于 Beacon Java。
> Beacon 使用 `main`、独立产品版本和 `beacon-vX.Y.Z` 标签；请按[贡献指南](CONTRIBUTING.md)、[上游同步](beacon/UPSTREAM.md)和[发行流程](beacon/RELEASING.md)操作，不执行本文旧的分支和推送命令。
> 下文旧版本的“SQL 脱敏”表述不代表当前行为；当前配置含义见 [JDBC 配置](instrumentation/jdbc/README.md)。


## 分支和版本

目前有两个主流分支：guance 和 guance-v2 ，对应的是 V1 版本和 V2 版本。 这另个分支不可以 merge ！

guance 分支不在进行功能上的开发，仅仅修复已知bug即可。

新功能开发的时候，切换到 `guance-v2` , 功能完成及测试完毕后发版本应该：

```shell
git add .
git commit -m "commit_message"
# 打tag之后推送到github
git tag -a "v2.x.x-ext" -m "v2.x.x-ext"
git push 
git push --tag
```


当otel有新版本之后，先checkout到主分支上，pull到最新的tag，在新的tag分支上，先编译后再merge，否则 guance-v2 编译失败排查问题就很麻烦。

## V2 版本历史

### v2.11.0-guance

增加sql脱敏功能，可以通过环境变量开启：`-Dotel.jdbc.sql.obfuscation=true` 
