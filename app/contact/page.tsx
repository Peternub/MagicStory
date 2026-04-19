import { ContactForm } from "@/components/site/contact-form";

export default function ContactPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col px-6 py-10 sm:px-10">
      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div
          className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-primary)] p-8 sm:p-10"
          style={{ boxShadow: "var(--glow-shadow)" }}
        >
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--logo-text)]">
            Контакты
          </p>
          <h1 className="mt-4 font-display text-4xl text-[var(--text-main)]">
            Связаться с нами и обсудить проект
          </h1>
          <p className="mt-6 text-lg leading-8 text-[var(--text-soft)]">
            На этой странице можно оставить сообщение о продукте, партнерстве,
            семейном использовании сервиса или будущем запуске оплаты.
          </p>

          <div className="mt-8 grid gap-4">
            <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] p-5">
              <p className="text-sm font-medium text-[var(--text-main)]">Для родителей</p>
              <p className="mt-2 text-sm text-[var(--text-soft)]">
                Вопросы по регистрации, кабинету родителя, сказкам и подписке.
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] p-5">
              <p className="text-sm font-medium text-[var(--text-main)]">Для партнеров</p>
              <p className="mt-2 text-sm text-[var(--text-soft)]">
                Интерес к совместным проектам, пакетам для студий и семейных клубов.
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] p-5">
              <p className="text-sm font-medium text-[var(--text-main)]">Срок ответа</p>
              <p className="mt-2 text-sm text-[var(--text-soft)]">
                Обычно отвечаем в течение одного рабочего дня.
              </p>
            </div>
          </div>
        </div>

        <ContactForm />
      </section>
    </main>
  );
}
