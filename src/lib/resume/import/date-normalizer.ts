export interface NormalizedDateResult {
  /** Normalized value in YYYY-MM, YYYY (for year-only), or empty string */
  value: string;
  /** True when the source date only specified a 4-digit year (e.g. "2022") */
  isYearOnly: boolean;
  /** True when a numeric date like "03/04/2022" could be MM/DD or DD/MM */
  isAmbiguous: boolean;
  /** True when the input could not be recognized as a valid date */
  isInvalid: boolean;
  /** Original raw text */
  raw: string;
  /** Optional warning message for the review screen */
  warning?: string;
}

export interface NormalizedDateRangeResult {
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isStartYearOnly: boolean;
  isEndYearOnly: boolean;
  isAmbiguous: boolean;
  isInvalidRange: boolean;
  warnings: string[];
}

const MONTH_MAP: Record<string, string> = {
  jan: '01',
  january: '01',
  feb: '02',
  february: '02',
  mar: '03',
  march: '03',
  apr: '04',
  april: '04',
  may: '05',
  jun: '06',
  june: '06',
  jul: '07',
  july: '07',
  aug: '08',
  august: '08',
  sep: '09',
  sept: '09',
  september: '09',
  oct: '10',
  october: '10',
  nov: '11',
  november: '11',
  dec: '12',
  december: '12',
};

const CURRENT_KEYWORDS = /^(present|current|now|ongoing|to\s+date|till\s+date|today)$/i;

/**
 * Checks whether a token represents an ongoing/current employment indicator.
 */
export function isCurrentDateToken(raw: string): boolean {
  const cleaned = raw.trim().replace(/[.,()[\]]/g, '');
  return CURRENT_KEYWORDS.test(cleaned);
}

/**
 * Normalizes a single date token into ResumeCraft's date format:
 * - "Jan 2022" -> "2022-01"
 * - "January 2022" -> "2022-01"
 * - "06/2018" -> "2018-06"
 * - "2022" -> "2022" (preserves year-only without inventing January or December)
 */
