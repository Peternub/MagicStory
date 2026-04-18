"use server";

import { contactSchema } from "@/lib/validators/contact";

type ContactActionState = {
  error?: string;
  success?: string;
};

export async function sendContactRequest(
  _prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    contact: formData.get("contact"),
    message: formData.get("message")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Проверьте введенные данные"
    };
  }

  console.log("contact request", parsed.data);

  return {
    success: "Сообщение отправлено. Мы свяжемся с вами по указанному контакту."
  };
}
