import React from 'react';

/**
 * AI Assistant Configuration
 * Setup file for initializing AI features in the Beyojar application
 */

// Environment variables configuration
export const AI_CONFIG = {
  // API Provider (OpenAI, Google, Anthropic, etc.)
  API_PROVIDER: process.env.REACT_APP_AI_PROVIDER || 'openai',
  
  // API Keys
  API_KEY: process.env.REACT_APP_AI_API_KEY || '',
  API_URL: process.env.REACT_APP_AI_API_URL || 'https://api.openai.com/v1',
  
  // Model Configuration
  MODEL: process.env.REACT_APP_AI_MODEL || 'gpt-4',
  
  // Voice/STT Configuration
  STT_PROVIDER: process.env.REACT_APP_STT_PROVIDER || 'google',
  STT_API_KEY: process.env.REACT_APP_STT_API_KEY || '',
  
  // Features Toggle
  FEATURES: {
    VOICE_NOTES: process.env.REACT_APP_ENABLE_VOICE_NOTES !== 'false',
    TASK_EXTRACTION: process.env.REACT_APP_ENABLE_TASK_EXTRACTION !== 'false',
    DAILY_INSIGHTS: process.env.REACT_APP_ENABLE_DAILY_INSIGHTS !== 'false',
    HABIT_TRACKING: process.env.REACT_APP_ENABLE_HABIT_TRACKING !== 'false',
    GOAL_TRACKING: process.env.REACT_APP_ENABLE_GOAL_TRACKING !== 'false',
  },
  
  // API Rate Limiting
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 60,
    REQUESTS_PER_HOUR: 1000,
  },
  
  // Timeouts (in milliseconds)
  TIMEOUTS: {
    API_CALL: 30000,
    VOICE_RECORDING: 120000,
    GENERATION: 45000,
  },
  
  // Caching Configuration
  CACHE: {
    INSIGHTS_TTL: 24 * 60 * 60 * 1000, // 24 hours
    TASKS_TTL: 7 * 24 * 60 * 60 * 1000, // 7 days
    SUMMARIES_TTL: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
};

/**
 * Initialize AI services with configuration
 * Call this in your App.tsx or root component
 */
export const initializeAIServices = async () => {
  try {
    // Validate API key is available
    if (!AI_CONFIG.API_KEY && AI_CONFIG.FEATURES.TASK_EXTRACTION) {
      console.warn(
        'AI_API_KEY not configured. Task extraction and insights features will be disabled.'
      );
    }

    // Initialize other services as needed
    console.log('AI Services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize AI services:', error);
  }
};

/**
 * Feature availability check
 */
export const isFeatureAvailable = (feature: keyof typeof AI_CONFIG.FEATURES): boolean => {
  return AI_CONFIG.FEATURES[feature];
};

/**
 * Sample .env configuration
 * Copy this to your .env file
 */
export const ENV_EXAMPLE = `
# OpenAI Configuration
REACT_APP_AI_PROVIDER=openai
REACT_APP_AI_API_KEY=sk-your-api-key-here
REACT_APP_AI_API_URL=https://api.openai.com/v1
REACT_APP_AI_MODEL=gpt-4

# Speech-to-Text Configuration
REACT_APP_STT_PROVIDER=google
REACT_APP_STT_API_KEY=your-gcp-key-here

# Feature Flags
REACT_APP_ENABLE_VOICE_NOTES=true
REACT_APP_ENABLE_TASK_EXTRACTION=true
REACT_APP_ENABLE_DAILY_INSIGHTS=true
REACT_APP_ENABLE_HABIT_TRACKING=true
REACT_APP_ENABLE_GOAL_TRACKING=true
`;
