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
      tags: tagIds ? { create: tagIds.map((tagId) => ({ tagId })) } : undefined,
    },
    include: { tags: true },
  });

  return screenshot;
};

export const getScreenshots = async (
  userId: string,
  skip: number,
  take: number
) => {
  const [screenshots, totalCount] = await Promise.all([
    prisma.screenshot.findMany({
      where: { userId },
      skip,
      take,
      // Removed invalid orderBy clause as 'createdAt' does not exist in the type
      include: { tags: { include: { tag: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.screenshot.count({
      where: { userId },
    }),
  ]);

  return [screenshots, totalCount];
};

export const getScreenshotById = async (
  userId: string,
  screenshotId: number
) => {
  return await prisma.screenshot.findUnique({
    where: { id: screenshotId, userId },
    include: { tags: { include: { tag: true } } },
  });
};

export const getScreenshotsByTagName = async (
  userId: string,
  tagNames: string[],
  skip: number,
  take: number
) => {
  const tags = await prisma.tag.findMany({
    where: { name: { in: tagNames } },
    select: { id: true },
  });

  const tagIds = tags.map((tag) => tag.id);

  if (tagIds.length === 0) {
    return [[], 0]; // Represents screenshots and totalCount for page
  }

  const [screenshots, totalCount] = await Promise.all([
    prisma.screenshot.findMany({
      where: {
        userId,
        tags: { some: { tagId: { in: tagIds } } },
      },
      skip,
      take,
      include: { tags: { include: { tag: true } } },

      orderBy: { createdAt: "desc" },
    }),
    prisma.screenshot.count({
      where: {
        userId,
        tags: { some: { tagId: { in: tagIds } } },
      },
    }),
  ]);

  return [screenshots, totalCount];
};
export const deleteScreenshot = async (
  userId: string,
  screenshotId: number
) => {
  return await prisma.screenshot.delete({
    where: { id: screenshotId, userId },
  });
};

export const addTagToScreenshot = async (
  userId: string,
  screenshotId: number,
  tagId: number
) => {
  return await prisma.screenshot.update({
    where: { id: screenshotId, userId },
    data: {
      tags: {
        create: { tagId },
      },
    },
  });
};

export const deleteTagFromScreenshot = async (
  userId: string,
  screenshotId: number,
  tagId: number
) => {
  return await prisma.screenshot.update({
    where: { id: screenshotId, userId },
    data: {
      tags: {
        deleteMany: { screenshotId, tagId },
      },
    },
  });
};
