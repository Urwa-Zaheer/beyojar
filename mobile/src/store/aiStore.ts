/* eslint-disable typescript-sort-keys/interface */
/* eslint-disable sort-keys-fix/sort-keys-fix */
import create from "zustand";
import { devtools, persist } from "zustand/middleware";
import { persistHelper } from "@src/common/helpers";
import { DailyReport, Goal, Habit, TaskExtractionResult } from "@src/services";

interface AIState {
  // AI-generated task features
  extractedTasks: TaskExtractionResult[];
  addExtractedTasks: (tasks: TaskExtractionResult) => void;
  deleteExtractedTasks: (index: number) => void;
  clearExtractedTasks: () => void;

  // Daily insights and planning
  dailyInsights: DailyReport | null;
  setDailyInsights: (insights: DailyReport) => void;
  clearDailyInsights: () => void;

  // Habit tracking
  habits: Habit[];
  addHabit: (habit: Habit) => void;
  updateHabit: (habit: Habit) => void;
  deleteHabit: (habitId: string) => void;
  logHabitCompletion: (habitId: string) => void;

  // Goal tracking
  goals: Goal[];
  addGoal: (goal: Goal) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (goalId: string) => void;
  updateGoalProgress: (goalId: string, progress: number) => void;

  // Voice notes summary
  voiceNotesSummary: Array<{
    id: string;
    originalText: string;
    aiSummary: string;
    createdAt: number;
  }>;
  addVoiceNoteSummary: (data: { id: string; originalText: string; aiSummary: string }) => void;
  deleteVoiceNoteSummary: (id: string) => void;

  // Reset everything
  resetAIState: () => void;
}

export const useAIStore = create<AIState>()(
  devtools(
    persist(
      (set) => ({
        extractedTasks: [],
        addExtractedTasks: (tasks) =>
          set((state) => ({ extractedTasks: [tasks, ...state.extractedTasks] })),
        deleteExtractedTasks: (index) =>
          set((state) => ({
            extractedTasks: state.extractedTasks.filter((_, i) => i !== index),
          })),
        clearExtractedTasks: () => set({ extractedTasks: [] }),

        dailyInsights: null,
        setDailyInsights: (insights) => set({ dailyInsights: insights }),
        clearDailyInsights: () => set({ dailyInsights: null }),

        habits: [],
        addHabit: (habit) => set((state) => ({ habits: [habit, ...state.habits] })),
        updateHabit: (habit) =>
          set((state) => ({
            habits: state.habits.map((h) => (h.id === habit.id ? habit : h)),
          })),
        deleteHabit: (habitId) =>
          set((state) => ({
            habits: state.habits.filter((h) => h.id !== habitId),
          })),
        logHabitCompletion: (habitId) =>
          set((state) => {
            const habit = state.habits.find((h) => h.id === habitId);
            if (!habit) return state;

            const today = new Date().toISOString().split('T')[0];
            const alreadyLogged = habit.completedDates.includes(today);

            if (alreadyLogged) {
              return state;
            }

            const updatedHabit = {
              ...habit,
              completedDates: [today, ...habit.completedDates],
              currentStreak: habit.currentStreak + 1,
              longestStreak: Math.max(habit.longestStreak, habit.currentStreak + 1),
            };

            return {
              habits: state.habits.map((h) => (h.id === habitId ? updatedHabit : h)),
            };
          }),

        goals: [],
        addGoal: (goal) => set((state) => ({ goals: [goal, ...state.goals] })),
        updateGoal: (goal) =>
          set((state) => ({
            goals: state.goals.map((g) => (g.id === goal.id ? goal : g)),
          })),
        deleteGoal: (goalId) =>
          set((state) => ({
            goals: state.goals.filter((g) => g.id !== goalId),
          })),
        updateGoalProgress: (goalId, progress) =>
          set((state) => ({
            goals: state.goals.map((g) =>
              g.id === goalId
                ? {
                    ...g,
                    progress: Math.min(progress, 100),
                    status: progress >= 100 ? 'completed' : g.status,
                  }
                : g
            ),
          })),

        voiceNotesSummary: [],
        addVoiceNoteSummary: (data) =>
          set((state) => ({
            voiceNotesSummary: [
              {
                ...data,
                createdAt: Date.now(),
              },
              ...state.voiceNotesSummary,
            ],
          })),
        deleteVoiceNoteSummary: (id) =>
          set((state) => ({
            voiceNotesSummary: state.voiceNotesSummary.filter((item) => item.id !== id),
          })),

        resetAIState: () =>
          set(() => ({
            extractedTasks: [],
            dailyInsights: null,
            habits: [],
            goals: [],
            voiceNotesSummary: [],
          })),
      }),
      { name: "ai-storage", getStorage: () => persistHelper }
    )
  )
);
