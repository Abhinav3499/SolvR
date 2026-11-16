export interface ShareSnapshotPayload {
  version: number;
  title: string;
  creatorName?: string;
  createdAt: number;
  problemTokens: string;
}

export interface DecodedProblemToken {
  platform: string;
  id: string;
  topic: string;
  difficulty: string;
}

export interface DecodedShareSheet {
  title: string;
  creatorName: string;
  createdAt: number;
  problems: DecodedProblemToken[];
}
