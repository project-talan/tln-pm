

const checkValue = (value, prefix = '', suffix = '', fallback = '-') => {
  if (value) {
    return `${prefix}${value}${suffix}`;
  }
  return fallback;
}

const checkMember = (object, member, prefix = '', suffix = '', fallback = '-') => {
  if (object && object[member]) {
    return `${prefix}${object[member]}${suffix}`;
  }
  return fallback;
}


export { checkValue, checkMember };
