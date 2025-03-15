import prisma from "../prisma";

export const uploadScreenshot = async (
  userId: string,
  img: string,
  siteName: string,
  siteUrl: string,
  tagIds?: number[]
) => {
  const screenshot = await prisma.screenshot.create({
    data: {
      userId,
      img,
      siteName,
      siteUrl,
      tags: tagIds
        ? { create: tagIds.map((tagId) => ({ tagId })) }
        : undefined,
    },
    include: { tags: true },
  });

  return screenshot;
};

export const getScreenshots = async (userId: string) => {
  return await prisma.screenshot.findMany({
    where: { userId },
    include: { tags: { include: { tag: true } } },
  });
};

export const getScreenshotById = async (userId: string, screenshotId: number) => {
  return await prisma.screenshot.findUnique({
    where: { id: screenshotId, userId },
    include: { tags: { include: { tag: true } } },
  });
}


export const getScreenshotsByTagName = async (userId: string, tagNames: string[]) => {
  // Fetch tagIds based on provided tagNames
  const tags = await prisma.tag.findMany({
    where: { name: { in: tagNames } },  // Match tagNames to find tagId
    select: { id: true },  // Only select the tag IDs
  });

  const tagIds = tags.map(tag => tag.id);
  console.log("Found tagIds:", tagIds);
  

  if (tagIds.length === 0) {
    return []; // No matching tags found
  }

  return await prisma.screenshot.findMany({
    where: {
      userId,
      tags: { some: { tagId: { in: tagIds } } }, // Filter by multiple tagIds
    },
    include: { tags: { include: { tag: true } } },
  });
};


export const deleteScreenshot = async (userId: string, screenshotId: number) => {
  return await prisma.screenshot.delete({
    where: { id: screenshotId, userId },
  });
};