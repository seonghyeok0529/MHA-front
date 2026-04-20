import { CombinedMentalHealthReports, LegacyMentalHealthReport, ProfessionalReport, UserReport } from '../types/report';

const API_URL = import.meta.env.VITE_API_URL;

const emptyUserReport: UserReport = {
  keyTopics: [],
  emotions: [],
  lifeChanges: [],
  burdens: [],
  supports: [],
  nextConversationTopics: [],
  summaryLine: '',
};

const emptyProfessionalReport: ProfessionalReport = {
  chiefComplaints: [],
  emotionalPatterns: [],
  functionalChanges: [],
  environmentalFactors: [],
  conversationPatterns: [],
  followUpQuestions: [],
  notes: '',
};

function fromLegacyReport(legacy: LegacyMentalHealthReport): CombinedMentalHealthReports {
  return {
    userReport: {
      keyTopics: legacy.keyStatements ?? [],
      emotions: legacy.emotionalFlow ?? [],
      lifeChanges: [],
      burdens: legacy.concerns ?? [],
      supports: legacy.relationships ?? [],
      nextConversationTopics: [],
      summaryLine: legacy.summary ?? '',
    },
    professionalReport: {
      chiefComplaints: legacy.concerns ?? [],
      emotionalPatterns: legacy.emotionalFlow ?? [],
      functionalChanges: [],
      environmentalFactors: legacy.relationships ?? [],
      conversationPatterns: legacy.keyStatements ?? [],
      followUpQuestions: [],
      notes: legacy.notesForCounselor ?? '',
    },
  };
}

function hasDualShape(payload: unknown): payload is CombinedMentalHealthReports {
  if (!payload || typeof payload !== 'object') return false;
  const target = payload as Partial<CombinedMentalHealthReports>;
  return Boolean(target.userReport && target.professionalReport);
}

export async function fetchDualReports(sessionId: string): Promise<CombinedMentalHealthReports> {
  const response = await fetch(`${API_URL}/api/mentalhealth/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId }),
  });

  if (!response.ok) {
    throw new Error('Report API error');
  }

  const payload: unknown = await response.json();

  if (hasDualShape(payload)) {
    return {
      userReport: { ...emptyUserReport, ...payload.userReport },
      professionalReport: { ...emptyProfessionalReport, ...payload.professionalReport },
    };
  }

  return fromLegacyReport(payload as LegacyMentalHealthReport);
}
