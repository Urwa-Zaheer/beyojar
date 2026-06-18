import { useCallback, useState } from 'react';
import AIService, { DailyReport, TaskExtractionResult } from '@src/services/aiService';
import VoiceService, { VoiceNote } from '@src/services/voiceService';
import { HabitService, GoalService, Habit, Goal } from '@src/services/habitAndGoalService';
import { useAIStore } from '@src/store/aiStore';

interface UseAIAssistantOptions {
  apiKey: string;
  apiUrl?: string;
}

export const useAIAssistant = (options: UseAIAssistantOptions) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    addExtractedTasks,
    setDailyInsights,
    deleteExtractedTasks,
    clearDailyInsights,
  } = useAIStore();

  const aiService = new AIService({
    apiKey: options.apiKey,
    apiUrl: options.apiUrl,
  });

  const extractTasksFromNote = useCallback(
    async (noteContent: string): Promise<TaskExtractionResult | null> => {
      try {
        setLoading(true);
        setError(null);
        const result = await aiService.extractTasks(noteContent);
        addExtractedTasks(result);
        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to extract tasks';
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [aiService, addExtractedTasks]
  );

  const generateDailyInsights = useCallback(
    async (notes: string[], tasksData: any[]): Promise<DailyReport | null> => {
      try {
        setLoading(true);
        setError(null);
        const insights = await aiService.generateDailyInsights(notes, tasksData);
        setDailyInsights(insights);
        return insights;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to generate insights';
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [aiService, setDailyInsights]
  );

  const generateNoteSummary = useCallback(
    async (noteContent: string): Promise<string | null> => {
      try {
        setLoading(true);
        setError(null);
        return await aiService.generateSummary(noteContent);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to generate summary';
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [aiService]
  );

  return {
    loading,
    error,
    extractTasksFromNote,
    generateDailyInsights,
    generateNoteSummary,
    clearError: () => setError(null),
  };
};

export const useVoiceNotes = () => {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const voiceService = new VoiceService();

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setRecording(true);
      await voiceService.startVoiceRecording();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMsg);
      setRecording(false);
    }
  }, []);

  const stopRecording = useCallback(
    async (): Promise<VoiceNote | null> => {
      try {
        setError(null);
        const voiceNote = await voiceService.stopVoiceRecording();
        setRecording(false);
        return voiceNote;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to stop recording';
        setError(errorMsg);
        return null;
      }
    },
    []
  );

  const speak = useCallback(
    async (text: string, language: string = 'en'): Promise<void> => {
      try {
        setError(null);
        await voiceService.speak(text, language);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to speak';
        setError(errorMsg);
      }
    },
    []
  );

  const stopSpeaking = useCallback(async () => {
    try {
      await voiceService.stopSpeaking();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to stop speaking';
      setError(errorMsg);
    }
  }, []);

  return {
    recording,
    error,
    startRecording,
    stopRecording,
    speak,
    stopSpeaking,
    clearError: () => setError(null),
  };
};

export const useHabitTracking = () => {
  const [error, setError] = useState<string | null>(null);

  const {
    habits,
    addHabit,
    updateHabit,
    deleteHabit,
    logHabitCompletion,
  } = useAIStore();

  const habitService = new HabitService();

  const createHabit = useCallback(
    (habitData: Omit<Habit, 'id' | 'currentStreak' | 'longestStreak' | 'completedDates' | 'createdAt'>) => {
      try {
        const habit = habitService.createHabit(habitData);
        addHabit(habit);
        return habit;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create habit');
        return null;
      }
    },
    [addHabit]
  );

  const completeHabit = useCallback(
    (habitId: string) => {
      try {
        logHabitCompletion(habitId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to complete habit');
      }
    },
    [logHabitCompletion]
  );

  const getHabitAnalytics = useCallback(
    (habitId: string) => {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return null;
      return habitService.getHabitAnalytics(habit);
    },
    [habits]
  );

  return {
    habits,
    error,
    createHabit,
    completeHabit,
    deleteHabit,
    updateHabit,
    getHabitAnalytics,
    clearError: () => setError(null),
  };
};

export const useGoalTracking = () => {
  const [error, setError] = useState<string | null>(null);

  const {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    updateGoalProgress,
  } = useAIStore();

  const goalService = new GoalService();

  const createGoal = useCallback(
    (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
      try {
        const goal = goalService.createGoal(goalData);
        addGoal(goal);
        return goal;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create goal');
        return null;
      }
    },
    [addGoal]
  );

  const updateProgress = useCallback(
    (goalId: string, progress: number) => {
      try {
        const goal = goals.find(g => g.id === goalId);
        if (!goal) {
          setError('Goal not found');
          return;
        }
        updateGoalProgress(goalId, progress);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update progress');
      }
    },
    [goals, updateGoalProgress]
  );

  const getDaysRemaining = useCallback(
    (goalId: string): number | null => {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return null;
      return goalService.getDaysRemaining(goal);
    },
    [goals]
  );

  const getProgressFromMilestones = useCallback(
    (goalId: string): number | null => {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return null;
      return goalService.calculateProgressFromMilestones(goal);
    },
    [goals]
  );

  return {
    goals,
    error,
    createGoal,
    updateProgress,
    deleteGoal,
    getDaysRemaining,
    getProgressFromMilestones,
    clearError: () => setError(null),
  };
};
