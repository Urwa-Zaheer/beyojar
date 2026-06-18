import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { useAIStore } from '@src/store/aiStore';
import { useNotesStore } from '@src/store/notesStore';
import { useAIAssistant, useHabitTracking } from '@src/hooks/useAI';
import {
  DailyInsightsCard,
  ExtractedTasksCard,
  HabitTrackerCard,
  GoalTrackerCard,
} from '@src/components/molecules/AICards';
import { SafeAreaBox, Box, Text, HeaderBar } from '@src/components/atoms';
import { FloatingButton } from '@src/components/molecules';

const Container = styled(SafeAreaBox)`
  flex: 1;
  background-color: ${(props) => props.theme.pallette.background};
`;

const ContentContainer = styled(ScrollView)`
  flex: 1;
  padding: 16px;
`;

const SectionTitle = styled(Text)`
  font-size: 18px;
  font-weight: 600;
  margin-top: 20px;
  margin-bottom: 12px;
  color: ${(props) => props.theme.pallette.black};
`;

const EmptyState = styled(Box)`
  padding: 32px 16px;
  align-items: center;
  justify-content: center;
`;

interface AIAssistantScreenProps {
  navigation: any;
}

export const AIAssistantScreen: React.FC<AIAssistantScreenProps> = ({ navigation }) => {
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  const { notes } = useNotesStore();
  const {
    dailyInsights,
    extractedTasks,
    habits,
    goals,
    clearDailyInsights,
    logHabitCompletion,
  } = useAIStore();

  const { extractTasksFromNote, generateDailyInsights, loading, error } = useAIAssistant({
    apiKey: process.env.REACT_APP_AI_API_KEY || '',
  });

  const { completeHabit } = useHabitTracking();

  useEffect(() => {
    // Auto-generate insights when component mounts or notes change
    if (notes.length > 0 && !dailyInsights) {
      handleGenerateInsights();
    }
  }, []);

  const handleGenerateInsights = useCallback(async () => {
    if (notes.length === 0) {
      alert('No notes to analyze. Create some notes first!');
      return;
    }

    setIsGeneratingInsights(true);
    const noteContents = notes.map(n => n.content);
    await generateDailyInsights(noteContents, []);
    setIsGeneratingInsights(false);
  }, [notes, generateDailyInsights]);

  const handleExtractTasksFromLatestNote = useCallback(async () => {
    if (notes.length === 0) {
      alert('No notes found. Create a note first!');
      return;
    }

    const latestNote = notes[0];
    await extractTasksFromNote(latestNote.content);
  }, [notes, extractTasksFromNote]);

  const handleHabitCompletion = useCallback((habitId: string) => {
    logHabitCompletion(habitId);
  }, [logHabitCompletion]);

  const handleNavigateToGoal = useCallback((goalId: string) => {
    navigation.navigate('GoalDetail', { goalId });
  }, [navigation]);

  return (
    <Container>
      <HeaderBar title="AI Assistant" showBackButton={false} />

      <ContentContainer showsVerticalScrollIndicator={false}>
        {error && (
          <Box
            backgroundColor="error"
            padding="12px"
            borderRadius="8px"
            marginBottom="12px"
          >
            <Text color="white" variant="caption">
              {error}
            </Text>
          </Box>
        )}

        {/* Daily Insights Section */}
        <SectionTitle>Daily Insights</SectionTitle>
        {dailyInsights ? (
          <DailyInsightsCard
            insights={dailyInsights}
            onDismiss={clearDailyInsights}
          />
        ) : (
          <EmptyState>
            <Text variant="caption" color="grey" marginBottom="12px">
              Generate insights from your notes
            </Text>
            <TouchableOpacity
              onPress={handleGenerateInsights}
              disabled={loading || isGeneratingInsights}
            >
              <Box
                backgroundColor="primary"
                paddingHorizontal="16px"
                paddingVertical="8px"
                borderRadius="8px"
              >
                <Text color="white" fontWeight="600">
                  {isGeneratingInsights ? 'Generating...' : 'Generate Insights'}
                </Text>
              </Box>
            </TouchableOpacity>
          </EmptyState>
        )}

        {/* Extracted Tasks Section */}
        <SectionTitle>Extracted Tasks</SectionTitle>
        {extractedTasks.length > 0 ? (
          extractedTasks.map((taskGroup, idx) => (
            <ExtractedTasksCard key={idx} tasks={taskGroup} />
          ))
        ) : (
          <EmptyState>
            <Text variant="caption" color="grey" marginBottom="12px">
              Extract tasks from your notes
            </Text>
            <TouchableOpacity
              onPress={handleExtractTasksFromLatestNote}
              disabled={loading}
            >
              <Box
                backgroundColor="primary"
                paddingHorizontal="16px"
                paddingVertical="8px"
                borderRadius="8px"
              >
                <Text color="white" fontWeight="600">
                  {loading ? 'Extracting...' : 'Extract Tasks'}
                </Text>
              </Box>
            </TouchableOpacity>
          </EmptyState>
        )}

        {/* Habits Section */}
        <SectionTitle>Habits</SectionTitle>
        {habits.length > 0 ? (
          habits.map(habit => (
            <HabitTrackerCard
              key={habit.id}
              habit={habit}
              onToggle={() => handleHabitCompletion(habit.id)}
            />
          ))
        ) : (
          <EmptyState>
            <Text variant="caption" color="grey">
              No habits yet. Create one to get started!
            </Text>
          </EmptyState>
        )}

        {/* Goals Section */}
        <SectionTitle>Goals</SectionTitle>
        {goals.length > 0 ? (
          goals.map(goal => (
            <GoalTrackerCard
              key={goal.id}
              goal={goal}
              onPress={() => handleNavigateToGoal(goal.id)}
            />
          ))
        ) : (
          <EmptyState>
            <Text variant="caption" color="grey">
              No goals yet. Set one to track your progress!
            </Text>
          </EmptyState>
        )}

        <Box height={100} />
      </ContentContainer>

      <FloatingButton
        onPress={() => navigation.navigate('CreateHabitGoal')}
        icon="+"
      />
    </Container>
  );
};

export default AIAssistantScreen;
