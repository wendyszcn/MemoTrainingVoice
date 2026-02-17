# Storage Service Contract

> 定义前端应用与 localStorage 之间的数据操作接口

## 命名空间: StorageService

### 方法签名

#### 1. 训练记录操作

```typescript
// 保存训练记录
function saveTrainingRecord(record: TrainingRecord): void

// 获取所有训练记录
function getTrainingRecords(): TrainingRecord[]

// 清空所有训练记录
function clearTrainingRecords(): void
```

#### 2. 用户统计操作

```typescript
// 更新用户统计
function updateUserStats(record: TrainingRecord): void

// 获取用户统计
function getUserStats(): UserStats

// 重置用户统计
function resetUserStats(): void
```

#### 3. 配置操作

```typescript
// 保存训练配置
function saveConfig(config: TrainingConfig): void

// 获取训练配置
function getConfig(): TrainingConfig
```

#### 4. 导入/导出操作

```typescript
// 导出所有数据为JSON
function exportAllData(): ExportData

// 从JSON导入数据
function importData(data: ExportData): ImportResult
```

---

## 错误处理

| 错误码 | 描述 | 处理方式 |
|--------|------|----------|
| STORAGE_FULL | localStorage已满 | 提示用户清理数据 |
| INVALID_DATA | 数据格式无效 | 拒绝导入并提示 |
| PARSE_ERROR | JSON解析失败 | 返回错误信息 |
