import type { CSSProperties } from "react";
import Link from "next/link";

export type TreeEpisode = {
  episode_number: number | null;
  id: string;
  title: string | null;
};

type SeriesTreeProps = {
  compact?: boolean;
  episodes: TreeEpisode[];
  plannedEpisodes: number;
  title: string;
};

type BranchStyle = CSSProperties & {
  "--branch-x": string;
  "--branch-y": string;
};

function getBranchGeometry(index: number, count: number) {
  const level = Math.floor(index / 2);
  const levels = Math.ceil(count / 2);
  const progress = levels === 1 ? 0 : level / (levels - 1);
  const side = index % 2 === 0 ? -1 : 1;
  const crownWidth = 20 + Math.sin(progress * Math.PI) * 13 - progress * 5;
  const jitter = (((level + (side > 0 ? 3 : 0)) * 7) % 5) - 2;
  const verticalJitter = (((level + (side > 0 ? 2 : 0)) * 11) % 5) - 2;
  const endX = 50 + side * (crownWidth + jitter);
  const endY = 77 - progress * 65 + verticalJitter;
  const startX = 50 + side * (1.4 + progress * 0.8);
  const startY = Math.min(88, endY + 12 + (1 - progress) * 3.5);
  const controlX1 = startX + side * (7 + (1 - progress) * 3);
  const controlX2 = endX - side * (7 + progress * 2);

  return {
    controlX1,
    controlX2,
    endX,
    endY,
    side,
    startX,
    startY
  };
}

export function SeriesTree({ compact = false, episodes, plannedEpisodes, title }: SeriesTreeProps) {
  const normalizedCount = Math.min(16, Math.max(8, plannedEpisodes));
  const episodeByNumber = new Map(
    episodes.map((episode, index) => [episode.episode_number ?? index + 1, episode])
  );
  const isComplete = episodes.length >= normalizedCount;
  const gradientId = `series-trunk-${normalizedCount}-${title.length}`;

  return (
    <div
      className={`series-tree ${compact ? "series-tree--compact" : ""} ${isComplete ? "series-tree--complete" : ""}`}
      role="group"
      aria-label={`Сериал «${title}»: готово ${Math.min(episodes.length, normalizedCount)} из ${normalizedCount} серий`}
    >
      <svg className="series-tree__drawing" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#a18460" />
            <stop offset="0.52" stopColor="#785d43" />
            <stop offset="1" stopColor="#4f3d31" />
          </linearGradient>
        </defs>

        {isComplete ? (
          <g className="series-tree__full-crown">
            <ellipse cx="35" cy="45" rx="18" ry="28" />
            <ellipse cx="65" cy="44" rx="18" ry="29" />
            <ellipse cx="50" cy="28" rx="19" ry="24" />
            <ellipse cx="50" cy="57" rx="23" ry="22" />
          </g>
        ) : null}

        <path className="series-tree__root" d="M48 92 C42 93 38 96 33 98 M53 92 C59 94 64 96 70 98 M48 94 C45 97 43 98 40 99 M55 95 C58 97 61 98 64 99" />
        <path
          className="series-tree__trunk-shadow"
          d="M42 97 C45 85 45 77 46 68 C47 59 45 53 47 44 C48 35 48 22 49 7 C50 5.8 52 5.8 53 7 C53 22 53 35 54 44 C56 53 53 61 54 69 C55 79 57 88 60 97 Z"
        />
        <path
          className="series-tree__trunk"
          d="M42 96 C45 85 45 77 46 68 C47 59 45 53 47 44 C48 35 48 22 49 7 C50 5.8 52 5.8 53 7 C53 22 53 35 54 44 C56 53 53 61 54 69 C55 79 57 88 60 96 Z"
          fill={`url(#${gradientId})`}
        />
        <path className="series-tree__trunk-light" d="M49 88 C48 70 50 58 49 44 C49 32 50 20 50.5 10" />

        {Array.from({ length: normalizedCount }, (_, index) => {
          const number = index + 1;
          const episode = episodeByNumber.get(number);
          const geometry = getBranchGeometry(index, normalizedCount);
          const { controlX1, controlX2, endX, endY, side, startX, startY } = geometry;
          const branchPath = `M${startX} ${startY} C${controlX1} ${startY - 1}, ${controlX2} ${endY + 5}, ${endX} ${endY}`;

          return (
            <g key={number} className={episode ? "series-tree__branch is-grown" : "series-tree__branch"}>
              <path className="series-tree__branch-shadow" d={branchPath} />
              <path className="series-tree__branch-line" d={branchPath} />
              <path
                className="series-tree__twig"
                d={`M${endX - side * 5} ${endY + 3} C${endX - side * 3} ${endY}, ${endX - side * 1.5} ${endY - 2}, ${endX + side * 1.2} ${endY - 4}`}
              />

              {episode ? (
                <g className="series-tree__leaves" transform={`translate(${endX} ${endY})`}>
                  <ellipse cx="0" cy="-4.8" rx="5.7" ry="3.6" transform="rotate(-8)" />
                  <ellipse cx={side * 4.8} cy="-1.6" rx="6" ry="3.7" transform={`rotate(${side * 24})`} />
                  <ellipse cx={side * -4.7} cy="-1" rx="5.8" ry="3.5" transform={`rotate(${side * -25})`} />
                  <ellipse cx={side * 3.2} cy="3.2" rx="5.4" ry="3.2" transform={`rotate(${side * -13})`} />
                  <ellipse cx={side * -3.4} cy="3.6" rx="5.3" ry="3.1" transform={`rotate(${side * 15})`} />
                  <ellipse cx="0" cy="0" rx="5.8" ry="4.3" />
                </g>
              ) : null}
            </g>
          );
        })}

        <path className="series-tree__ground" d="M29 98 C39 94 62 94 74 98" />
      </svg>

      {!compact ? (
        <div className="series-tree__labels">
          {Array.from({ length: normalizedCount }, (_, index) => {
            const number = index + 1;
            const episode = episodeByNumber.get(number);
            if (!episode) return null;

            const { endX, endY, side } = getBranchGeometry(index, normalizedCount);
            const style = {
              "--branch-x": `${endX}%`,
              "--branch-y": `${endY}%`
            } as BranchStyle;

            return (
              <Link
                key={episode.id}
                href={`/stories/${episode.id}`}
                className={`series-tree__label series-tree__label--${side < 0 ? "left" : "right"}`}
                style={style}
              >
                <span>{number}</span>
                <strong>{episode.title ?? `Серия ${number}`}</strong>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
