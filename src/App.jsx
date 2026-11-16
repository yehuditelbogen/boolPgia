import React, { useCallback, useEffect, useState } from 'react';

const CODE_LENGTH = 4;
const MAX_ATTEMPTS = 8;

function createSecret() {
  const digits = Array.from({ length: 10 }, (_, index) => String(index));

  for (let index = digits.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [digits[index], digits[randomIndex]] = [digits[randomIndex], digits[index]];
  }

  return digits.slice(0, CODE_LENGTH);
}

function getFeedback(guess, secret) {
  const bulls = guess.reduce(
    (count, digit, index) => count + Number(digit === secret[index]),
    0,
  );
  const secretDigits = new Set(secret);
  const cows = guess.reduce(
    (count, digit, index) =>
      count + Number(digit !== secret[index] && secretDigits.has(digit)),
    0,
  );

  return { bulls, cows };
}

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  if (name === 'refresh') {
    return (
      <svg {...common}>
        <path d="M20 7v5h-5" />
        <path d="M4.93 9A8 8 0 0 1 18.36 5.64L20 7M4 17v-5h5" />
        <path d="M19.07 15A8 8 0 0 1 5.64 18.36L4 17" />
      </svg>
    );
  }

  if (name === 'backspace') {
    return (
      <svg {...common}>
        <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" />
        <path d="m18 9-6 6m0-6 6 6" />
      </svg>
    );
  }

  if (name === 'arrow') {
    return (
      <svg {...common}>
        <path d="M5 12h14m-7-7 7 7-7 7" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5m0-8h.01" />
    </svg>
  );
}

