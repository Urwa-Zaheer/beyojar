# AI Assistant Features Implementation Guide

## Overview
This guide provides complete implementation details for adding AI-powered features to the Beyojar note-taking application:

### Features Included
1. **Voice-First Note Taking** - Convert voice to text and generate summaries
2. **AI-Generated Task Extraction** - Automatically extract actionable items from notes
3. **Daily Planning Insights** - Generate productivity recommendations and daily reports
4. **Goal & Habit Tracking** - Track long-term goals and daily habits with streak counters
5. **Mobile-Optimized Workflow** - Fast, simplified interface for on-the-go productivity

---

## Installation & Setup

### 1. Install Dependencies

```bash
cd mobile
npm install axios expo-speech
```

### 2. Add API Configuration

Create a new file `src/config/aiConfig.ts`:

```typescript
export const AI_CONFIG = {
  // OpenAI or alternative AI provider
  apiKey: process.env.REACT_APP_AI_API_KEY,
  apiUrl: 'https://api.openai.com/v1',
  model: 'gpt-4',
};
```

### 3. Update Environment Variables

Add to your `.env` file:

```
REACT_APP_AI_API_KEY=your_api_key_here
REACT_APP_STT_PROVIDER=google_cloud_speech_to_text
```

---

## Service Architecture

### AIService (aiService.ts)
Handles all AI-powered operations:

```typescript
import AIService from '@src/services/aiService';

const aiService = new AIService({
  apiKey: 'your-api-key',
  apiUrl: 'https://api.openai.com/v1',
  model: 'gpt-4'
});

// Extract tasks from notes
const extractedTasks = await aiService.extractTasks('Buy groceries, call dentist');

// Generate daily insights
const insights = await aiService.generateDailyInsights(notes, tasks);

// Generate summaries
const summary = await aiService.generateSummary(noteContent);
```

### VoiceService (voiceService.ts)
Manages voice recording and text-to-speech:

```typescript
import VoiceService from '@src/services/voiceService';

const voiceService = new VoiceService();

// Record and transcribe voice
await voiceService.startVoiceRecording();
const voiceNote = await voiceService.stopVoiceRecording();

// Text-to-speech
await voiceService.speak('Listen to your notes');
```

### HabitService & GoalService (habitAndGoalService.ts)
Track habits and goals with progress monitoring:

```typescript
import { HabitService, GoalService } from '@src/services/habitAndGoalService';

const habitService = new HabitService();
const goalService = new GoalService();

// Create habit
const habit = habitService.createHabit({
  name: 'Morning Exercise',
  frequency: 'daily',
  description: '30 min workout'
});

// Log habit completion
const updatedHabit = habitService.logHabitCompletion(habit);

// Create goal with milestones
const goal = goalService.createGoal({
  title: 'Complete Project',
  targetDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
  priority: 'high',
  progress: 0
});

// Update progress
goalService.updateProgress(goal, 50);
```

---

## State Management

### useAIStore Hook

Store all AI-related state using Zustand:

```typescript
import { useAIStore } from '@src/store/aiStore';

export const MyComponent = () => {
  const {
    habits,
    goals,
    extractedTasks,
    dailyInsights,
    addHabit,
    updateGoalProgress,
    addExtractedTasks,
    setDailyInsights
  } = useAIStore();

  // Use the state and actions
  const handleAddHabit = () => {
    addHabit(newHabit);
  };

  return (
    // Component JSX
  );
};
```

---

## UI Components

### Available AI Components

Located in `src/components/molecules/AICards/`:

1. **DailyInsightsCard**
   - Shows productivity score
   - Displays key insights
   - Lists suggestions

2. **ExtractedTasksCard**
   - Lists extracted tasks
   - Shows summary
   - One-click task creation

3. **HabitTrackerCard**
   - Current and longest streaks
   - One-tap completion
   - Frequency display

4. **GoalTrackerCard**
   - Progress bar
   - Days remaining
   - Priority indicator

### Usage Example

```typescript
import {
  DailyInsightsCard,
  ExtractedTasksCard,
  HabitTrackerCard,
  GoalTrackerCard
} from '@src/components/molecules/AICards';

export const DashboardScreen = () => {
  const { dailyInsights, extractedTasks, habits, goals } = useAIStore();

  return (
    <ScrollView>
      {dailyInsights && (
        <DailyInsightsCard 
          insights={dailyInsights}
          onDismiss={() => clearDailyInsights()}
        />
      )}

      {extractedTasks?.length > 0 && (
        <ExtractedTasksCard 
          tasks={extractedTasks[0]}
          onCreateTask={handleCreateTask}
        />
      )}

      {habits.map(habit => (
        <HabitTrackerCard
          key={habit.id}
          habit={habit}
          onToggle={() => logHabitCompletion(habit.id)}
        />
      ))}

      {goals.map(goal => (
        <GoalTrackerCard
          key={goal.id}
          goal={goal}
          onPress={() => navigateToGoalDetail(goal.id)}
        />
      ))}
    </ScrollView>
  );
};
```

---

## Complete Implementation Example

### Step 1: Create AI Assistant Hook

