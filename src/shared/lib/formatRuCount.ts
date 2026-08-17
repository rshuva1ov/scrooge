export const formatRuCount = (count: number, forms: [string, string, string]): string => {
  const abs = Math.abs(count) % 100;
  const last = abs % 10;
  const form = abs > 10 && abs < 20 ? forms[2] : last === 1 ? forms[0] : last >= 2 && last <= 4 ? forms[1] : forms[2];

  return `${count} ${form}`;
};
