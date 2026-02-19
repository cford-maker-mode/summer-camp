import * as userData from "../user-data";

describe("User data sync and schema versioning", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns null if no access token", async () => {
    const result = await userData.loadUserFavorites(undefined);
    expect(result).toBeNull();
  });

  it("sets version field when saving favorites", async () => {
    const mockUpload = jest.fn().mockResolvedValue(undefined);
    await userData.saveUserFavorites({ campIds: ["camp1"], version: "0.9" }, "token", mockUpload);
    expect(mockUpload).toHaveBeenCalledWith("FAVORITES_FILE_ID", expect.objectContaining({ version: "1.0" }), "token");
  });
});
