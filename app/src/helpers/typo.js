export const upper = (val) => {
  if (!val) return "";

  return val.toUpperCase();
};

export const lower = (val) => {
  if (!val) return "";

  return val.toLowerCase();
};

export const isEmpty = (val) => {
  if (["", null, undefined].includes(val)) return true;

  return false;
};
