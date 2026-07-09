import { ImageResponse } from "next/og";

export const ogImageSize = { width: 1200, height: 630 };
export const ogImageContentType = "image/png";

export const renderOgImage = () => {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "90px",
        background: "linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: 999,
            background: "linear-gradient(135deg, #DC2626, #B91C1C)",
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: 4,
          }}
        >
          <span style={{ color: "#111111" }}>Dev</span>{" "}
          <span style={{ color: "#DC2626" }}>Showcase</span>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          color: "#6B7280",
          fontSize: 22,
          fontWeight: 500,
          marginLeft: 30,
          marginBottom: 48,
        }}
      >
        Premium Portfolio
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 76,
          fontWeight: 700,
          lineHeight: 1.05,
        }}
      >
        <span
          style={{
            color: "#111111",
            fontWeight: "900",
            position: "relative",
            left: "-10px",
          }}
        >
          Jordão
        </span>
        <span
          style={{
            color: "#DC2626",
            fontWeight: "900",
            position: "relative",
            left: "0",
          }}
        >
          Beghetto
        </span>
        <span
          style={{
            color: "#DC2626",
            fontWeight: "900",
            position: "relative",
            left: "0",
          }}
        >
          Massariol
        </span>
      </div>
      <div
        style={{
          display: "flex",
          color: "#6B7280",
          fontSize: 34,
          marginTop: 28,
        }}
      >
        Líder Técnico | Desenvolvedor de Software Pleno
      </div>
    </div>,
    { ...ogImageSize },
  );
};
