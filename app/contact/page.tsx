import { ContactForm } from "@/components/site/contact-form";

export default function ContactPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col px-6 py-10 sm:px-10">
      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2.5rem] border border-white/10 bg-[#160a27] p-8 sm:p-10">
          <p className="text-sm uppercase tracking-[0.24em] text-brand-200">
            Контакты
          </p>
          <h1 className="mt-4 font-display text-4xl text-white">
            Связаться с нами и обсудить проект
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/70">
            На этой странице можно оставить сообщение о продукте, партнерстве,
            семейном использовании сервиса или будущем запуске оплаты.
          </p>

          <div className="mt-8 grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-[#0d0818] p-5">
              <p className="text-sm font-medium text-white">Для родителей</p>
              <p className="mt-2 text-sm text-white/65">
                Вопросы по регистрации, кабинетам детей, сказкам и подписке.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0d0818] p-5">
              <p className="text-sm font-medium text-white">Для партнеров</p>
              <p className="mt-2 text-sm text-white/65">
                Интерес к совместным проектам, пакетам для студий и семейных
                клубов.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0d0818] p-5">
              <p className="text-sm font-medium text-white">Срок ответа</p>
              <p className="mt-2 text-sm text-white/65">
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
