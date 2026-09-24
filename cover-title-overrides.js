// ShelfCheck curator-approved physical PS4 front-cover corrections.
// These override automated GameEye/IGDB art when the automated source is generic/key art or the wrong physical presentation.
window.SHELFCHECK_TITLE_COVERS={
  "a boy and his blob":"https://pnpdistribution.com/i/A-BOY-AN-P4-N.jpg",
  "2dark":"https://vgdb.uk/images/db/covers/214244.jpg",
  "adk tamashii":"https://limitedrungames.com/cdn/shop/products/ADKProductImage.png?height=1080&v=1576795434",
  "alchemic jousts":"https://www.vpd.fi/media/catalog/product/cache/207e23213cf636ccdef205098cf3c8a3/a/l/alchemic_joust_ps4_sp_po84179.jpg",
  "alienation":"https://cdn.nguyenkimmall.com/images/detailed/232/dia-game--pcas00059-alienation.jpg",
  "anima gate of memories the nameless chronicles":"https://gameline.ph/cdn/shop/files/w_02367a5f-0f95-4ffb-95f2-23e919b404ba_1200x1200.png?v=1759903314",
  "ara fell enhanced edition":"https://www.tradeinn.com/f/14135/141350183/playstation-ps4-ara-fell-and-rise-of-the-third-power-import.webp",
  "armagallant decks of destiny":"https://pnpdistribution.com/i/ARMAG-DD-P4-I.jpg",
  "asdivine hearts":"https://limitedrungames.com/cdn/shop/products/AH-PS4.png?v=1503350384",
  "atari flashback classics volume 1":"https://cdn.awsli.com.br/2500x2500/138/138431/produto/27132878/8e5fec5bad.jpg",
  "8 bit adventure anthology volume one":"https://gamefaqs.gamespot.com/a/box/8/0/8/688808_front.jpg",
  "bayonetta":"https://gamefaqs.gamespot.com/a/box/9/2/1/742921_front.jpg",
  "avicii invector":"https://gamefaqs.gamespot.com/a/box/3/8/9/782389_front.jpg",
  "baldurs gate and baldurs gate ii enhanced editions":"https://gamefaqs.gamespot.com/a/box/4/6/9/723469_front.jpg",
  "bioshock remastered":"https://vgames.co.nz/cdn/shop/files/Bioshock-the-Collection-PS4-2K-22958350.jpg?v=1758591200&width=1946",
  "bioshock 2 remastered":"https://vgames.co.nz/cdn/shop/files/Bioshock-the-Collection-PS4-2K-22958350.jpg?v=1758591200&width=1946",
  "bioshock infinite complete edition":"https://vgames.co.nz/cdn/shop/files/Bioshock-the-Collection-PS4-2K-22958350.jpg?v=1758591200&width=1946",
  "need for speed":"https://gamefaqs.gamespot.com/a/box/4/1/9/562419_front.jpg",
  "sayonara wild hearts":"https://www.avxperten.no/images/product/229726/800x800/78254347-de3b-40d6-846a-00f9ccb02501.jpg",
  "blazing beaks":"https://gamefaqs.gamespot.com/a/box/8/1/3/796813_front.jpg",
  "penguin wars":"https://www.lukiegames.com/assets/images/ps4_penguin_wars-423954.jpg",
  "our world is ended":"https://i5.walmartimages.com/seo/Our-World-Is-Ended-Day-1-Edition-Other_238ef0e0-ef4d-454e-ad33-595355c9d411.24ac03611cb674b4087d1ec18e46aa54.jpeg",
  "one punch man a hero nobody knows":"https://f.fcdn.app/imgs/ce12a0/tienda.soysantander.com.uy/comp/500a/original/catalogo/20-722674121880-P_20-722674121880_1/1500-1500/one-punch-man-a-hero-nobody-knows-juego.jpg",
  "zero strain":"https://gamefaqs.gamespot.com/a/box/8/3/0/710830_front.jpg",
  "hardcore mecha":"https://cdn11.bigcommerce.com/s-kzjsut/images/stencil/1280x1280/products/3587/19755/hardcore-mecha-multilanguage-598427.6__03541.1698692071.jpg?c=2%3Fimbypass%3Don",
  "the flame in the flood complete edition":"https://limitedrungames.com/cdn/shop/products/flame-in-the-flood-ps4-lrg.png?v=1668033181&width=1920",
  "bridge constructor":"https://gamefairy.io/wp-content/uploads/2018/03/Packshot_BC_3D_PEGI.png",
  "void bastards":"https://media.gamestop.com/i/gamestop/11104055/Void-Bastards---PlayStation-4?fmt=auto&h=768&w=768"
};

// Art Department quality gate. Browser-only: CI evaluates this file in a VM without DOM APIs.
(()=>{
  if(typeof document==='undefined')return;
  if(document.querySelector('script[data-shelfcheck-cover-quality]'))return;
  const s=document.createElement('script');
  s.src='cover-quality-v001.js?v=1';
  s.dataset.shelfcheckCoverQuality='1';
  document.head.appendChild(s);
})();
