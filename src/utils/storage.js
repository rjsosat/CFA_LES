const EXAM_DATE_KEY = '@CFA_LES_exam_date';
const COMPLETION_STATE_KEY = '@CFA_LES_completion_state';

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

