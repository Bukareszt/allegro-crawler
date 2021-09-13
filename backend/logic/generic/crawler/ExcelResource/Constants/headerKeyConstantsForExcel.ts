const headerKeyConstants = {
  nameOfProduct: { header: "Product Name", key: "productName" },
  auctionId: { header: "Auction Id", key: "productId" },
  priceOfProduct: { header: "Price", key: "productPrice" },
  productCategory: { header: "Category", key: "category" },
  type: { header: "Auction Type", key: "type" },
  quantitySold: {
    header: "Quantity Sold",
    key: "quantityOfSoldItems",
  },
  quantityLeft: { header: "Quantity Left", key: "quantityLeft" },
  freeDeliver: { header: "Free Deliver", key: "freeDeliver" },
  deliverCost: { header: "Deliver Cost", key: "deliveryCost" },
  auctionOwner: { header: "Owner", key: "sellerName" },
  ratingOfOwner: { header: "Owner Rating", key: "rating" },
  deliveryCostRates: {
    header: "Deliver Rating",
    key: "deliveryCostRates",
  },
  descriptionRates: {
    header: "Description Rates",
    key: "descriptionRates",
  },
  serviceRates: { header: "Service Rates", key: "serviceRates" },
  linkToOwner: { header: "Link To Owner", key: "linkToSeller" },
};

export default headerKeyConstants;
