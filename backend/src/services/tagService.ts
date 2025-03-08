import prisma from "../prisma";

export const getAllTags = async (userId: string): Promise<{ id: number; name: string, userId: string }[] | null> => {
  return await prisma.tag.findMany({ where: { userId } });
};

export const getTagByName = async (userId: string, name: string) => {
  return await prisma.tag.findFirst({ where: { userId, name } });
}

export const createTag = async (userId: string, name: string) => {
  return await prisma.tag.create({ data: { userId, name } });
};

export const deleteTag = async (userId: string, tagId: number) => {
  return await prisma.tag.deleteMany({
    where: { id: tagId, userId },
  });
};

export const getTagByIds = async (userId: string, tagIds: number[]) => {
  return await prisma.tag.findMany({ where: { id: {in: tagIds}, userId }, select: { id: true} });
}