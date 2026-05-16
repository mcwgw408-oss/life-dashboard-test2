import { FormEvent, useEffect, useMemo, useState } from 'react';
import './App.css';

const STORAGE_KEY = 'life-dashboard-collapse-signs';

const signItems = [
  '眠りが浅い',
  '食事が乱れている',
  '返信や連絡が重く感じる',
  '部屋や机が散らかってきた',
  '予定を先送りしている',
  '小さな音や言葉に敏感になる',
  '体が重い、だるい',
  'ひとりで抱え込みがち',
];

type SavedSign = {
  id: string;
  savedAt: string;
  checkedItems: string[];
  memo?: string;
};

function readSavedSigns(): SavedSign[] {
  const rawValue = localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .filter((item): item is SavedSign => {
        return (
          item &&
          typeof item.id === 'string' &&
          typeof item.savedAt === 'string' &&
          Array.isArray(item.checkedItems)
        );
      })
      .map((item) => ({
        id: item.id,
        savedAt: item.savedAt,
        checkedItems: item.checkedItems.filter(
          (checkedItem): checkedItem is string => typeof checkedItem === 'string',
        ),
        memo: typeof item.memo === 'string' ? item.memo : '',
      }));
  } catch {
    return [];
  }
}

function formatSavedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function App() {
  const [savedSigns, setSavedSigns] = useState<SavedSign[]>(() => readSavedSigns());
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [memo, setMemo] = useState('');

  const checkedItemSet = useMemo(() => new Set(checkedItems), [checkedItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSigns));
  }, [savedSigns]);

  function handleToggleSign(item: string) {
    setCheckedItems((currentItems) => {
      if (currentItems.includes(item)) {
        return currentItems.filter((currentItem) => currentItem !== item);
      }

      return [...currentItems, item];
    });
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (checkedItems.length === 0 && memo.trim().length === 0) {
      return;
    }

    const nextSign: SavedSign = {
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
      checkedItems,
      memo: memo.trim(),
    };

    setSavedSigns((currentSigns) => [nextSign, ...currentSigns]);
    setCheckedItems([]);
    setMemo('');
  }

  function handleDeleteSign(id: string) {
    setSavedSigns((currentSigns) => currentSigns.filter((sign) => sign.id !== id));
  }

  return (
    <main className="app">
      <section className="check-panel" aria-labelledby="check-title">
        <div className="section-heading">
          <p className="eyebrow">Self Check</p>
          <h1 id="check-title">崩れ始めサインチェック</h1>
          <p className="lead">
            いま当てはまるサインを残して、あとから変化を見返せるようにします。
          </p>
        </div>

        <form className="check-form" onSubmit={handleSave}>
          <fieldset className="sign-grid">
            <legend>チェック項目</legend>
            {signItems.map((item) => (
              <label className="sign-option" key={item}>
                <input
                  checked={checkedItemSet.has(item)}
                  onChange={() => handleToggleSign(item)}
                  type="checkbox"
                />
                <span>{item}</span>
              </label>
            ))}
          </fieldset>

          <label className="memo-field">
            <span>メモ</span>
            <textarea
              onChange={(event) => setMemo(event.target.value)}
              placeholder="気づいたことがあれば入力"
              rows={4}
              value={memo}
            />
          </label>

          <button className="primary-button" type="submit">
            保存する
          </button>
        </form>
      </section>

      <section className="saved-panel" aria-labelledby="saved-title">
        <div className="saved-header">
          <div>
            <p className="eyebrow">History</p>
            <h2 id="saved-title">保存済みの崩れ始めサイン</h2>
          </div>
          <p className="saved-count">合計 {savedSigns.length} 件</p>
        </div>

        {savedSigns.length > 0 ? (
          <div className="saved-list">
            {savedSigns.map((sign) => (
              <article className="saved-card" key={sign.id}>
                <div className="saved-card-header">
                  <time dateTime={sign.savedAt}>{formatSavedAt(sign.savedAt)}</time>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteSign(sign.id)}
                    type="button"
                  >
                    削除
                  </button>
                </div>

                {sign.checkedItems.length > 0 && (
                  <ul className="checked-list" aria-label="チェックされた項目">
                    {sign.checkedItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}

                {sign.memo && (
                  <div className="saved-memo">
                    <span>メモ</span>
                    <p>{sign.memo}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-message">まだ保存されたサインはありません。</p>
        )}
      </section>
    </main>
  );
}

export default App;
