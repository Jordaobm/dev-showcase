export interface StoredCredential {
  id: string;
  username: string;
  publicKey: string;
  publicKeyAlgorithm: number;
  transports: string[];
  createdAt: string;
}

const g = globalThis as typeof globalThis & {
  challengeStore?: Map<string, string>;
  credentialStore?: Map<string, StoredCredential[]>;
};

g.challengeStore ??= new Map<string, string>();
g.credentialStore ??= new Map<string, StoredCredential[]>();

export const challengeStore = g.challengeStore;
export const credentialStore = g.credentialStore;
