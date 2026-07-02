import jwt from "jsonwebtoken";

export const tokenService = {
  createTokens(userId: string | number): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(
      { userId },
      process.env.REFRESH_SECRET as string,
      { expiresIn: "7d" },
    );
    return { accessToken, refreshToken };
  },

  verifyAccessToken(
    accessToken: string,
    option?: jwt.VerifyOptions,
  ): jwt.JwtPayload {
    const decode = jwt.verify(
      accessToken,
      process.env.JWT_SECRET as string,
      option,
    ) as jwt.JwtPayload;
    return decode;
  },

  verifyRefreshToken(
    refreshToken: string,
    option?: jwt.VerifyOptions,
  ): jwt.JwtPayload {
    const decode = jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET as string,
      option,
    ) as jwt.JwtPayload;
    return decode;
  },
};
