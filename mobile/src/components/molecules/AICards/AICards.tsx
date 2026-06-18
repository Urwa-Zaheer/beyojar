import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { Text, Box, FlexBox } from '@src/components/atoms';
import { Button } from '@src/components/molecules';

const CardContainer = styled(Box)`
  background-color: ${(props) => props.theme.pallette.white};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  shadow-color: ${(props) => props.theme.pallette.grey};
  shadow-offset: { width: 0, height: 2 };
  shadow-opacity: 0.1;
  elevation: 3;
`;

const InsightBadge = styled(Box)<{ priority?: number }>`
  background-color: ${(props) => {
    if (!props.priority) return props.theme.pallette.primary.light;
    if (props.priority >= 8) return props.theme.pallette.error.light;
    if (props.priority >= 5) return props.theme.pallette.secondary.light;
    return props.theme.pallette.primary.light;
  }};
  padding: 8px 12px;
  border-radius: 8px;
  margin-right: 8px;
  margin-bottom: 8px;
`;

const ProgressBar = styled(View)`
  height: 8px;
  background-color: ${(props) => props.theme.pallette.grey};
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled(View)<{ progress: number }>`
  height: 100%;
  width: ${(props) => props.progress}%;
  background-color: ${(props) => props.theme.pallette.primary.main};
