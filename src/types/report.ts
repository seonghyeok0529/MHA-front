export interface MentalHealthReport {
  summary: string;
  emotionalFlow: string[];
  keyStatements: string[];
  concerns: string[];
  relationships: string[];
  notesForCounselor: string;
}

export interface SessionListItem {
  sessionId: string;
  createdAt?: string;
  updatedAt?: string;
}
