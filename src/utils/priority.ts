"use client";

export const PRIORITY_LESSON_TITLES = [
  "Lecture: Gaits Integration",
  "Gaits Integration Procedure",
  "In class Lecture: Gaits",
  "Things to Check during the session and for Home Reinforcement"
];

export const isPriorityLesson = (title: string | null) => {
  if (!title) return false;
  return PRIORITY_LESSON_TITLES.includes(title);
};