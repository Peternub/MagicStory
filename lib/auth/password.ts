import argon2 from "argon2";
import bcrypt from "bcrypt";

const ARGON2_OPTIONS = {
  memoryCost: 19_456,
  parallelism: 1,
  timeCost: 2,
  type: argon2.argon2id
} as const;

function isArgon2Hash(hash: string) {
  return hash.startsWith("$argon2id$");
}

function isLegacyBcryptHash(hash: string) {
  return /^\$2[aby]\$/.test(hash);
}

export async function hashLocalPassword(password: string) {
  return argon2.hash(password, ARGON2_OPTIONS);
}

export async function verifyLocalPassword(params: {
  hash: string;
  password: string;
}) {
  try {
    if (isArgon2Hash(params.hash)) {
      return await argon2.verify(params.hash, params.password);
    }

    if (isLegacyBcryptHash(params.hash)) {
      return await bcrypt.compare(params.password, params.hash);
    }

    return false;
  } catch {
    return false;
  }
}

export function localPasswordNeedsRehash(hash: string) {
  if (!isArgon2Hash(hash)) {
    return true;
  }

  return argon2.needsRehash(hash, ARGON2_OPTIONS);
}
