import prisma from "../../../connect.prisma.ts";

export const userMobileService = {
  saveDeviceToken: async (userId: string, token: string) => {
    const updated = await prisma.users.update({
      where: { id: userId },
      data: { expoPushToken: token },
      select: { id: true, userName: true, expoPushToken: true },
    });
    return updated;
  },
};
