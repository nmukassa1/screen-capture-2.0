import prisma from "../prisma";

export const getAllTags = async (
  userId: string
): Promise<{ id: number; name: string; userId: string }[] | null> => {
  return await prisma.tag.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
};

export const getTagByName = async (userId: string, name: string) => {
  return await prisma.tag.findFirst({ where: { userId, name } });
};

export const createTag = async (userId: string, name: string) => {
  return await prisma.tag.create({ data: { userId, name } });
};

export const deleteTag = async (userId: string, tagId: number) => {
  const tag = await prisma.tag.findFirst({
    where: { id: tagId, userId },
  });

  if (!tag) throw new Error("Tag not found");

  return await prisma.tag.delete({
    where: { id: tag.id },
  });
};

export const deleteTagByName = async (userId: string, tagName: string) => {
  const tag = await prisma.tag.findFirst({
    where: { name: tagName, userId },
  });

  console.log("(SERVICE) Deleting tags:", tag);

  if (!tag) throw new Error("Tag not found");

  return await prisma.tag.delete({
    where: { id: tag.id },
  });
};

export const getTagByIds = async (userId: string, tagIds: number[]) => {
  return await prisma.tag.findMany({
    where: { id: { in: tagIds }, userId },
    select: { id: true },
  });
};
