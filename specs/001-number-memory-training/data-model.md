# Data Model: 数字记忆训练工具

## 实体定义

### 1. 训练记录 (TrainingRecord)

| 字段 | 类型 | 描述 | 验证规则 |
|------|------|------|----------|
| id | string | 唯一标识符 (UUID) | 自动生成 |
| date | string | 训练日期 (ISO 8601) | YYYY-MM-DD格式 |
| digitCount | number | 本次训练的数字位数 | 3-∞ |
| correctCount | number | 正确次数 | ≥ 0 |
| incorrectCount | number | 错误次数 | ≥ 0 |
| score | number | 得分 (正确次数 × 位数) | 计算得出 |

**生命周期**: 创建于每次训练完成后，永久存储于localStorage

---

### 2. 用户统计 (UserStats)

| 字段 | 类型 | 描述 | 验证规则 |
|------|------|------|----------|
| totalTrainings | number | 总训练次数 | ≥ 0 |
| highestDigitCount | number | 历史最高位数 | ≥ 3 |
| totalCorrect | number | 累计正确次数 | ≥ 0 |
| totalQuestions | number | 累计总题数 | ≥ 0 |

**计算属性**:
- `averageAccuracy`: (totalCorrect / totalQuestions) × 100%

---

### 3. 训练配置 (TrainingConfig)

| 字段 | 类型 | 描述 | 默认值 | 验证规则 |
|------|------|------|--------|----------|
| displayDuration | number | 数字显示时长(毫秒) | 2000 | 500-10000 |
| currentDigitCount | number | 当前数字位数 | 3 | ≥ 3 |
| consecutiveCorrect | number | 连续正确计数 | 0 | ≥ 0 |
| consecutiveIncorrect | number | 连续错误计数 | 0 | ≥ 0 |

---

## localStorage 键名

| 键名 | 数据类型 | 描述 |
|------|----------|------|
| `nm_training_records` | TrainingRecord[] | 训练历史记录数组 |
| `nm_user_stats` | UserStats | 用户统计数据 |
| `nm_training_config` | TrainingConfig | 当前训练配置 |

---

## 状态转换

### 训练状态机

```
IDLE → (开始训练) → SHOWING_DIGITS → (超时/用户请求隐藏) → INPUTTING → (提交答案)
  ↓                                                        ↓
  ←──────────(重新开始)─────────────────────(结果显示)─────↓
```

| 状态 | 描述 |
|------|------|
| IDLE | 初始状态，等待用户开始 |
| SHOWING_DIGITS | 显示数字序列 |
| INPUTTING | 等待用户输入答案 |
| RESULT_SHOWING | 显示答题结果 |

---

## 数据导入/导出格式

### JSON导出结构

```json
{
  "version": "1.0",
  "exportDate": "2026-02-17T10:00:00Z",
  "data": {
    "records": [...],
    "stats": {...},
    "config": {...}
  }
}
```

### 导入验证规则

- 验证JSON格式完整性
- 验证版本号兼容性
- 验证records数组中每条记录必需字段
- 合并策略: 导入数据覆盖本地数据
