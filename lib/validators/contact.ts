import { z } from "zod";

const formText = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : ""),
  z.string()
);

export const contactSchema = z.object({
  name: formText,
  contact: formText,
  message: formText
});
