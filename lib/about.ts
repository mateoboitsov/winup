import aboutJson from "@/content/about.json";

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  photo?: string;
};

export type AboutStory = {
  eyebrow: string;
  title: string;
  paragraphs: string[];
};

type AboutFile = {
  story: AboutStory;
  team: TeamMember[];
};

const data = aboutJson as AboutFile;

export const ABOUT_STORY = data.story;
export const TEAM = data.team;
