// controllers/jobListingController.ts
import { JobListing, type IJobListing } from "../models/jobListing";
import ControllerResultFactory from "../factories/ControllerResultFactory";
import { JobListingSubject } from "../observers/jobListingSubject";
// GET all job applications with resume transformed to include only the filename.

interface ControllerResult {
  success: boolean;
  data?: any;
  error?: string;
  status?: number;
}

const jobListingSubject = JobListingSubject.getInstance();

// GET all job listings
export const getAllJobListings = async (): Promise<ControllerResult> => {
  try {
    const listings = await JobListing.find();
    return ControllerResultFactory.success(listings);
  } catch (error: any) {
    return ControllerResultFactory.fromError(error);
  }
};

// CREATE a new job listing
export const createJobListing = async (
  payload: Partial<IJobListing>
): Promise<ControllerResult> => {
  try {
    const newJob = new JobListing(payload);
    const savedJob = await newJob.save();
    
    // Notify observers asynchronously without waiting
    jobListingSubject.notifyJobListingCreated(savedJob)
      .catch(error => console.error('Error notifying observers:', error));
    
    return ControllerResultFactory.success(savedJob, 201);
  } catch (error: any) {
    return ControllerResultFactory.fromError(error);
  }
};

// GET a job listing by ID
export const getJobListingById = async (id: string): Promise<ControllerResult> => {
  try {
    const job = await JobListing.findById(id);
    if (!job) return ControllerResultFactory.notFound("Job listing not found");
    return ControllerResultFactory.success(job);
  } catch (error: any) {
    return ControllerResultFactory.fromError(error);
  }
};

// UPDATE a job listing by ID
export const updateJobListing = async (
  id: string,
  payload: Partial<IJobListing>
): Promise<ControllerResult> => {
  try {
    payload.updatedAt = new Date();
    const updatedJob = await JobListing.findByIdAndUpdate(id, payload, { 
      new: true 
    });
    if (!updatedJob) return ControllerResultFactory.notFound("Job listing not found");
    
    // Notify observers asynchronously
    jobListingSubject.notifyJobListingUpdated(updatedJob)
      .catch(error => console.error('Error notifying observers:', error));
    
    return ControllerResultFactory.success(updatedJob);
  } catch (error: any) {
    return ControllerResultFactory.fromError(error);
  }
};

// DELETE a job listing by ID
export const deleteJobListing = async (id: string): Promise<ControllerResult> => {
  try {
    const deletedJob = await JobListing.findByIdAndDelete(id);
    if (!deletedJob) return ControllerResultFactory.notFound("Job listing not found");
    
    // Notify observers asynchronously
    jobListingSubject.notifyJobListingDeleted(id)
      .catch(error => console.error('Error notifying observers:', error));
    
    return ControllerResultFactory.success({ 
      message: "Job listing deleted successfully" 
    });
  } catch (error: any) {
    return ControllerResultFactory.fromError(error);
  }
};