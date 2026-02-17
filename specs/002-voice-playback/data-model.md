# Data Model: 语音播放功能

## 实体定义

### 语音配置 (VoiceConfig)

| 字段 | 类型 | 描述 | 默认值 | 验证规则 |
|------|------|------|--------|----------|
| enabled | boolean | 语音播报开关 | true | - |
| rate | number | 语速 (0.1-10) | 1 | 0.1-10 |
| pitch | number | 音调 (0-2) | 1 | 0-2 |
| volume | number | 音量 (0-1) | 1 | 0-1 |
| voiceLang | string | 语音语言 | "zh-CN" | - |

**存储位置**: 浏览器 localStorage (`nm_voice_config`)

---

## 状态

| 状态 | 描述 |
|------|------|
| IDLE | 语音服务空闲 |
| SPEAKING | 正在语音播报 |
| STOPPED | 用户主动停止 |

---

## 数据流程

1. 用户在设置中配置语音选项 → 保存到 localStorage
2. 训练开始显示数字时 → 从 localStorage 读取配置 → 调用 Web Speech API 播报
3. 用户提交答案时 → 根据正确/错误调用对应语音
4. 页面切换时 → 自动停止当前语音

---

## 扩展现有实体

现有 TrainingConfig 需扩展添加语音相关字段（见上），或独立存储语音配置。
