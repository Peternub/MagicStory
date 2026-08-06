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

function getBranchPosition(index: number, count: number) {
  const level = Math.floor(index / 2);
  const levels = Math.ceil(count / 2);
  const progress = levels === 1 ? 0 : level / (levels - 1);
  const side = index % 2 === 0 ? -1 : 1;

  return {
    endX: 50 + side * (24 + (level % 3) * 2.4),
    endY: 78 - progress * 62,
    side,
    startY: 84 - progress * 65
  };
}

export function SeriesTree({ compact = false, episodes, plannedEpisodes, title }: SeriesTreeProps) {
  const normalizedCount = Math.min(16, Math.max(8, plannedEpisodes));
  const episodeByNumber = new Map(
    episodes.map((episode, index) => [episode.episode_number ?? index + 1, episode])
  );
  const isComplete = episodes.length >= normalizedCount;

  return (
    <div
      className={`series-tree ${compact ? "series-tree--compact" : ""} ${isComplete ? "series-tree--complete" : ""}`}
      role="group"
      aria-label={`Сериал «${title}»: готово ${Math.min(episodes.length, normalizedCount)} из ${normalizedCount} серий`}
    >
      <svg className="series-tree__drawing" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <linearGradient id={`tree-trunk-${title.length}-${normalizedCount}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8f7151" />
            <stop offset="1" stopColor="#5d4938" />
          </linearGradient>
        </defs>

        <path
          className="series-tree__trunk-shadow"
          d="M50 96 C47 78 52 57 49 36 C48 23 50 13 50 6"
        />
        <path
          className="series-tree__trunk"
          d="M50 96 C47 78 52 57 49 36 C48 23 50 13 50 6"
          stroke={`url(#tree-trunk-${title.length}-${normalizedCount})`}
        />

        {Array.from({ length: normalizedCount }, (_, index) => {
          const number = index + 1;
          const episode = episodeByNumber.get(number);
          const { endX, endY, side, startY } = getBranchPosition(index, normalizedCount);
          const controlX = 50 + side * 12;

          return (
            <g key={number} className={episode ? "series-tree__branch is-grown" : "series-tree__branch"}>
              <path d={`M50 ${startY} C${controlX} ${startY - 2}, ${endX - side * 7} ${endY + 5}, ${endX} ${endY}`} />
              {episode ? (
                <g className="series-tree__leaves" transform={`translate(${endX} ${endY})`}>
                  <ellipse cx={side * 1.3} cy="-1.8" rx="3.9" ry="2.2" transform={`rotate(${side * 24})`} />
                  <ellipse cx={side * -2.2} cy="1.4" rx="3.5" ry="2" transform={`rotate(${side * -28})`} />
                  <ellipse cx="0" cy="-4.4" rx="3.3" ry="1.9" transform="rotate(-8)" />
                </g>
              ) : (
                <circle className="series-tree__dry-tip" cx={endX} cy={endY} r="1.05" />
              )}
            </g>
          );
        })}

        <path className="series-tree__ground" d="M35 96 C42 93 58 93 66 96" />
      </svg>

      {!compact ? (
        <div className="series-tree__labels">
          {Array.from({ length: normalizedCount }, (_, index) => {
            const number = index + 1;
            const episode = episodeByNumber.get(number);
            if (!episode) return null;

            const { endX, endY, side } = getBranchPosition(index, normalizedCount);
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
                {episode.title ?? `Серия ${number}`}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
