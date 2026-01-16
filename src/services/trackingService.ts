// GMB CORE OS - SYNC PROTOCOL
export const initializeTracking = () => {
  const urlParams = new URLSearchParams(window.location.search);
  let distributorID = urlParams.get('ref') || urlParams.get('prospect') || urlParams.get('referrerId');

  if (distributorID) {
    localStorage.setItem('gmb_ref_id', distributorID);
  } else {
    distributorID = localStorage.getItem('gmb_ref_id') || "067-2922111"; // ID Fondateur par défaut
  }

  return distributorID;
};

export const redirectToShop = () => {
  const currentID = localStorage.getItem('gmb_ref_id') || "067-2922111";
  window.location.href = `https://shopneolife.com/${currentID}/shop/atoz`;
};

export const getDistributorID = () => {
  return localStorage.getItem('gmb_ref_id') || "067-2922111";
};
