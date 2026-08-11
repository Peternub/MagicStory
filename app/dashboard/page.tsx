import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { requireUser } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await requireUser();

  return (
    <main className="dashboard-room-page">
      <header className="dashboard-room-intro">
        <p>Личный кабинет</p>
        <h1>Ваша комната SkazKIDS</h1>
        <span>Выберите раздел, к которому хотите перейти</span>
        <SignOutButton className="dashboard-signout" />
      </header>

      <section className="dashboard-room" aria-label="Разделы личного кабинета">
        <div className="dashboard-room__window" aria-hidden="true"><span /></div>
        <div className="dashboard-room__lamp" aria-hidden="true"><span /></div>

        <nav className="dashboard-room__zones">
          <Link href="/children" className="room-zone room-zone--profiles">
            <span className="room-zone__art" aria-hidden="true">
              <svg viewBox="0 0 300 240" role="presentation">
                <path className="room-shadow" d="M34 213c37-16 197-16 233 0 9 5 6 13-4 16-48 12-183 11-229-1-10-3-11-10 0-15Z" />
                <rect className="frame-outer" x="38" y="39" width="104" height="124" rx="8" />
                <rect className="frame-inner" x="49" y="50" width="82" height="102" rx="3" />
                <circle className="portrait-sun" cx="111" cy="73" r="10" />
                <path className="portrait-hill portrait-hill--back" d="M49 130 78 99l22 22 15-17 16 18v30H49Z" />
                <path className="portrait-hill" d="m49 139 22-24 18 19 15-13 27 26v5H49Z" />
                <rect className="frame-outer frame-outer--small" x="159" y="68" width="100" height="105" rx="8" />
                <rect className="frame-inner" x="170" y="79" width="78" height="83" rx="3" />
                <circle className="portrait-head" cx="209" cy="109" r="15" />
                <path className="portrait-body" d="M179 162c2-25 13-38 30-38s29 13 30 38Z" />
                <path className="console-top" d="M48 184h204v14H48z" />
                <path className="console-body" d="M58 198h184v18H58z" />
              </svg>
            </span>
            <span className="room-zone__label">
              <strong>Профиль ребёнка / детей</strong>
              <span aria-hidden="true">Открыть <b>→</b></span>
            </span>
          </Link>

          <Link href="/series" className="room-zone room-zone--library">
            <span className="room-zone__art" aria-hidden="true">
              <svg viewBox="0 0 300 240" role="presentation">
                <path className="room-shadow" d="M22 216c45-17 213-17 257 0 10 4 7 12-3 15-53 12-202 11-253-1-11-3-12-10-1-14Z" />
                <rect className="tv-frame" x="38" y="31" width="224" height="139" rx="15" />
                <rect className="tv-screen" x="50" y="43" width="200" height="115" rx="7" />
                <circle className="tv-moon" cx="195" cy="78" r="22" />
                <path className="tv-land tv-land--back" d="m50 126 41-35 35 29 26-21 44 37 25-20 29 22v20H50Z" />
                <path className="tv-land" d="m50 139 35-25 29 19 24-15 35 25 31-22 46 30v7H50Z" />
                <path className="tv-spark" d="m104 68 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" />
                <path className="tv-spark tv-spark--small" d="m143 57 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" />
                <rect className="tv-stand" x="132" y="170" width="36" height="12" rx="2" />
                <path className="console-top" d="M22 182h256v16H22z" />
                <path className="console-body" d="M34 198h232v22H34z" />
                <circle className="console-knob" cx="91" cy="209" r="3" />
                <circle className="console-knob" cx="209" cy="209" r="3" />
              </svg>
            </span>
            <span className="room-zone__label">
              <strong>Библиотека сериалов и серий</strong>
              <span aria-hidden="true">Открыть <b>→</b></span>
            </span>
          </Link>

          <Link href="/billing" className="room-zone room-zone--billing">
            <span className="room-zone__art" aria-hidden="true">
              <svg viewBox="0 0 300 240" role="presentation">
                <path className="room-shadow" d="M37 216c38-16 190-16 227 0 10 4 7 12-3 15-47 12-177 11-224-1-10-3-11-10 0-14Z" />
                <path className="safe-niche" d="M45 40h210v174H45z" />
                <path className="safe-shelf" d="M33 207h234v14H33z" />
                <rect className="safe-body" x="75" y="66" width="150" height="136" rx="12" />
                <rect className="safe-door" x="87" y="78" width="126" height="112" rx="8" />
                <circle className="safe-dial-outer" cx="150" cy="128" r="29" />
                <circle className="safe-dial" cx="150" cy="128" r="19" />
                <path className="safe-dial-mark" d="M150 108v10M150 138v10M130 128h10M160 128h10" />
                <rect className="safe-handle" x="181" y="119" width="9" height="30" rx="4" />
                <circle className="safe-bolt" cx="101" cy="91" r="3" />
                <circle className="safe-bolt" cx="199" cy="91" r="3" />
                <circle className="safe-bolt" cx="101" cy="177" r="3" />
                <circle className="safe-bolt" cx="199" cy="177" r="3" />
              </svg>
            </span>
            <span className="room-zone__label">
              <strong>Тариф и управление тарифом</strong>
              <span aria-hidden="true">Открыть <b>→</b></span>
            </span>
          </Link>
        </nav>
      </section>
    </main>
  );
}
