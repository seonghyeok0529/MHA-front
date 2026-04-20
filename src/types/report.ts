export type UserType = 'low' | 'medium' | 'high';

export interface EmotionalTimelinePoint {
  step: number;
  emotion: string;
  intensity: number;
}

export interface MentalHealthReport {
  summary: string;
  emotionalTimeline: EmotionalTimelinePoint[];
  keyStatements: string[];
  concerns: string[];
  relationships: string[];
  patterns: string[];
  userType: UserType;
  suggestedQuestions: string[];
  notesForCounselor: string;
}

export interface SessionListItem {
  sessionId: string;
  summary?: string;
  userType?: UserType;
  patterns?: string[];
  createdAt?: string;
  updatedAt?: string;
}
