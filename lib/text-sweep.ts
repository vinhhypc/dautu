const DURATION = 1200;
const LINE_STAGGER = 100;
const FROM = 30;
const TO = 100;

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
}

type Word = {
  text: string;
  top: number;
  color: string;
  spaceAfter: boolean;
};

function collectWords(el: HTMLElement): Word[] {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  const words: Word[] = [];

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const color = node.parentElement ? getComputedStyle(node.parentElement).color : "";
    for (const match of node.data.matchAll(/\s+|\S+/g)) {
      if (/^\s+$/.test(match[0])) {
        const last = words.at(-1);
        if (last) last.spaceAfter = true;
        continue;
      }
      range.setStart(node, match.index);
      range.setEnd(node, match.index + match[0].length);
      const rect = range.getClientRects()[0] ?? range.getBoundingClientRect();
      words.push({ text: match[0], top: rect.top, color, spaceAfter: false });
    }
  }
  return words;
}

function groupLines(words: Word[]): Word[][] {
  const lines: Word[][] = [];
  let lastTop: number | null = null;
  for (const word of words) {
    if (lastTop === null || Math.abs(word.top - lastTop) > 2) {
      lines.push([]);
      lastTop = word.top;
    }
    lines[lines.length - 1].push(word);
  }
  return lines;
}

function buildLine(words: Word[], lineClass: string): HTMLElement {
  const line = document.createElement("span");
  line.className = lineClass ? `sweep-line ${lineClass}` : "sweep-line";
  let run: HTMLElement | null = null;
  words.forEach((word, index) => {
    if (!run || run.dataset.color !== word.color) {
      run = document.createElement("span");
      run.className = "sweep-run";
      run.dataset.color = word.color;
      run.style.setProperty("--sweep-final", word.color);
      line.append(run);
    }
    const isLast = index === words.length - 1;
    run.textContent += word.text + (word.spaceAfter && !isLast ? " " : "");
  });
  return line;
}

export function playSweep(el: HTMLElement, delay: number): () => void {
  const original = Array.from(el.childNodes);
  const lineClass = el.dataset.sweepLine ?? "";
  const lines = groupLines(collectWords(el)).map((words) => buildLine(words, lineClass));

  el.replaceChildren(...lines);
  for (const line of lines) {
    const box = line.getBoundingClientRect();
    line.style.setProperty("--sweep-line-w", `${box.width}px`);
    line.querySelectorAll<HTMLElement>(".sweep-run").forEach((run) => {
      run.style.setProperty("--sweep-run-x", `${run.getBoundingClientRect().left - box.left}px`);
    });
  }
  el.dataset.sweepState = "playing";

  const start = performance.now() + delay;
  const total = DURATION + LINE_STAGGER * (lines.length - 1);
  let frame = 0;

  const finish = () => {
    el.replaceChildren(...original);
    el.dataset.sweepState = "done";
  };

  const tick = (now: number) => {
    lines.forEach((line, index) => {
      const t = Math.min(Math.max((now - start - index * LINE_STAGGER) / DURATION, 0), 1);
      line.style.setProperty("--sweep-progress", String(FROM + (TO - FROM) * easeInOut(t)));
    });
    if (now - start < total) frame = requestAnimationFrame(tick);
    else finish();
  };
  frame = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frame);
    if (el.dataset.sweepState === "playing") el.replaceChildren(...original);
    delete el.dataset.sweepState;
  };
}
