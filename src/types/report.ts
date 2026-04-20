export interface UserReport {
  keyTopics: string[];
  emotions: string[];
  lifeChanges: string[];
  burdens: string[];
  supports: string[];
  nextConversationTopics: string[];
  summaryLine: string;
}

export interface ProfessionalReport {
  chiefComplaints: string[];
  emotionalPatterns: string[];
  functionalChanges: string[];
  environmentalFactors: string[];
  conversationPatterns: string[];
  followUpQuestions: string[];
  notes: string;
}

export interface CombinedMentalHealthReports {
  userReport: UserReport;
  professionalReport: ProfessionalReport;
}


export interface MentalHealthReport {
  summary: string;
  emotionalFlow: string[];
  keyStatements: string[];
  concerns: string[];
  relationships: string[];
  notesForCounselor: string;
}

export interface LegacyMentalHealthReport {
  summary?: string;
  emotionalFlow?: string[];
  keyStatements?: string[];
  concerns?: string[];
  relationships?: string[];
  notesForCounselor?: string;
}

export interface SessionListItem {
  sessionId: string;
  createdAt?: string;
  updatedAt?: string;
}
