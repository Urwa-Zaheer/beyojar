export interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount?: number;
  currentStreak: number;
  longestStreak: number;
  completedDates: string[];
  createdAt: number;
  color?: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate: number;
  priority: 'high' | 'medium' | 'low';
  progress: number;
  status: 'active' | 'completed' | 'abandoned';
  relatedHabits: string[];
  createdAt: number;
  milestones?: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  targetDate: number;
  completed: boolean;
  completedDate?: number;
}

class HabitService {
  /**
   * Create a new habit
   */
  createHabit(habit: Omit<Habit, 'id' | 'currentStreak' | 'longestStreak' | 'completedDates' | 'createdAt'>): Habit {
    return {
      ...habit,
      id: Date.now().toString(),
      currentStreak: 0,
      longestStreak: 0,
      completedDates: [],
      createdAt: Date.now(),
    };
  }

  /**
   * Log habit completion
   */
  logHabitCompletion(habit: Habit): Habit {
    const today = new Date().toISOString().split('T')[0];
    const alreadyLogged = habit.completedDates.includes(today);

    if (alreadyLogged) {
      return habit;
    }

    const newCompletedDates = [today, ...habit.completedDates];
    let newCurrentStreak = habit.currentStreak + 1;
    let newLongestStreak = habit.longestStreak;

    if (newCurrentStreak > newLongestStreak) {
      newLongestStreak = newCurrentStreak;
    }

    return {
      ...habit,
      completedDates: newCompletedDates,
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
    };
  }

  /**
   * Check if habit was completed today
   */
  isCompletedToday(habit: Habit): boolean {
    const today = new Date().toISOString().split('T')[0];
    return habit.completedDates.includes(today);
  }

  /**
   * Get habit analytics
   */
  getHabitAnalytics(habit: Habit) {
    const completionRate = habit.completedDates.length;
    const daysSinceCreation = Math.floor((Date.now() - habit.createdAt) / (1000 * 60 * 60 * 24));

    return {
      totalCompletions: completionRate,
      daysSinceCreation,
      averageCompletion: daysSinceCreation > 0 ? (completionRate / daysSinceCreation * 100).toFixed(1) : 0,
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
    };
  }
}

class GoalService {
  /**
   * Create a new goal
   */
  createGoal(goal: Omit<Goal, 'id' | 'createdAt'>): Goal {
    return {
      ...goal,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
  }

  /**
   * Update goal progress
   */
  updateProgress(goal: Goal, newProgress: number): Goal {
    const updatedProgress = Math.min(newProgress, 100);

    return {
      ...goal,
      progress: updatedProgress,
      status: updatedProgress === 100 ? 'completed' : goal.status,
    };
  }

  /**
   * Add milestone to goal
   */
  addMilestone(goal: Goal, milestone: Omit<Milestone, 'id' | 'completed' | 'completedDate'>): Goal {
    const newMilestone: Milestone = {
      ...milestone,
      id: Date.now().toString(),
      completed: false,
    };

    return {
      ...goal,
      milestones: [...(goal.milestones || []), newMilestone],
    };
  }

  /**
   * Complete a milestone
   */
  completeMilestone(goal: Goal, milestoneId: string): Goal {
    const updatedMilestones = goal.milestones?.map(m =>
      m.id === milestoneId
        ? { ...m, completed: true, completedDate: Date.now() }
        : m
    ) || [];

    return {
      ...goal,
      milestones: updatedMilestones,
    };
  }

  /**
   * Get goal progress percentage based on milestones
   */
  calculateProgressFromMilestones(goal: Goal): number {
    if (!goal.milestones || goal.milestones.length === 0) {
      return goal.progress;
    }

    const completedMilestones = goal.milestones.filter(m => m.completed).length;
    return Math.round((completedMilestones / goal.milestones.length) * 100);
  }

  /**
   * Get days remaining until goal deadline
   */
  getDaysRemaining(goal: Goal): number {
    const now = Date.now();
    const daysRemaining = Math.ceil((goal.targetDate - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysRemaining);
  }
}

export { HabitService, GoalService };
