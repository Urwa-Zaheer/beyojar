# 🚀 Quick Start Guide - AI Assistant Features

## 5-Minute Setup

### Step 1: Install Dependencies (2 min)
```bash
cd beyojar/mobile
npm install axios expo-speech
```

### Step 2: Add Environment Variables (1 min)
Create `.env` in `beyojar/mobile/`:
```env
REACT_APP_AI_API_KEY=your-openai-key
REACT_APP_AI_MODEL=gpt-4
REACT_APP_ENABLE_VOICE_NOTES=true
```

### Step 3: Add Screen to Navigation (1 min)
In `src/navigation/Navigation.tsx`:
```typescript
import AIAssistantScreen from '@src/screens/AIAssistantScreen';

// Add to Drawer.Navigator:
<Drawer.Screen name="AI Assistant" component={AIAssistantScreen} />
```

### Step 4: Initialize Services (1 min)
In `App.tsx`:
```typescript
import { initializeAIServices } from '@src/config/aiConfig';

useEffect(() => {
  initializeAIServices();
}, []);
```

**Done!** Run your app with `npm start`

---

## Common Tasks

### Extract Tasks from a Note
```typescript
import { useAIAssistant } from '@src/hooks/useAI';

const { extractTasksFromNote } = useAIAssistant({
  apiKey: 'your-key'
});

await extractTasksFromNote(noteContent);
```

### Create a Habit
```typescript
import { useHabitTracking } from '@src/hooks/useAI';

const { createHabit } = useHabitTracking();

createHabit({
  name: 'Exercise',
  frequency: 'daily'
});
```

### Complete a Habit
```typescript
const { completeHabit } = useHabitTracking();
completeHabit(habitId);
```

### Create a Goal
```typescript
import { useGoalTracking } from '@src/hooks/useAI';

const { createGoal } = useGoalTracking();

createGoal({
  title: 'Project Alpha',
  targetDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
  priority: 'high'
});
```

### Show Daily Insights
```typescript
import { useAIAssistant } from '@src/hooks/useAI';

const { generateDailyInsights } = useAIAssistant({
  apiKey: 'your-key'
});

await generateDailyInsights(noteTexts, taskData);
```

---

## File Locations Quick Reference

| Feature | File |
|---------|------|
| AI Operations | `src/services/aiService.ts` |
| Voice Recording | `src/services/voiceService.ts` |
| Habits/Goals | `src/services/habitAndGoalService.ts` |
| State Store | `src/store/aiStore.ts` |
| Hooks | `src/hooks/useAI.tsx` |
| UI Components | `src/components/molecules/AICards/` |
| Main Screen | `src/screens/AIAssistantScreen/` |
| Config | `src/config/aiConfig.ts` |

---

## API Keys Setup

### OpenAI
1. Go to https://platform.openai.com/api-keys
2. Create new API key
3. Add to `.env`: `REACT_APP_AI_API_KEY=sk-...`

### Google Cloud Speech-to-Text
1. Enable API in Google Cloud Console
2. Create service account
3. Download credentials JSON
4. Add to `.env`: `REACT_APP_STT_API_KEY=...`

---

## Testing Features

### Test Task Extraction
```typescript
const tasks = await extractTasksFromNote('Buy milk, call dentist, fix bug');
console.log(tasks); // { tasks: [...], summary: "..." }
```

### Test Daily Insights
```typescript
const insights = await generateDailyInsights(
  ['note 1', 'note 2'],
  [{title: 'task1'}]
);
console.log(insights.productivityScore); // 0-100
```

### Test Habit Tracking
```typescript
const habit = createHabit({ name: 'Exercise', frequency: 'daily' });
completeHabit(habit.id);
// Check habit.currentStreak increased
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `API_KEY not set` | Add to .env and restart |
| `Tasks not extracting` | Check API key is valid |
| `Habits not saving` | Clear app cache |
| `Voice not working` | Check microphone permissions |

---

## Component Props

### DailyInsightsCard
```typescript
<DailyInsightsCard 
  insights={{ productivityScore: 75, insights: [...], suggestions: [...] }}
  onDismiss={() => {}}
/>
```

### ExtractedTasksCard
```typescript
<ExtractedTasksCard 
  tasks={{ tasks: [...], summary: "..." }}
  onCreateTask={(task) => {}}
/>
```

### HabitTrackerCard
```typescript
<HabitTrackerCard 
  habit={{ id: "1", name: "...", currentStreak: 5, ... }}
  onToggle={() => {}}
/>
```

### GoalTrackerCard
```typescript
<GoalTrackerCard 
  goal={{ id: "1", title: "...", progress: 50, ... }}
  onPress={() => {}}
/>
```

---

## Accessing Store Data

```typescript
import { useAIStore } from '@src/store/aiStore';

const {
  habits,
  goals,
  dailyInsights,
  extractedTasks,
  addHabit,
  updateGoalProgress,
  logHabitCompletion
} = useAIStore();
```

---

## Full Example: AI Assistant Page

```typescript
import { useAIAssistant, useHabitTracking, useGoalTracking } from '@src/hooks/useAI';
import { useAIStore } from '@src/store/aiStore';
import {
  DailyInsightsCard,
  ExtractedTasksCard,
  HabitTrackerCard,
  GoalTrackerCard
} from '@src/components/molecules/AICards';

export const AIPage = () => {
  const { extractTasksFromNote, generateDailyInsights } = useAIAssistant({
    apiKey: 'your-key'
  });

  const { habits, goals, dailyInsights, extractedTasks } = useAIStore();
  const { completeHabit } = useHabitTracking();

  return (
    <ScrollView>
      {dailyInsights && <DailyInsightsCard insights={dailyInsights} />}
      {extractedTasks[0] && <ExtractedTasksCard tasks={extractedTasks[0]} />}
      {habits.map(h => (
        <HabitTrackerCard 
          key={h.id} 
          habit={h} 
          onToggle={() => completeHabit(h.id)} 
        />
      ))}
      {goals.map(g => (
        <GoalTrackerCard key={g.id} goal={g} />
      ))}
    </ScrollView>
  );
};
```

---

## Next Level Features

### Add Offline Support
```typescript
// Fetch data from store first, sync later
const habits = useAIStore(state => state.habits);
```

### Add Analytics
```typescript
import { getHabitAnalytics } from '@src/services/habitAndGoalService';
const analytics = getHabitAnalytics(habit);
```

### Schedule Insights
```typescript
// Generate insights at specific times
const scheduleInsights = () => {
  const time = new Date();
  time.setHours(9, 0, 0);
  setTimeout(generateInsights, time.getTime() - Date.now());
};
```

---

## Performance Tips

1. **Debounce API calls**
```typescript
import { debounce } from 'lodash';
const debouncedExtract = debounce(extractTasksFromNote, 1000);
```

2. **Cache results**
```typescript
const cachedInsights = useRef(null);
if (cachedInsights.current) return cachedInsights.current;
```

3. **Use memo for components**
```typescript
export const HabitCard = React.memo(HabitTrackerCard);
```

---

## Resources

- 📖 Full Guide: `AI_ASSISTANT_GUIDE.md`
- 📝 Implementation: `IMPLEMENTATION_SUMMARY.md`
- 🔧 Config: `src/config/aiConfig.ts`
- 📚 Service Docs: Each service file has detailed comments

---

**Ready to go!** Start building amazing AI features! 🎉