`;

interface DailyInsightsProps {
  insights: any;
  onDismiss?: () => void;
}

export const DailyInsightsCard: React.FC<DailyInsightsProps> = ({ insights, onDismiss }) => {
  return (
    <CardContainer>
      <FlexBox justifyContent="space-between" alignItems="center" marginBottom="12px">
        <Text variant="subtitle" fontWeight="600">
          Daily Insights
        </Text>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss}>
            <Text color="primary">✕</Text>
          </TouchableOpacity>
        )}
      </FlexBox>

      <FlexBox alignItems="center" marginBottom="16px">
        <Text variant="body" marginRight="8px">
          Productivity Score:
        </Text>
        <Text variant="subtitle" fontWeight="600" color="primary">
          {insights?.productivityScore || 0}/100
        </Text>
      </FlexBox>

      <ProgressBar>
        <ProgressFill progress={insights?.productivityScore || 0} />
      </ProgressBar>

      {insights?.insights && insights.insights.length > 0 && (
        <Box marginTop="12px">
          <Text variant="caption" fontWeight="600" marginBottom="8px">
            Key Insights
          </Text>
          {insights.insights.slice(0, 3).map((insight: any, idx: number) => (
            <Box key={idx} marginBottom="8px">
              <Text variant="caption">{insight.insight}</Text>
            </Box>
          ))}
        </Box>
      )}

      {insights?.suggestions && insights.suggestions.length > 0 && (
        <Box marginTop="12px">
          <Text variant="caption" fontWeight="600" marginBottom="8px">
            Suggestions
          </Text>
          {insights.suggestions.slice(0, 2).map((suggestion: string, idx: number) => (
            <Text key={idx} variant="caption" marginBottom="4px">
              • {suggestion}
            </Text>
          ))}
        </Box>
      )}
    </CardContainer>
  );
};

interface TaskExtractionProps {
  tasks: any;
  onCreateTask?: (task: any) => void;
}

export const ExtractedTasksCard: React.FC<TaskExtractionProps> = ({ tasks, onCreateTask }) => {
  return (
    <CardContainer>
      <Text variant="subtitle" fontWeight="600" marginBottom="12px">
        Extracted Tasks
      </Text>

      {tasks?.summary && (
        <Box marginBottom="12px">
          <Text variant="caption" fontWeight="600" marginBottom="4px">
            Summary
          </Text>
          <Text variant="caption">{tasks.summary}</Text>
        </Box>
      )}

      {tasks?.tasks && tasks.tasks.length > 0 && (
        <Box>
          <Text variant="caption" fontWeight="600" marginBottom="8px">
            Tasks ({tasks.tasks.length})
          </Text>
          {tasks.tasks.map((task: any, idx: number) => (
            <Box
              key={idx}
              marginBottom="8px"
              paddingHorizontal="8px"
              paddingVertical="8px"
              borderLeftColor="primary"
              borderLeftWidth={3}
            >
              <FlexBox justifyContent="space-between" alignItems="center">
                <View style={{ flex: 1 }}>
                  <Text variant="caption" fontWeight="600">
                    {task.title}
                  </Text>
                  {task.priority && (
                    <InsightBadge priority={task.priority === 'high' ? 8 : 5}>
                      <Text variant="caption" fontWeight="600">
                        {task.priority}
                      </Text>
                    </InsightBadge>
                  )}
                </View>
                {onCreateTask && (
                  <TouchableOpacity onPress={() => onCreateTask(task)}>
                    <Text color="primary">+</Text>
                  </TouchableOpacity>
                )}
              </FlexBox>
            </Box>
          ))}
        </Box>
      )}
    </CardContainer>
  );
};

interface HabitTrackerProps {
  habit: any;
  onToggle?: () => void;
}

export const HabitTrackerCard: React.FC<HabitTrackerProps> = ({ habit, onToggle }) => {
  const isCompletedToday = habit.completedDates?.includes(new Date().toISOString().split('T')[0]);

  return (
    <CardContainer>
      <FlexBox justifyContent="space-between" alignItems="flex-start" marginBottom="8px">
        <View style={{ flex: 1 }}>
          <Text variant="subtitle" fontWeight="600">
            {habit.name}
          </Text>
          {habit.description && (
            <Text variant="caption" color="grey" marginTop="4px">
              {habit.description}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={onToggle}>
          <Box
            width={32}
            height={32}
            borderRadius={16}
            backgroundColor={isCompletedToday ? 'primary' : 'grey'}
            justifyContent="center"
            alignItems="center"
          >
            <Text fontWeight="bold" color="white">
              ✓
            </Text>
          </Box>
        </TouchableOpacity>
      </FlexBox>

      <FlexBox justifyContent="space-between" marginTop="8px">
        <Box>
          <Text variant="caption" color="grey">
            Current Streak
          </Text>
          <Text variant="subtitle" fontWeight="600" color="primary">
            {habit.currentStreak} days
          </Text>
        </Box>
        <Box>
          <Text variant="caption" color="grey">
            Best Streak
          </Text>
          <Text variant="subtitle" fontWeight="600" color="primary">
            {habit.longestStreak} days
          </Text>
        </Box>
        <Box>
          <Text variant="caption" color="grey">
            Frequency
          </Text>
          <Text variant="subtitle" fontWeight="600">
            {habit.frequency}
          </Text>
        </Box>
      </FlexBox>
    </CardContainer>
  );
};

interface GoalTrackerProps {
  goal: any;
  onPress?: () => void;
}

export const GoalTrackerCard: React.FC<GoalTrackerProps> = ({ goal, onPress }) => {
  const daysRemaining = Math.ceil((goal.targetDate - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <CardContainer>
        <FlexBox justifyContent="space-between" alignItems="flex-start" marginBottom="8px">
          <View style={{ flex: 1 }}>
            <Text variant="subtitle" fontWeight="600">
              {goal.title}
            </Text>
            {goal.description && (
              <Text variant="caption" color="grey" marginTop="4px">
                {goal.description}
              </Text>
            )}
          </View>
          {goal.priority && (
            <InsightBadge priority={goal.priority === 'high' ? 8 : 5}>
              <Text variant="caption" fontWeight="600">
                {goal.priority}
              </Text>
            </InsightBadge>
          )}
        </FlexBox>

        <Box marginBottom="12px">
          <FlexBox justifyContent="space-between" marginBottom="4px">
            <Text variant="caption">Progress</Text>
            <Text variant="caption" fontWeight="600">
              {goal.progress}%
            </Text>
          </FlexBox>
          <ProgressBar>
            <ProgressFill progress={goal.progress} />
          </ProgressBar>
        </Box>

        <FlexBox justifyContent="space-between">
          <Text variant="caption" color="grey">
            Days Remaining: {daysRemaining}
          </Text>
          <Text variant="caption" fontWeight="600">
            {goal.status}
          </Text>
        </FlexBox>
      </CardContainer>
    </TouchableOpacity>
  );
};

export default {
  DailyInsightsCard,
  ExtractedTasksCard,
  HabitTrackerCard,
  GoalTrackerCard,
};
