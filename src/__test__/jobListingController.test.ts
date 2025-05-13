// src/__tests__/jobListingController.test.ts
import {
    test,
    describe,
    expect,
    beforeEach,
    afterEach,
    mock,
  } from "bun:test";
  
  import {
    getAllJobListings,
    createJobListing,
    getJobListingById,
    updateJobListing,
    deleteJobListing,
  } from "../controllers/jobListingController";
  
  import { JobListing, type IJobListing } from "../models/jobListing";
  
  describe("JobListing Controller", () => {
    // local mock references
    let findMock: ReturnType<typeof mock>;
    let findByIdMock: ReturnType<typeof mock>;
    let findByIdAndUpdateMock: ReturnType<typeof mock>;
    let findByIdAndDeleteMock: ReturnType<typeof mock>;
    let saveMock: ReturnType<typeof mock>;
  
    beforeEach(() => {
      findMock = mock();
      findByIdMock = mock();
      findByIdAndUpdateMock = mock();
      findByIdAndDeleteMock = mock();
      saveMock = mock();
  
      ;(JobListing as any).find = findMock;
      ;(JobListing as any).findById = findByIdMock;
      ;(JobListing as any).findByIdAndUpdate = findByIdAndUpdateMock;
      ;(JobListing as any).findByIdAndDelete = findByIdAndDeleteMock;
  
      JobListing.prototype.save = saveMock;
    });
  
    afterEach(() => {
    });
  
    test("getAllJobListings — returns data on success", async () => {
      const fake = [{ title: "Dev" }, { title: "QA" }];
      findMock.mockResolvedValue(fake);
  
      const res = await getAllJobListings();
      expect(findMock).toHaveBeenCalled();
      expect(res).toEqual({ success: true, data: fake });
    });
  
    test("getAllJobListings — returns error on failure", async () => {
      findMock.mockRejectedValue(new Error("DB error"));
  
      const res = await getAllJobListings();
      expect(res).toEqual({ success: false, error: "DB error" });
    });
  
    test("createJobListing — saves and returns new job", async () => {
      const payload: Partial<IJobListing> = { title: "Tester" };
      const fakeSaved = { _id: "1", ...payload };
      saveMock.mockResolvedValue(fakeSaved);
  
      const res = await createJobListing(payload);
      expect(saveMock).toHaveBeenCalled();
      expect(res).toEqual({ success: true, data: fakeSaved });
    });
  
    test("createJobListing — returns error when save fails", async () => {
      saveMock.mockRejectedValue(new Error("Save failed"));
  
      const res = await createJobListing({ title: "X" });
      expect(res).toEqual({ success: false, error: "Save failed" });
    });
  
    test("getJobListingById — returns job when found", async () => {
      const fakeJob = { _id: "123", title: "Dev" };
      findByIdMock.mockResolvedValue(fakeJob);
  
      const res = await getJobListingById("123");
      expect(findByIdMock).toHaveBeenCalledWith("123");
      expect(res).toEqual({ success: true, data: fakeJob });
    });
  
    test("getJobListingById — 404 when not found", async () => {
      findByIdMock.mockResolvedValue(null);
  
      const res = await getJobListingById("nope");
      expect(res).toEqual({
        success: false,
        error: "Job listing not found",
        status: 404,
      });
    });
  
    test("getJobListingById — returns error on exception", async () => {
      findByIdMock.mockRejectedValue(new Error("Oops"));
  
      const res = await getJobListingById("123");
      expect(res).toEqual({ success: false, error: "Oops" });
    });
  
    test("updateJobListing — updates and returns job when found", async () => {
      const updated = { _id: "1", title: "New" };
      findByIdAndUpdateMock.mockResolvedValue(updated);
  
      const res = await updateJobListing("1", { title: "New" });
      expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({
          title: "New",
          updatedAt: expect.any(Date),
        }),
        { new: true }
      );
      expect(res).toEqual({ success: true, data: updated });
    });
  
    test("updateJobListing — 404 when not found", async () => {
      findByIdAndUpdateMock.mockResolvedValue(null);
  
      const res = await updateJobListing("nope", {});
      expect(res).toEqual({
        success: false,
        error: "Job listing not found",
        status: 404,
      });
    });
  
    test("updateJobListing — returns error on exception", async () => {
      findByIdAndUpdateMock.mockRejectedValue(new Error("Bad"));
  
      const res = await updateJobListing("1", {});
      expect(res).toEqual({ success: false, error: "Bad" });
    });
  
    test("deleteJobListing — deletes and confirms", async () => {
      findByIdAndDeleteMock.mockResolvedValue({ _id: "1" });
  
      const res = await deleteJobListing("1");
      expect(findByIdAndDeleteMock).toHaveBeenCalledWith("1");
      expect(res).toEqual({
        success: true,
        data: { message: "Job listing deleted successfully" },
      });
    });
  
    test("deleteJobListing — 404 when not found", async () => {
      findByIdAndDeleteMock.mockResolvedValue(null);
  
      const res = await deleteJobListing("nope");
      expect(res).toEqual({
        success: false,
        error: "Job listing not found",
        status: 404,
      });
    });
  
    test("deleteJobListing — returns error on exception", async () => {
      findByIdAndDeleteMock.mockRejectedValue(new Error("Err"));
  
      const res = await deleteJobListing("1");
      expect(res).toEqual({ success: false, error: "Err" });
    });
  });
  