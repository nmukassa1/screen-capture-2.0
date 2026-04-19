import prisma from "../prisma";
import { createUserClient } from "../supabase/supabase";
export interface Tag {
  id: number;
}

export const uploadScreenshot = async (
  userId: string,
  img: string,
  siteName: string,
  siteUrl: string,
  tagIds?: number[]
) => {
  if (tagIds?.length) {
    const owned = await prisma.tag.findMany({
      where: { userId, id: { in: tagIds } },
      select: { id: true },
    });
    if (owned.length !== tagIds.length) {
      throw new Error(
        "One or more tags are invalid or do not belong to this user"
      );
    }
  }

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
      include: { tags: { include: { tag: true } }, description: true },
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
    where: { userId, name: { in: tagNames } },
    select: { id: true },
  });

  const tagIds = tags.map((tag: Tag) => tag.id);

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
      include: { tags: { include: { tag: true } }, description: true },

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
  screenshotId: number,
  accessToken: string
) => {
  // Get the screenshot record (to get the file path)
  const screenshot = await prisma.screenshot.findFirst({
    where: { id: screenshotId, userId },
  });

  if (!screenshot) {
    console.error("Screenshot not found or unauthorized access attempt");

    throw new Error("Screenshot not found or unauthorized");
  }

  const extractPathFromUrl = (url: string): string => {
    const parsedUrl = new URL(url);
    return parsedUrl.pathname.replace(
      "/storage/v1/object/public/screenshots/",
      ""
    );
  };

  const imageToDelete = extractPathFromUrl(screenshot.img);
  console.log("Image to delete:", imageToDelete);

  try {
    // Restore user session
    if (!accessToken) {
      throw new Error("Access token is required");
    }

    const supabaseClient = createUserClient(accessToken);

    const { data, error } = await supabaseClient.storage
      .from("screenshots") // your bucket name
      .remove([imageToDelete]); // must match key you used when uploading

    console.log("Supabase storage remove data:", data);

    // Delete image from Supabase Storage
    // const { error } = await supabase.storage
    //   .from("screenshots") // your bucket name
    //   .remove([imageToDelete]); // must match key you used when uploading

    if (error) {
      throw new Error("Storage deletion failed");
    }

    return await prisma.screenshot.delete({
      where: { id: screenshotId, userId },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const addTagToScreenshot = async (
  userId: string,
  screenshotId: number,
  tagId: number
) => {
  const tag = await prisma.tag.findFirst({ where: { id: tagId, userId } });
  if (!tag) {
    throw new Error("Tag not found or does not belong to this user");
  }

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

export const updateScreenshotDescription = async (
  userId: string,
  screenshotId: number,
  description: string | ""
) => {
  // First, ensure the screenshot belongs to the user (optional auth check)
  const screenshot = await prisma.screenshot.findFirst({
    where: { id: screenshotId, userId },
  });

  if (!screenshot) {
    throw new Error("Screenshot not found.");
  }

  // Does screenshotId exist in description table
  const descriptionExists = await prisma.screenshotDescription.findFirst({
    where: { screenshotId },
  });

  if (!descriptionExists) {
    return await prisma.screenshotDescription.create({
      data: {
        content: description,
        screenshotId,
      },
    });
  } else {
    return await prisma.screenshotDescription.update({
      where: { screenshotId }, // because it's unique
      data: { content: description },
    });
  }
};