function App() {
  const [secret, setSecret] = useState(createSecret);
  const [currentGuess, setCurrentGuess] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [gameStatus, setGameStatus] = useState('playing');
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [gamesWon, setGamesWon] = useState(0);
  const [bestScore, setBestScore] = useState(null);

  const addDigit = useCallback(
    (digit) => {
      if (
        gameStatus !== 'playing' ||
        currentGuess.length >= CODE_LENGTH ||
        currentGuess.includes(digit)
      ) {
        return;
      }

      setCurrentGuess((value) => [...value, digit]);
    },
    [currentGuess, gameStatus],
  );

  const removeDigit = useCallback(() => {
    if (gameStatus === 'playing') {
      setCurrentGuess((value) => value.slice(0, -1));
    }
  }, [gameStatus]);

  const submitGuess = useCallback(() => {
    if (gameStatus !== 'playing' || currentGuess.length !== CODE_LENGTH) {
      return;
    }

    const feedback = getFeedback(currentGuess, secret);
    const guessRecord = { digits: currentGuess, ...feedback };
    const nextGuesses = [guessRecord, ...guesses];
    const isWin = feedback.bulls === CODE_LENGTH;
    const isOutOfGuesses = nextGuesses.length >= MAX_ATTEMPTS;

    setGuesses(nextGuesses);
    setCurrentGuess([]);

    if (isWin) {
      setGameStatus('won');
      setGamesPlayed((value) => value + 1);
      setGamesWon((value) => value + 1);
      setBestScore((value) =>
        value === null ? nextGuesses.length : Math.min(value, nextGuesses.length),
      );
    } else if (isOutOfGuesses) {
      setGameStatus('lost');
      setGamesPlayed((value) => value + 1);
    }
  }, [currentGuess, gameStatus, guesses, secret]);

  const startNewGame = useCallback(() => {
    setSecret(createSecret());
    setCurrentGuess([]);
    setGuesses([]);
    setGameStatus('playing');
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (/^\d$/.test(event.key)) {
        addDigit(event.key);
      } else if (event.key === 'Backspace' || event.key === 'Delete') {
        removeDigit();
      } else if (event.key === 'Enter') {
        submitGuess();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addDigit, removeDigit, submitGuess]);

  const remainingGuesses = MAX_ATTEMPTS - guesses.length;
  const isPlaying = gameStatus === 'playing';

  let statusMessage = 'בחרו 4 ספרות שונות כדי להתחיל';
  if (gameStatus === 'won') {
    statusMessage = 'איזה פיצוח! הקוד נפתח 🎉';
  } else if (gameStatus === 'lost') {
    statusMessage = `הפעם הקוד היה ${secret.join('')}. נסו שוב!`;
  } else if (currentGuess.length > 0) {
    statusMessage = `עוד ${CODE_LENGTH - currentGuess.length} ספרות והניחוש מוכן`;
  }

  return (
    <main className="app-shell" dir="rtl">
      <header className="topbar">
        <a className="brand" href="#" aria-label="בול בפוני — דף הבית">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="brand-name">
            בול בפוני<span className="brand-dot">.</span>
          </span>
        </a>
        <div className="topbar-note">
          <span className="online-dot" />
          זמן לקצת חדות מחשבה
        </div>
      </header>

      <section className="intro">
        <div className="eyebrow">
          <span className="eyebrow-line" />
          משחק חשיבה קלאסי
        </div>
        <h1>
          בול בפוני<span className="title-period">.</span>
        </h1>
        <p>ארבע ספרות. קוד אחד. כמה אתם חדים?</p>
      </section>

      <section className="game-layout" aria-label="משחק בול פגיעה">
        <article className="game-card">
          <div className="game-card-head">
            <div className="round-label">
              <span className="round-icon">
                <Icon name="info" size={17} />
              </span>
              <span>המשחק שלך</span>
            </div>
            <div className="attempt-counter" aria-live="polite">
              <span className="attempt-count">{remainingGuesses}</span>
              <span>ניסיונות נותרו</span>
            </div>
          </div>

          <div
            className={`status-banner ${gameStatus !== 'playing' ? `status-${gameStatus}` : ''}`}
            aria-live="polite"
          >
            <span className="status-sparkle" aria-hidden="true">
              ✳
            </span>
            <span>{statusMessage}</span>
          </div>

          <div className="guess-slots" aria-label={`הניחוש הנוכחי: ${currentGuess.length} מתוך 4 ספרות`}>
            {Array.from({ length: CODE_LENGTH }, (_, index) => (
              <div
                className={`guess-slot ${currentGuess[index] ? 'slot-filled' : ''} ${
                  index === currentGuess.length && isPlaying ? 'slot-active' : ''
                }`}
                key={index}
                aria-hidden="true"
              >
                {currentGuess[index] ?? <span className="slot-placeholder">·</span>}
              </div>
            ))}
          </div>

          <div className="keypad" aria-label="לוח ספרות">
            {Array.from({ length: 10 }, (_, index) => String(index)).map((digit) => {
              const isUsed = currentGuess.includes(digit);
              const isDisabled = !isPlaying || isUsed || currentGuess.length >= CODE_LENGTH;
              return (
                <button
                  className={`key-button ${isUsed ? 'key-used' : ''}`}
                  key={digit}
                  type="button"
                  onClick={() => addDigit(digit)}
                  disabled={isDisabled}
                  aria-label={`ספרה ${digit}${isUsed ? ', כבר נבחרה' : ''}`}
                >
                  {digit}
                </button>
              );
            })}
            <button
              className="key-button key-utility"
              type="button"
              onClick={removeDigit}
              disabled={!isPlaying || currentGuess.length === 0}
              aria-label="מחיקת הספרה האחרונה"
            >
              <Icon name="backspace" size={19} />
            </button>
            <button
              className="key-button key-utility key-clear"
              type="button"
              onClick={() => setCurrentGuess([])}
              disabled={!isPlaying || currentGuess.length === 0}
              aria-label="ניקוי הניחוש"
            >
              ניקוי
            </button>
          </div>

          <button
            className="submit-button"
            type="button"
            onClick={submitGuess}
            disabled={!isPlaying || currentGuess.length !== CODE_LENGTH}
          >
            <span>{gameStatus === 'won' ? 'כל הכבוד!' : gameStatus === 'lost' ? 'המשחק הסתיים' : 'בדיקת הניחוש'}</span>
            {isPlaying && <Icon name="arrow" size={19} />}
          </button>
          <p className="keyboard-hint">טיפ קטן: אפשר גם להקליד ישר מהמקלדת <kbd>Enter</kbd></p>
        </article>

        <aside className="side-column">
          <section className="history-card" aria-label="היסטוריית הניחושים">
            <div className="section-heading">
              <div>
                <span className="section-kicker">המסע אל הקוד</span>
                <h2>הניחושים שלך</h2>
              </div>
              <span className="history-count">{guesses.length}/{MAX_ATTEMPTS}</span>
            </div>

            {guesses.length === 0 ? (
              <div className="empty-history">
                <div className="empty-icon" aria-hidden="true">⌁</div>
                <p>כאן יופיעו הניחושים שלך</p>
                <span>כל ניחוש מקרב אותך לפיצוח</span>
              </div>
            ) : (
              <ol className="guess-history">
                {guesses.map((guess, index) => (
                  <li className="history-row" key={`${guess.digits.join('')}-${guesses.length - index}`}>
                    <span className="guess-number">{String(guesses.length - index).padStart(2, '0')}</span>
                    <span className="history-digits" dir="ltr">
                      {guess.digits.map((digit, digitIndex) => (
                        <span className="history-digit" key={`${digit}-${digitIndex}`}>{digit}</span>
                      ))}
                    </span>
                    <span className="feedback-pills" aria-label={`${guess.bulls} בול, ${guess.cows} פגיעה`}>
                      <span className="feedback-pill bull-pill">
                        <i />
                        {guess.bulls}
                      </span>
                      <span className="feedback-pill cow-pill">
                        <i />
                        {guess.cows}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            )}

            <div className="history-legend">
              <span><i className="legend-bull" /> בול</span>
              <span><i className="legend-cow" /> פגיעה</span>
            </div>
          </section>

          <section className="rules-card">
            <div className="rules-icon" aria-hidden="true">✦</div>
            <div className="rules-content">
              <h3>איך משחקים?</h3>
              <p>מנחשים קוד בן 4 ספרות שונות ומקבלים רמז אחרי כל ניסיון.</p>
              <div className="rule-example">
                <span className="example-marker bull-marker">●</span>
                <p><strong>בול</strong> — ספרה נכונה במקום הנכון</p>
              </div>
              <div className="rule-example">
                <span className="example-marker cow-marker">●</span>
                <p><strong>פגיעה</strong> — ספרה נכונה במקום אחר</p>
              </div>
            </div>
          </section>
        </aside>
      </section>

      <section className="stats-strip" aria-label="הסטטיסטיקה שלך">
        <div className="stat-item">
          <span className="stat-value">{gamesPlayed}</span>
          <span className="stat-label">משחקים</span>
        </div>
        <span className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value">{gamesWon}</span>
          <span className="stat-label">פיצוחים</span>
        </div>
        <span className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value">{bestScore ?? '—'}</span>
          <span className="stat-label">שיא אישי</span>
        </div>
        <button className="new-game-button" type="button" onClick={startNewGame}>
          <Icon name="refresh" size={16} />
          משחק חדש
        </button>
      </section>

      <footer className="footer">
        <span>חדות מחשבה, ביס קטן בכל פעם</span>
        <span className="footer-heart" aria-hidden="true">♥</span>
      </footer>
    </main>
  );
}

export default App;