export function normalizeSingleDate(rawInput: string): NormalizedDateResult {
  const raw = (rawInput || '').trim();
  if (!raw) {
    return {
      value: '',
      isYearOnly: false,
      isAmbiguous: false,
      isInvalid: false,
      raw,
    };
  }

  // Strip surrounding parentheses or stray punctuation
  const cleaned = raw
    .replace(/^[()[\],\s]+|[()[\],\s]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned || isCurrentDateToken(cleaned)) {
    return {
      value: '',
      isYearOnly: false,
      isAmbiguous: false,
      isInvalid: false,
      raw,
    };
  }

  // 1. Already YYYY-MM
  const isoYearMonth = /^((?:19|20)\d{2})-(0[1-9]|1[0-2])$/.exec(cleaned);
  if (isoYearMonth) {
    return {
      value: `${isoYearMonth[1]}-${isoYearMonth[2]}`,
      isYearOnly: false,
      isAmbiguous: false,
      isInvalid: false,
      raw,
    };
  }

  // 2. Year-only: "2022" -> preserve year without inventing a month
  const yearOnly = /^((?:19|20)\d{2})$/.exec(cleaned);
  if (yearOnly) {
    return {
      value: yearOnly[1],
      isYearOnly: true,
      isAmbiguous: false,
      isInvalid: false,
      raw,
      warning: `Year-only date "${yearOnly[1]}" preserved. Select a month if you want month precision.`,
    };
  }

  // 3. Month Name + Year: "Jan 2022", "January 2022", "Sept. 2021", "Jan, 2022", "Jan '22"
  const monthNameFirst = /^([A-Za-z]+)\.?,?\s+((?:19|20)\d{2}|'\d{2})$/.exec(cleaned);
  if (monthNameFirst) {
    const monthKey = monthNameFirst[1].toLowerCase();
    const monthNum = MONTH_MAP[monthKey];
    let yearStr = monthNameFirst[2];
    if (yearStr.startsWith("'")) {
      const twoDigit = parseInt(yearStr.slice(1), 10);
      yearStr = twoDigit >= 50 ? `19${ yearStr.slice(1) }` : `20${ yearStr.slice(1) }`;
    }
    if (monthNum) {
      return {
        value: `${yearStr}-${monthNum}`,
        isYearOnly: false,
        isAmbiguous: false,
        isInvalid: false,
        raw,
      };
    }
  }

  // 4. Year + Month Name: "2022 Jan", "2022 January"
  const yearFirstMonthName = /^((?:19|20)\d{2})\s+([A-Za-z]+)\.?$/.exec(cleaned);
  if (yearFirstMonthName) {
    const yearStr = yearFirstMonthName[1];
    const monthKey = yearFirstMonthName[2].toLowerCase();
    const monthNum = MONTH_MAP[monthKey];
    if (monthNum) {
      return {
        value: `${yearStr}-${monthNum}`,
        isYearOnly: false,
        isAmbiguous: false,
        isInvalid: false,
        raw,
      };
    }
  }

  // 5. Numeric MM/YYYY or M/YYYY or MM.YYYY or MM-YYYY: "06/2018", "6/2018", "06.2018"
  const numericMonthYear = /^(\d{1,2})[/.-]((?:19|20)\d{2})$/.exec(cleaned);
  if (numericMonthYear) {
    const m = parseInt(numericMonthYear[1], 10);
    const yearStr = numericMonthYear[2];
    if (m >= 1 && m <= 12) {
      const monthPadded = String(m).padStart(2, '0');
      return {
        value: `${yearStr}-${monthPadded}`,
        isYearOnly: false,
        isAmbiguous: false,
        isInvalid: false,
        raw,
      };
    }
    return {
      value: yearStr,
      isYearOnly: true,
      isAmbiguous: false,
      isInvalid: true,
      raw,
      warning: `Invalid month "${numericMonthYear[1]}" in "${raw}". Please confirm the date.`,
    };
  }

  // 6. Numeric YYYY/MM or YYYY.MM: "2018/06", "2018.06"
  const numericYearMonth = /^((?:19|20)\d{2})[/.](\d{1,2})$/.exec(cleaned);
  if (numericYearMonth) {
    const yearStr = numericYearMonth[1];
    const m = parseInt(numericYearMonth[2], 10);
    if (m >= 1 && m <= 12) {
      const monthPadded = String(m).padStart(2, '0');
      return {
        value: `${yearStr}-${monthPadded}`,
        isYearOnly: false,
        isAmbiguous: false,
        isInvalid: false,
        raw,
      };
    }
  }

  // 7. Full numeric date with day: "03/04/2020" or "2020-04-15" or "15/06/2021"
  const isoFullDate = /^((?:19|20)\d{2})-(0[1-9]|1[0-2])-(\d{2})$/.exec(cleaned);
  if (isoFullDate) {
    return {
      value: `${isoFullDate[1]}-${isoFullDate[2]}`,
      isYearOnly: false,
      isAmbiguous: false,
      isInvalid: false,
      raw,
    };
  }

  const slashFullDate = /^(\d{1,2})[/.-](\d{1,2})[/.-]((?:19|20)\d{2})$/.exec(cleaned);
  if (slashFullDate) {
    const first = parseInt(slashFullDate[1], 10);
    const second = parseInt(slashFullDate[2], 10);
    const yearStr = slashFullDate[3];

    // If both first and second are <= 12 and different, it's ambiguous between MM/DD/YYYY and DD/MM/YYYY
    if (first >= 1 && first <= 12 && second >= 1 && second <= 12 && first !== second) {
      const monthPadded = String(first).padStart(2, '0');
      return {
        value: `${yearStr}-${monthPadded}`,
        isYearOnly: false,
        isAmbiguous: true,
        isInvalid: false,
        raw,
        warning: `Ambiguous numeric date "${raw}" interpreted as ${yearStr}-${monthPadded}. Please verify month.`,
      };
    }
    // If first > 12 and second <= 12, it is DD/MM/YYYY
    if (first > 12 && first <= 31 && second >= 1 && second <= 12) {
      const monthPadded = String(second).padStart(2, '0');
      return {
        value: `${yearStr}-${monthPadded}`,
        isYearOnly: false,
        isAmbiguous: false,
        isInvalid: false,
        raw,
      };
    }
    // If second > 12 and first <= 12, it is MM/DD/YYYY
    if (first >= 1 && first <= 12 && second <= 31) {
      const monthPadded = String(first).padStart(2, '0');
      return {
        value: `${yearStr}-${monthPadded}`,
        isYearOnly: false,
        isAmbiguous: false,
        isInvalid: false,
        raw,
      };
    }
  }

  // 8. Two-digit slash date like "05/22" (could be May 2022)
  const shortSlash = /^(\d{1,2})\/(\d{2})$/.exec(cleaned);
  if (shortSlash) {
    const first = parseInt(shortSlash[1], 10);
    const second = parseInt(shortSlash[2], 10);
    if (first >= 1 && first <= 12) {
      const yearStr = second >= 50 ? `19${shortSlash[2]}` : `20${shortSlash[2]}`;
      const monthPadded = String(first).padStart(2, '0');
      return {
        value: `${yearStr}-${monthPadded}`,
        isYearOnly: false,
        isAmbiguous: first <= 12 && second <= 12,
        isInvalid: false,
        raw,
        warning:
          first <= 12 && second <= 12
            ? `Short numeric date "${raw}" interpreted as ${yearStr}-${monthPadded}. Please confirm.`
            : undefined,
      };
    }
  }

  return {
    value: '',
    isYearOnly: false,
    isAmbiguous: false,
    isInvalid: true,
    raw,
    warning: `Unrecognized date format "${raw}". Please select a valid date.`,
  };
}

/**
 * Compares two normalized dates ("YYYY" or "YYYY-MM") chronologically.
 * Returns true if endDate is strictly earlier than startDate.
 */
export function isEndBeforeStart(startDate: string, endDate: string): boolean {
  if (!startDate || !endDate) return false;
  const startYear = parseInt(startDate.slice(0, 4), 10);
  const endYear = parseInt(endDate.slice(0, 4), 10);
  if (Number.isNaN(startYear) || Number.isNaN(endYear)) return false;
  if (endYear < startYear) return true;
  if (endYear > startYear) return false;

  // Same year: compare month if both have months
  const startMonth = startDate.length >= 7 ? parseInt(startDate.slice(5, 7), 10) : null;
  const endMonth = endDate.length >= 7 ? parseInt(endDate.slice(5, 7), 10) : null;
  if (startMonth !== null && endMonth !== null) {
    return endMonth < startMonth;
  }
  return false;
}

/**
 * Parses and normalizes a date range string such as:
 * - "Jan 2022 – Present"
 * - "2022 - Present"
 * - "06/2018 - 12/2021"
 * - "September 2014 – June 2018"
 * Never swaps start and end dates.
 */
export function normalizeDateRange(rawRange: string): NormalizedDateRangeResult {
  const cleaned = (rawRange || '')
    .trim()
    .replace(/[—–−]/g, '-')
    .replace(/\s+to\s+/gi, ' - ')
    .replace(/\s+through\s+/gi, ' - ')
    .replace(/\s+until\s+/gi, ' - ');

  const warnings: string[] = [];

  if (!cleaned) {
    return {
      startDate: '',
      endDate: '',
      isCurrent: false,
      isStartYearOnly: false,
      isEndYearOnly: false,
      isAmbiguous: false,
      isInvalidRange: false,
      warnings,
    };
  }

  // Split on hyphen separator between two date tokens (careful not to split ISO YYYY-MM)
  // Match pattern: <startPart> - <endPart>
  const rangeSplitRegex =
    /^(.+?)\s*-\s*(present|current|now|ongoing|to\s+date|till\s+date|today|(?:[A-Za-z]+\.?,?\s*)?(?:19|20)\d{2}(?:[/.-]\d{1,2})?|\d{1,2}[/.-](?:\d{1,2}[/.-])?(?:19|20)?\d{2})$/i;

  const match = rangeSplitRegex.exec(cleaned);
  if (match) {
    const rawStart = match[1].trim();
    const rawEnd = match[2].trim();

    const startRes = normalizeSingleDate(rawStart);
    if (startRes.warning) warnings.push(startRes.warning);

    if (isCurrentDateToken(rawEnd)) {
      return {
        startDate: startRes.value,
        endDate: '',
        isCurrent: true,
        isStartYearOnly: startRes.isYearOnly,
        isEndYearOnly: false,
        isAmbiguous: startRes.isAmbiguous,
        isInvalidRange: startRes.isInvalid,
        warnings,
      };
    }

    const endRes = normalizeSingleDate(rawEnd);
    if (endRes.warning) warnings.push(endRes.warning);

    const invalidOrder = isEndBeforeStart(startRes.value, endRes.value);
    if (invalidOrder) {
      warnings.push(
        `End date (${endRes.value}) is earlier than start date (${startRes.value}). Dates were not swapped; please review.`
      );
    }

    return {
      startDate: startRes.value,
      endDate: endRes.value,
      isCurrent: false,
      isStartYearOnly: startRes.isYearOnly,
      isEndYearOnly: endRes.isYearOnly,
      isAmbiguous: startRes.isAmbiguous || endRes.isAmbiguous,
      isInvalidRange: startRes.isInvalid || endRes.isInvalid || invalidOrder,
      warnings,
    };
  }

  // Single date fallback
  const single = normalizeSingleDate(cleaned);
  if (single.warning) warnings.push(single.warning);
  return {
    startDate: single.value,
    endDate: '',
    isCurrent: false,
    isStartYearOnly: single.isYearOnly,
    isEndYearOnly: false,
    isAmbiguous: single.isAmbiguous,
    isInvalidRange: single.isInvalid,
    warnings,
  };
}

/**
 * Extracts a date range substring from a line of text if one exists,
 * returning both the matched substring, its normalized range, and the remaining text on the line.
 */
const DATE_TOKEN_PATTERN =
  '(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\\.?\\s*,?\\s*(?:19|20)\\d{2}|(?:19|20)\\d{2}-(?:0[1-9]|1[0-2])|\\d{1,2}[/.-](?:19|20)\\d{2}|\\d{1,2}[/.-]\\d{1,2}[/.-](?:19|20)\\d{2}|(?:19|20)\\d{2})';

const END_TOKEN_PATTERN = `(?:Present|Current|Now|Ongoing|To\\s+Date|Till\\s+Date|Today|${DATE_TOKEN_PATTERN})`;

const INLINE_DATE_RANGE_REGEX = new RegExp(
  `(${DATE_TOKEN_PATTERN}\\s*(?:[—–\\-]|to|through|until)\\s*${END_TOKEN_PATTERN})`,
  'i'
);

export function extractInlineDateRange(line: string): {
  matchedText: string;
  range: NormalizedDateRangeResult;
  remainingText: string;
} | null {
  const match = INLINE_DATE_RANGE_REGEX.exec(line);
  if (!match) return null;

  const matchedText = match[1].trim();
  const range = normalizeDateRange(matchedText);
  if (!range.startDate && !range.endDate) return null;

  const before = line.slice(0, match.index).trim();
  const after = line.slice(match.index + match[0].length).trim();
  const remainingText = [before, after]
    .filter(Boolean)
    .join(' | ')
    .replace(/^[|·•,\-–—()\s]+|[|·•,\-–—()\s]+$/g, '')
    .trim();

  return {
    matchedText,
    range,
    remainingText,
  };
}
