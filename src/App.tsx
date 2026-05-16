import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  CalendarCheck2,
  CheckCircle2,
  CircleDollarSign,
  HeartPulse,
  Home,
  NotebookPen,
  Plus,
  Sparkles,
} from "lucide-react";

type Task = {
  label: string;
  done: boolean;
  area: string;
};

type Metric = {
  label: string;
  value: string;
  trend: string;
};

const tasks: Task[] = [
  { label: "朝のレビューと今日の優先順位決め", done: true, area: "Daily" },
  { label: "請求予定と固定費の確認", done: false, area: "Money" },
  { label: "健康ログを1行だけ残す", done: false, area: "Health" },
  { label: "進行中案件の次アクションを整理", done: true, area: "Work" },
];

const metrics: Metric[] = [
  { label: "完了タスク", value: "8/12", trend: "+2 from yesterday" },
  { label: "集中時間", value: "4.5h", trend: "deep work" },
  { label: "今月収支", value: "+¥84k", trend: "on track" },
];

const navigation = [
  { label: "Home", icon: Home },
  { label: "Daily", icon: CalendarCheck2 },
  { label: "Work", icon: BriefcaseBusiness },
  { label: "Money", icon: CircleDollarSign },
  { label: "Health", icon: HeartPulse },
];

function App() {
  const today = new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "full",
  }).format(new Date());

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Dashboard navigation">
        <div className="brand">
          <span className="brand-mark">
            <Sparkles size={20} aria-hidden="true" />
          </span>
          <span>Life Dashboard</span>
        </div>
        <nav className="nav-list">
          {navigation.map((item) => (
            <button className="nav-button" key={item.label} type="button">
              <item.icon size={18} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">{today}</p>
            <h1>今日の生活をひと目で整える</h1>
          </div>
          <button className="primary-action" type="button">
            <Plus size={18} aria-hidden="true" />
            <span>追加</span>
          </button>
        </header>

        <section className="metric-grid" aria-label="Today's summary">
          {metrics.map((metric) => (
            <article className="metric-card" key={metric.label}>
              <p>{metric.label}</p>
              <strong>{metric.value}</strong>
              <span>{metric.trend}</span>
            </article>
          ))}
        </section>

        <div className="content-grid">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Focus</p>
                <h2>今日のタスク</h2>
              </div>
              <CheckCircle2 size={22} aria-hidden="true" />
            </div>
            <ul className="task-list">
              {tasks.map((task) => (
                <li className="task-row" key={task.label}>
                  <span className={task.done ? "status done" : "status"} />
                  <div>
                    <strong>{task.label}</strong>
                    <small>{task.area}</small>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel accent-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Pulse</p>
                <h2>バランス</h2>
              </div>
              <Activity size={22} aria-hidden="true" />
            </div>
            <div className="balance-meter" aria-hidden="true">
              <span />
            </div>
            <p className="panel-copy">
              仕事、健康、お金の状態を一画面で確認できるようにしたスターター画面です。
            </p>
            <div className="mini-stats">
              <span>
                <BarChart3 size={16} aria-hidden="true" />
                Weekly view
              </span>
              <span>
                <NotebookPen size={16} aria-hidden="true" />
                Memo ready
              </span>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default App;
