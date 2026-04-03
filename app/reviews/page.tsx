const reviews = [
  {
    name: "Анна, мама сына 5 лет",
    text: "Сервис помогает мягко обсудить сложные темы без прямого давления. Особенно хорошо работает перед сном."
  },
  {
    name: "Игорь, папа дочери 7 лет",
    text: "Понравилось, что история действительно учитывает интересы ребенка, а не выглядит случайным текстом."
  },
  {
    name: "Мария, мама двоих детей",
    text: "Удобно, что есть и текст, и аудио. Это уже похоже на настоящий семейный инструмент, а не на разовую игрушку."
  },
  {
    name: "Елена, семейный психолог",
    text: "Как формат мягкого разговора и вечернего ритуала решение выглядит очень перспективно."
  }
];

export default function ReviewsPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col px-6 py-10 sm:px-10">
      <section className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 sm:p-10">
        <p className="text-sm uppercase tracking-[0.24em] text-brand-200">
          Отзывы
        </p>
        <h1 className="mt-4 font-display text-4xl text-white">
          Как выглядит ценность продукта глазами родителей
        </h1>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        {reviews.map((review) => (
          <article
            key={review.name}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-8"
          >
            <p className="text-sm leading-7 text-white/75">“{review.text}”</p>
            <p className="mt-6 text-sm font-medium text-brand-200">{review.name}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
