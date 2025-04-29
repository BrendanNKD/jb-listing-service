// observers/JobListingObserver.ts
import {type IJobListing } from "../models/jobListing";

interface IJobListingObserver {
    onJobListingCreated(job: IJobListing): Promise<void>;
    onJobListingUpdated(job: IJobListing): Promise<void>;
    onJobListingDeleted(jobId: string): Promise<void>;
}

export class JobListingSubject {
    private static instance: JobListingSubject;
    private observers: IJobListingObserver[] = [];
    
    private constructor() {}
    
    public static getInstance(): JobListingSubject {
        if (!JobListingSubject.instance) {
        JobListingSubject.instance = new JobListingSubject();
        }
        return JobListingSubject.instance;
    }
    
    public subscribe(observer: IJobListingObserver): void {
        this.observers.push(observer);
    }
    
    public unsubscribe(observer: IJobListingObserver): void {
        this.observers = this.observers.filter(obs => obs !== observer);
    }
    
    public async notifyJobListingCreated(job: IJobListing): Promise<void> {
        await Promise.all(this.observers.map(observer => 
        observer.onJobListingCreated(job).catch(console.error)
        ));
    }
    
    public async notifyJobListingUpdated(job: IJobListing): Promise<void> {
        await Promise.all(this.observers.map(observer => 
        observer.onJobListingUpdated(job).catch(console.error)
        ));
    }
    
    public async notifyJobListingDeleted(jobId: string): Promise<void> {
        await Promise.all(this.observers.map(observer => 
        observer.onJobListingDeleted(jobId).catch(console.error)
        ));
    }
    }