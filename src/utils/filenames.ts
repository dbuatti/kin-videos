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
  "Course Introduction & Foundational Knowledge",
  "Preliminary Assessments (P)",
  "Direct Muscle Tests",
  "Ease the System: (E)",
  "Lymphatic System Assessment and Correction",
  "Vagus Nerve",
  "Pathway Assessments and Corrections (A) Aligning the Hierarchies",
  "Primitive Reflexes",
  "Postural Reflexes",
  "Cranial Nerves",
  "Emotional Corrections",
  "Embed (E) Finishing Procedures and Home Reinforcement",
  "Background Information",
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
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2167681807",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2164655462",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2164655465",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2197215814",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2167257485",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2164655463",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2167622397",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2167622399",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099722/posts/2167679824",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2167251417",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2167619695",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2164865269",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2173091485",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2167415588",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2164866613",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099724/posts/2164893984",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2164756677",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2164655470",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2166239953",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2167833384",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2166647569",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2167418078",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2167833389",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2166288733",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2166647725",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2167503394",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2167833404",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2167833407",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2167833410",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2167833413",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152591139/posts/2167833423",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164765571",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164655471",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164763360",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164655472",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164764506",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2192994870",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099725/posts/2164663189",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2158539300/posts/2164764799",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2158539300/posts/2191285451",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2158539300/posts/2164723635",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2158539300/posts/2164719983",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152152431/posts/2164865060",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152152431/posts/2164865138",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152152431/posts/2166291753",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2164723262",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2164728792",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2164726137",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2164772241",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2167444469",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2167468893",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2167469166",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2169356729",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2171239933",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2171201710",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2171265894",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2172654502",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2171201712",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099977/posts/2172676338",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2164792212",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2164760586",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2167094242",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2164728867",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2167502429",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2164729000",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2169016216",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2164729690",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2167502394",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2167502432",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2167502438",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2167502433",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2167502436",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2170115837",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127437/posts/2190363557",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154822754/posts/2175437516",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2164792486",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167205372",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167779783",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167779787",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167779806",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167780073",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167780077",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167780903",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167780911",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167780916",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167780918",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167780933",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2167780939",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2164724704",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2164725655",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2173612406",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152127509/posts/2197278676",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152249762/posts/2165230137",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152249762/posts/2172678455",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152249762/posts/2164720410",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099726/posts/2164655473",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099726/posts/2164757718",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099726/posts/2172690792",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099726/posts/2164655474",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099723/posts/2164853086",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152099723/posts/2165118302",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152867936/posts/2171369485",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152867936/posts/2171369489",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2152867936/posts/2171369492",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154487237/posts/2176704641",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2154487237/posts/2187520560",
  "https://functional-neuro-health.mykajabi.com/products/functional-neuro-approach-foundations/categories/2156390136/posts/2182274096",
];