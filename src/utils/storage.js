const EXAM_DATE_KEY = '@CFA_LES_exam_date';
const COMPLETION_STATE_KEY = '@CFA_LES_completion_state';
const STUDY_GOALS_KEY = '@CFA_LES_study_goals';

export const saveExamDate = (dateStr) => {
  try {
    localStorage.setItem(EXAM_DATE_KEY, dateStr);
  } catch (error) {
    console.error('Error saving exam date', error);
  }
};

export const loadExamDate = () => {
  try {
    return localStorage.getItem(EXAM_DATE_KEY);
  } catch (error) {
    console.error('Error loading exam date', error);
    return null;
  }
};

export const saveCompletionState = (stateObj) => {
  try {
    localStorage.setItem(COMPLETION_STATE_KEY, JSON.stringify(stateObj));
  } catch (error) {
    console.error('Error saving completion state', error);
  }
};

export const loadCompletionState = () => {
  try {
    const value = localStorage.getItem(COMPLETION_STATE_KEY);
    if (value !== null) {
      return JSON.parse(value);
    }
    return null;
  } catch (error) {
    console.error('Error loading completion state', error);
    return null;
  }
};

export const saveStudyGoals = (goals) => {
  try {
    localStorage.setItem(STUDY_GOALS_KEY, JSON.stringify(goals));
  } catch (error) {
    console.error('Error saving study goals', error);
  }
};

export const loadStudyGoals = () => {
  try {
    const value = localStorage.getItem(STUDY_GOALS_KEY);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error loading study goals', error);
    return null;
  }
};

export const exportAllData = () => {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    examDate: localStorage.getItem(EXAM_DATE_KEY),
    completionState: localStorage.getItem(COMPLETION_STATE_KEY),
    studySessions: localStorage.getItem('@CFA_LES_study_sessions'),
    studyGoals: localStorage.getItem(STUDY_GOALS_KEY),
  };
  return JSON.stringify(data, null, 2);
};

export const importAllData = (jsonString) => {
  const data = JSON.parse(jsonString);
  if (!data.version) throw new Error('Invalid backup file');
  if (data.examDate) localStorage.setItem(EXAM_DATE_KEY, data.examDate);
  if (data.completionState) localStorage.setItem(COMPLETION_STATE_KEY, data.completionState);
  if (data.studySessions) localStorage.setItem('@CFA_LES_study_sessions', data.studySessions);
  if (data.studyGoals) localStorage.setItem(STUDY_GOALS_KEY, data.studyGoals);
};

const STUDY_SESSIONS_KEY = '@CFA_LES_study_sessions';

export const saveStudySessions = (sessionsArray) => {
  try {
    localStorage.setItem(STUDY_SESSIONS_KEY, JSON.stringify(sessionsArray));
  } catch (error) {
    console.error('Error saving study sessions', error);
  }
};

export const loadStudySessions = () => {
  try {
    const value = localStorage.getItem(STUDY_SESSIONS_KEY);
    if (value !== null) {
      return JSON.parse(value);
    }
    return [];
  } catch (error) {
    console.error('Error loading study sessions', error);
    return [];
  }
};

