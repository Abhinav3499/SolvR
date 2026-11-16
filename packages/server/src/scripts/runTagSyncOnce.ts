#!/usr/bin/env tsx
import { syncCompanyTags } from '../workers/companyTagsWorker.js';

async function main() {
  console.log('[Worker Runner] Executing standalone company tag sync...');
  const result = await syncCompanyTags({ force: true });
  console.log('[Worker Runner] Result:', JSON.stringify(result, null, 2));
  process.exit(result.status === 'failed' ? 1 : 0);
}

main().catch((err) => {
  console.error('[Worker Runner] Fatal error:', err);
  process.exit(1);
});
