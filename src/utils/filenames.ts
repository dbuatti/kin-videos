export const cleanString = (str: string) => {
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
  return `(${categoryNumber}) ${cleanCategory} / (${lessonNumber}) ${cleanLesson}.mp4`;
};

// Foundations specific order (Fallback)
export const FOUNDATIONS_MODULE_ORDER = [
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

/**
 * Helper to get a consistent index for any category, 
 * prioritizing the Foundations list but supporting new ones.
 */
export const getCategoryIndex = (category: string, allCategories: string[]) => {
  const foundationsIndex = FOUNDATIONS_MODULE_ORDER.indexOf(category);
  if (foundationsIndex !== -1) return foundationsIndex;
  
  // If it's a new course, sort alphabetically among the new modules
  const newModules = allCategories
    .filter(c => !FOUNDATIONS_MODULE_ORDER.includes(c))
    .sort();
  
  return FOUNDATIONS_MODULE_ORDER.length + newModules.indexOf(category);
};

export const MODULE_ORDER = FOUNDATIONS_MODULE_ORDER;

export const VERIFIED_LESSON_ORDER = [
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099726/posts/2164655474",
  // ... (rest of the verified links)
];