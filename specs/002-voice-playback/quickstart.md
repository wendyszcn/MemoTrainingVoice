# Quick Start: 语音播放功能

## 前置要求

- 已安装 Node.js 18+
- 已完成 `001-number-memory-training` 项目初始化

## 实现步骤

### Phase 1: 语音服务开发

1. **创建语音合成服务**: `src/services/speechSynthesis.ts`
   - 封装 Web Speech API
   - 实现 speak(), stop(), isSupported() 方法

2. **创建语音 Hook**: `src/hooks/useSpeechSynthesis.ts`
   - 管理语音配置状态
   - 提供 speak, stop 接口

3. **集成到训练流程**:
   - 修改 `TrainingView.tsx` - 显示数字时调用语音播报
   - 修改结果展示 - 正确答案/错误时语音反馈

### Phase 2: 设置界面

4. **扩展设置页面**: 修改 `src/pages/SettingsView.tsx`
   - 添加语音开关
   - 添加语速滑块

## 开发命令

```bash
# 启动开发服务器
cd apps/number-memory && npm run dev

# 运行测试
npm test
```

## 关键代码示例

```typescript
// 语音播报数字
const speakDigits = (digits: string) => {
  const utterance = new SpeechSynthesisUtterance(digits)
  utterance.lang = 'zh-CN'
  utterance.rate = 1
  speechSynthesis.speak(utterance)
}

// 停止播报
speechSynthesis.cancel()
```