```typescript
// src/hooks/useAIAssistant.ts
import { useState } from 'react';
import { useAIStore } from '@src/store/aiStore';
import AIService from '@src/services/aiService';

export const useAIAssistant = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aiService = new AIService({
    apiKey: process.env.REACT_APP_AI_API_KEY!,
  });

  const {
    addExtractedTasks,
    setDailyInsights,
    addHabit,
    addGoal
  } = useAIStore();

  const extractTasksFromNote = async (noteContent: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await aiService.extractTasks(noteContent);
      addExtractedTasks(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async (notes: string[], tasks: any[]) => {
    try {
      setLoading(true);
      setError(null);
      const insights = await aiService.generateDailyInsights(notes, tasks);
      setDailyInsights(insights);
      return insights;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    extractTasksFromNote,
    generateInsights
  };
};
```

### Step 2: Create Dashboard Screen

```typescript
// src/screens/AIAssistantScreen/AIAssistantScreen.tsx
import React, { useEffect } from 'react';
import { ScrollView } from 'react-native';
import { useNotesStore } from '@src/store/notesStore';
import { useAIStore } from '@src/store/aiStore';
import { useAIAssistant } from '@src/hooks/useAIAssistant';
import {
  DailyInsightsCard,
  ExtractedTasksCard,
  HabitTrackerCard,
  GoalTrackerCard
} from '@src/components/molecules/AICards';

export const AIAssistantScreen = () => {
  const { notes } = useNotesStore();
  const { 
    dailyInsights, 
    extractedTasks, 
    habits, 
    goals,
    clearDailyInsights,
    logHabitCompletion 
  } = useAIStore();

  const { extractTasksFromNote, generateInsights } = useAIAssistant();

  useEffect(() => {
    // Generate insights on component mount
    if (notes.length > 0) {
      const noteContents = notes.map(n => n.content);
      generateInsights(noteContents, []);
    }
  }, [notes]);

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      {dailyInsights && (
        <DailyInsightsCard
          insights={dailyInsights}
          onDismiss={clearDailyInsights}
        />
      )}

      {extractedTasks.length > 0 && (
        <ExtractedTasksCard
          tasks={extractedTasks[0]}
        />
      )}

      {habits.map(habit => (
        <HabitTrackerCard
          key={habit.id}
          habit={habit}
          onToggle={() => logHabitCompletion(habit.id)}
        />
      ))}

      {goals.map(goal => (
        <GoalTrackerCard
          key={goal.id}
          goal={goal}
        />
      ))}
    </ScrollView>
  );
};
```

---

## Integration Points

### 1. Add to Navigation

Update `src/navigation/Navigation.tsx`:

```typescript
import { AIAssistantScreen } from '@src/screens/AIAssistantScreen';

export const Navigation = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator>
        <Drawer.Screen 
          name="Notes" 
          component={NotesListScreen} 
        />
        <Drawer.Screen 
          name="AI Assistant" 
          component={AIAssistantScreen} 
        />
        <Drawer.Screen 
          name="Goals & Habits" 
          component={GoalsScreen} 
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};
```

### 2. Update Dependencies

Add to `package.json`:

```json
{
  "dependencies": {
    "axios": "^1.4.0",
    "expo-speech": "^11.0.0"
  }
}
```

### 3. Environment Configuration

```typescript
// src/config/environment.ts
export const ENV = {
  AI_API_KEY: process.env.REACT_APP_AI_API_KEY,
  AI_MODEL: process.env.REACT_APP_AI_MODEL || 'gpt-4',
  STT_PROVIDER: process.env.REACT_APP_STT_PROVIDER,
};
```

---

## Performance Optimization

1. **Debounce Task Extraction**: Avoid too many API calls
2. **Batch Insights Generation**: Calculate insights once per day
3. **Cache Results**: Store extracted tasks locally
4. **Lazy Load Screens**: Only generate insights when needed

```typescript
// Debounced extraction
const debouncedExtract = useCallback(
  debounce((content: string) => extractTasksFromNote(content), 1000),
  [extractTasksFromNote]
);
```

---

## Testing

```typescript
// __tests__/aiService.test.ts
import AIService from '@src/services/aiService';

describe('AIService', () => {
  let service: AIService;

  beforeEach(() => {
    service = new AIService({
      apiKey: 'test-key',
      apiUrl: 'https://test.api.com'
    });
  });

  test('extractTasks should parse task data', async () => {
    const result = await service.extractTasks('Buy milk today');
    expect(result.tasks).toBeDefined();
    expect(result.summary).toBeDefined();
  });

  test('generateSummary should return string', async () => {
    const result = await service.generateSummary('Long note text');
    expect(typeof result).toBe('string');
  });
});
```

---

## Troubleshooting

### Issue: API Key Not Working
- Verify `REACT_APP_AI_API_KEY` is set
- Check API key hasn't expired
- Ensure API provider is authorized

### Issue: Voice Recording Not Working
- Install required native modules
- Check permissions for microphone access
- Verify STT provider is configured

### Issue: State Not Persisting
- Check if `persistHelper` is properly configured
- Clear app cache if needed
- Verify storage permissions

---

## Next Steps

1. Configure your AI API provider (OpenAI, Google, etc.)
2. Set up voice-to-text service
3. Customize UI components for your branding
4. Test all features in development
5. Deploy to production

For more details, check individual service files and component documentation.
