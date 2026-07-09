import { renderOgImage } from "@/lib/og-image";

export { ogImageSize as size, ogImageContentType as contentType } from "@/lib/og-image";

export const alt = "Jordão Beghetto Massariol — Dev Showcase";

const Image = () => {
  return renderOgImage();
};

export default Image;
