# 下游差异登记

状态：待审计。空白登记不代表没有下游改动，旧 `guance-v2` 中已有修改均已随源码导入。

以 `beacon/upstream.lock.json` 中的官方提交为基线：

```bash
git log --oneline 080c1d32ca676ba7b0210c21b60cce8e7ac39058..beacon
git diff --stat 080c1d32ca676ba7b0210c21b60cce8e7ac39058 beacon
```

上述日志也可能包含官方基线之后的上游提交，不能把每一条都算作自有补丁。

每项差异至少登记：标识、目的、涉及模块、负责团队、相关提交、测试位置、配置/行为影响、上游 PR、同步冲突处理和退出条件。原生增强应在对应 instrumentation 模块内实现和测试。
