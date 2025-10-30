# 店铺删除功能实现文档

## 概述

实现了完整的店铺删除功能，包括软删除（立即生效）和硬删除（7天后自动清理资源）。

---

## 实现的功能

### 1. 前端过滤 - 隐藏已删除店铺 ✅

**修改文件**:
- `public/index.html`
- `public/dashboard.html`

**实现**:
```javascript
// 在 loadShops() 函数中添加过滤
if (data.shops) {
  data.shops = data.shops.filter(s => s.status !== 'deleted');
}
```

**效果**: 已删除的店铺不再在用户界面显示

### 2. 数据库 Schema 更新 ✅

**修改文件**: `src/db/schema.js`

**新增字段**:
```javascript
deleted_at: timestamp('deleted_at'), // 软删除时间
scheduled_hard_delete_at: timestamp('scheduled_hard_delete_at'), // 计划硬删除时间（7天后）
```

**修改文件**: `src/db/bootstrap.js`

**自动迁移**:
```sql
ALTER TABLE IF EXISTS shops
  ADD COLUMN IF NOT EXISTS deleted_at timestamp,
  ADD COLUMN IF NOT EXISTS scheduled_hard_delete_at timestamp
```

### 3. 软删除逻辑增强 ✅

**修改文件**: `src/server.js` (第 785-826 行)

**实现细节**:
```javascript
const now = new Date();
const hardDeleteDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7天后

await db.update(shops)
  .set({ 
    status: 'deleted', 
    deleted_at: now,
    scheduled_hard_delete_at: hardDeleteDate,
    updated_at: now 
  })
  .where(eq(shops.id, shopId));

// 记录审计日志
await logAuditEvent(req.user.id, 'shop_soft_deleted', 'shop', shopId, {...});
```

**返回值**: 包含 `scheduled_hard_delete_at` 信息

### 4. 硬删除服务 ✅

**新文件**: `src/services/cleanup.service.js`

**功能**:
- `hardDeleteShop(shopId)` - 硬删除店铺
  - 检查 Fly.io 应用是否存在
  - 执行 `flyctl apps destroy --yes`
  - 删除数据库记录（级联删除相关表）
  - 返回删除结果

- `getScheduledForDeletion()` - 获取计划删除列表
  - 查询所有 deleted 状态的店铺
  - 标记哪些已到期可删除

### 5. 定时清理任务 ✅

**修改文件**: `src/services/queue.js`

**实现**:
```javascript
// 创建定时清理队列
scheduledCleanupQueue = new Queue('scheduled-cleanup', {...});

// 添加每小时重复任务
scheduledCleanupQueue.add(
  'cleanup-deleted-shops',
  {},
  {
    repeat: {
      pattern: '0 * * * *', // 每小时运行
    },
    jobId: 'cleanup-deleted-shops-hourly',
  }
);

// 清理处理器
class CleanupProcessor {
  async processCleanup(job) {
    // 查找到期的deleted店铺
    // 调用 hardDeleteShop()
    // 记录结果
  }
}
```

**Worker**: 单并发，确保清理任务顺序执行

### 6. 优雅关闭 ✅

**修改文件**: `src/services/queue.js`

**更新 closeQueue() 函数**:
```javascript
export async function closeQueue() {
  if (shopCreationWorker) await shopCreationWorker.close();
  if (cleanupWorker) await cleanupWorker.close();
  if (shopCreationQueue) await shopCreationQueue.close();
  if (scheduledCleanupQueue) await scheduledCleanupQueue.close();
  if (redisConnection) redisConnection.disconnect();
}
```

---

## 删除流程

### 用户删除操作
```
用户点击 Delete 按钮
  ↓
确认对话框
  ↓
DELETE /api/shops/:id
  ↓
设置 status='deleted'
设置 deleted_at=现在
设置 scheduled_hard_delete_at=7天后
  ↓
前端刷新，该店铺消失 ✅
```

### 自动硬删除（7天后）
```
定时任务（每小时运行）
  ↓
查询 scheduled_hard_delete_at <= now 且 status='deleted' 的店铺
  ↓
对每个店铺：
  1. 检查 Fly 应用是否存在
  2. flyctl apps destroy --yes
  3. 删除数据库记录
  4. 记录日志
  ↓
资源完全清理 ✅
```

---

## 技术细节

### 软删除 vs 硬删除

| 类型 | 时机 | 操作 | 可恢复 |
|------|------|------|--------|
| 软删除 | 立即 | 标记 status='deleted' | 是（修改数据库） |
| 硬删除 | 7天后 | 删除 Fly 应用 + DB 记录 | 否 |

### 定时任务配置

- **频率**: 每小时（Cron: `0 * * * *`）
- **并发**: 1（顺序执行）
- **重试**: 3次（指数退避）
- **保留**: 保留10个成功任务，50个失败任务

### 错误处理

1. **Fly 应用不存在**: 继续删除数据库记录
2. **Fly 删除失败**: 记录错误，继续数据库清理
3. **数据库删除失败**: 抛出错误，任务重试

---

## 测试验证

### 已测试功能

1. ✅ 前端过滤 deleted 店铺
2. ✅ 软删除 API 调用
3. ✅ 删除时间字段记录
4. ✅ 定时任务初始化
5. ✅ Worker 启动日志

### 测试结果

- **前端**: deleted 店铺已从列表中隐藏
- **后端**: 删除逻辑增强，记录时间戳
- **队列**: 清理队列和worker成功初始化
- **日志**: 显示 "📅 Scheduled cleanup queue initialized (runs hourly)"

---

## 日志标识

- `🗑️` - 软删除操作
- `🧹` - 清理任务运行
- `📅` - 定时任务初始化
- `✅` - 成功操作
- `❌` - 失败操作

---

## 配置

### 环境变量
- 无需额外配置
- 使用现有的 `FLY_API_TOKEN`
- 使用现有的 Redis 连接

### 清理频率调整

修改 `src/services/queue.js` 中的 cron 模式：
```javascript
pattern: '0 * * * *', // 每小时
// pattern: '0 */6 * * *', // 每6小时
// pattern: '0 0 * * *', // 每天午夜
```

### 删除延迟调整

修改 `src/server.js` 中的延迟时间：
```javascript
const hardDeleteDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7天
// const hardDeleteDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30天
```

---

## 部署状态

- **版本**: deployment-01K8SY1APD73PKNHX4373ZBEGC
- **状态**: ✅ 已部署
- **功能**: ✅ 全部启用

---

**实现完成时间**: 2025-10-30
**实现人**: AI Assistant (Claude)

