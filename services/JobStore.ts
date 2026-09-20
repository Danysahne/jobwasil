import type { Job } from '@/JobwasilAPI';

// Simple in-memory store to share job data between list and detail screens
const jobMap = new Map<string, Job>();

export function storeJobs(jobs: Job[]) {
  jobs.forEach((job) => {
    const key = (job as any).hashId || (job as any).refnr;
    if (key) jobMap.set(String(key), job);
  });
}

export function getJob(id: string): Job | undefined {
  return jobMap.get(id);
}
