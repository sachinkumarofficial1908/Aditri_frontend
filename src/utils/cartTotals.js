export const DEFAULT_GST_RATE = 18;

export const getGstRate = (item) => {
  const rate = Number(item?.gstRate);
  return Number.isFinite(rate) && rate >= 0 ? rate : DEFAULT_GST_RATE;
};

export const getItemPrice = (item) => (
  Number(item?.discountPrice) > 0 ? Number(item.discountPrice) : Number(item?.price) || 0
);

export const getLineSubtotal = (item) => getItemPrice(item) * (Number(item?.qty) || 0);

const formatRate = (rate) => (
  Number.isInteger(rate) ? String(rate) : rate.toFixed(2).replace(/\.?0+$/, '')
);

export const getGstLabel = (items) => {
  const rates = [...new Set((items || []).map((item) => getGstRate(item)))];
  return rates.length === 1 ? `GST (${formatRate(rates[0])}%)` : 'GST';
};

export const calculateCartTotals = (items = []) => {
  const subtotal = items.reduce((sum, item) => sum + getLineSubtotal(item), 0);
  const tax = items.reduce((sum, item) => (
    sum + Math.round((getLineSubtotal(item) * getGstRate(item)) / 100)
  ), 0);
  const shipping = 0;

  return {
    subtotal,
    tax,
    shipping,
    total: subtotal + tax + shipping,
    gstLabel: getGstLabel(items),
  };
};
