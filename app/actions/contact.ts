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
    email: formData.get("email"),
    message: formData.get("message")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Проверьте введенные данные"
    };
  }

  console.log("contact request", parsed.data);

  return {
    success:
      "Сообщение принято. В демо-версии заявки пока не сохраняются в CRM, но форма уже готова."
  };
}
