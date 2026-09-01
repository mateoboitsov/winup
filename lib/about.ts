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
  story: {
    eyebrow: string;
    title: string;
    paragraphs: Array<string | { paragraph: string }>;
  };
  team: TeamMember[];
};

const data = aboutJson as AboutFile;

export const ABOUT_STORY: AboutStory = {
  ...data.story,
  paragraphs: data.story.paragraphs.map((p) =>
    typeof p === "string" ? p : p.paragraph
  ),
};
export const TEAM = data.team;
