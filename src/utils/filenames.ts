export const cleanString = (str: string) => {
  // Remove characters that are illegal in filenames but keep spaces and basic punctuation
  return str.replace(/[/\\?%*:|"<>]/g, '').trim();
};

export const generateLessonFilename = (
  categoryNumber: number, 
  lessonNumber: number, 
  categoryName: string, 
  lessonName: string
): string => {
  const cleanCategory = cleanString(categoryName);
  const cleanLesson = cleanString(lessonName);
  // Format: (ModuleNumber) CategoryName / (LessonNumber) LessonName.mp4
  // Note: Browsers will usually convert the '/' to an underscore or similar during download
  return `(${categoryNumber}) ${cleanCategory} / (${lessonNumber}) ${cleanLesson}.mp4`;
};

export const MODULE_ORDER = [
  "General / Intro",
  "Course Introduction & Foundational Knowledge",
  "Clinical Assessments",
  "Direct Muscle Tests",
  "Beginning Procedures - Sympathetic Down Regulation",
  "Lymphatic System Assessment and Correction",
  "Vagus Nerve",
  "Pathway Assessments and Corrections",
  "Primitive Reflexes",
  "Postural Reflexes",
  "Cranial Nerves",
  "Emotional Corrections",
  "Finishing Procedures and Home Reinforcement",
  "Background Information",
  "Masterclasses",
  "Functional Anatomy and Biomechanics",
  "Putting it all Together",
  "FNH Foundations Exam",
];