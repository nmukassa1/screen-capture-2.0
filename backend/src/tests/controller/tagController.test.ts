import request from "supertest";
import * as tagService from "../../controllers/tagController";
import { jest } from "@jest/globals";

interface Tag {
    id: number;
    name: string;
    userId: string;
  };

// Mock the tagService
jest.mock("../../controllers/tagController");

describe("GET /tags/:user", () => {
  const mockTags: Tag[] = [{ id: 1, name: "Tech", userId: '1' }, { id: 2, name: "Gaming", userId: '1' }];
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return tags for a valid user", async () => {
    (tagService.getAllTags as jest.Mock).mockResolvedValue(mockTags);

    const response = await request(app).get("/tags/testUser");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockTags);
    expect(tagService.getAllTags).toHaveBeenCalledWith("testUser");
  });

  test("should return 404 if no tags found", async () => {
    (tagService.getAllTags as jest.Mock).mockResolvedValue(null);

    const response = await request(app).get("/tags/nonExistentUser");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Tags not found" });
  });

  test("should return 500 if an error occurs", async () => {
    (tagService.getAllTags as jest.Mock).mockRejectedValue(new Error("DB Error"));

    const response = await request(app).get("/tags/errorUser");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Failed to fetch tags" });
  });
});