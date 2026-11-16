export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Platform =
  | 'LeetCode'
  | 'Codeforces'
  | 'HackerRank'
  | 'GeeksforGeeks'
  | 'CodeChef'
  | 'Other';

export interface Question {
  id: string;
  title: string;
  difficulty: Difficulty;
  platform?: Platform;
  link?: string;
  resource?: string;
  tags: string[];
  notes?: string;
  isSolved?: boolean;
  isStarred?: boolean;
  isRevision?: boolean;
  lastPracticedAt?: number | null;
  solvedAt?: number | null;
  createdAt?: number;
}

export interface CompanyTagRecord {
  id?: string;
  platform: Platform;
  problemSlug: string;
  companyName: string;
  frequencyScore: number;
  syncedAt?: string;
}
