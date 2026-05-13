import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type Variant = "landscape" | "story";

export type GymCatAdProps = {
  variant: Variant;
};

const charcoal = "#242424";
const muted = "#555555";
const green = "#1f8749";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

const fade = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

const slide = (frame: number, start: number, distance: number) =>
  interpolate(frame, [start, start + 22], [distance, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

const Logo = ({ scale = 1 }: { scale?: number }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18 * scale }}>
    <Img
      src={staticFile("GymCatLogo.png")}
      style={{
        width: 62 * scale,
        height: 62 * scale,
        borderRadius: 14 * scale,
        boxShadow: "rgba(19, 19, 22, 0.14) 0 12px 34px",
      }}
    />
    <span
      style={{
        color: charcoal,
        fontSize: 34 * scale,
        fontWeight: 760,
        letterSpacing: 0,
      }}
    >
      GymCat
    </span>
  </div>
);

const Pill = ({ children, large = false }: { children: string; large?: boolean }) => (
  <div
    style={{
      width: "max-content",
      padding: large ? "20px 30px" : "14px 22px",
      borderRadius: 9999,
      background: "rgba(255, 255, 255, 0.92)",
      color: charcoal,
      fontSize: large ? 34 : 24,
      fontWeight: 720,
      boxShadow:
        "rgba(19, 19, 22, 0.12) 0 1px 5px -4px, rgba(19, 19, 22, 0.11) 0 14px 42px -16px, rgba(19, 19, 22, 0.1) 0 0 0 1px",
    }}
  >
    {children}
  </div>
);

const SearchBar = ({ variant }: { variant: Variant }) => {
  const frame = useCurrentFrame();
  const text = "gimnasio con piscina por menos de 40";
  const chars = Math.floor(
    interpolate(frame, [84, 150], [0, text.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  return (
    <div
      style={{
        width: variant === "story" ? 900 : 760,
        padding: variant === "story" ? "28px 34px" : "22px 28px",
        borderRadius: 18,
        background: "rgba(255, 255, 255, 0.94)",
        display: "flex",
        alignItems: "center",
        gap: 18,
        boxShadow:
          "rgba(19, 19, 22, 0.16) 0 1px 5px -4px, rgba(19, 19, 22, 0.16) 0 18px 60px -20px, rgba(19, 19, 22, 0.12) 0 0 0 1px",
      }}
    >
      <div
        style={{
          width: variant === "story" ? 38 : 28,
          height: variant === "story" ? 38 : 28,
          border: "4px solid #8b8b8b",
          borderRadius: "50%",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 15,
            height: 4,
            background: "#8b8b8b",
            right: -11,
            bottom: -5,
            transform: "rotate(45deg)",
            borderRadius: 9999,
          }}
        />
      </div>
      <span
        style={{
          color: charcoal,
          fontSize: variant === "story" ? 42 : 30,
          fontWeight: 560,
          letterSpacing: 0,
          whiteSpace: "nowrap",
        }}
      >
        {text.slice(0, chars)}
        <span style={{ color: green }}>|</span>
      </span>
    </div>
  );
};

const ResultCard = ({
  title,
  price,
  delay,
  variant,
}: {
  title: string;
  price: string;
  delay: number;
  variant: Variant;
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - delay;
  const scale = spring({
    frame: localFrame,
    fps: 30,
    config: { damping: 18, stiffness: 120 },
  });

  return (
    <div
      style={{
        opacity: fade(frame, delay, delay + 16),
        transform: `translateY(${slide(frame, delay, 28)}px) scale(${0.96 + scale * 0.04})`,
        width: variant === "story" ? 410 : 330,
        padding: variant === "story" ? 28 : 22,
        borderRadius: 16,
        background: "rgba(255, 255, 255, 0.94)",
        boxShadow:
          "rgba(19, 19, 22, 0.14) 0 1px 5px -4px, rgba(19, 19, 22, 0.14) 0 18px 48px -18px, rgba(19, 19, 22, 0.12) 0 0 0 1px",
      }}
    >
      <div style={{ fontSize: variant === "story" ? 30 : 22, color: charcoal, fontWeight: 740 }}>
        {title}
      </div>
      <div style={{ marginTop: 16, display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: variant === "story" ? 56 : 42, color: charcoal, fontWeight: 780 }}>
          {price}
        </span>
        <span style={{ fontSize: variant === "story" ? 22 : 18, color: muted }}>/mes</span>
      </div>
      <div
        style={{
          marginTop: 18,
          display: "inline-flex",
          padding: "7px 13px",
          borderRadius: 9999,
          background: "rgba(31, 135, 73, 0.12)",
          color: green,
          fontSize: variant === "story" ? 22 : 16,
          fontWeight: 720,
        }}
      >
        sin letra pequeña
      </div>
    </div>
  );
};

const Intro = ({ variant }: { variant: Variant }) => {
  const frame = useCurrentFrame();
  const isStory = variant === "story";

  return (
    <>
      <div
        style={{
          opacity: fade(frame, 0, 20),
          transform: `translateY(${slide(frame, 0, 28)}px)`,
        }}
      >
        <Logo scale={isStory ? 1.35 : 1} />
      </div>
      <div
        style={{
          marginTop: isStory ? 86 : 70,
          opacity: fade(frame, 12, 36),
          transform: `translateY(${slide(frame, 12, 38)}px)`,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: isStory ? 14 : 10,
            padding: isStory ? "14px 24px" : "9px 17px",
            borderRadius: 9999,
            background: "rgba(31, 135, 73, 0.12)",
            color: green,
            fontSize: isStory ? 34 : 23,
            fontWeight: 730,
          }}
        >
          <span
            style={{
              width: isStory ? 14 : 10,
              height: isStory ? 14 : 10,
              borderRadius: 9999,
              background: green,
            }}
          />
          Cataluña
        </div>
        <h1
          style={{
            margin: isStory ? "44px 0 0" : "34px 0 0",
            width: isStory ? 860 : 850,
            color: charcoal,
            fontSize: isStory ? 112 : 84,
            lineHeight: 0.94,
            fontWeight: 820,
            letterSpacing: 0,
          }}
        >
          El gimnasio que buscas, sin letra pequeña.
        </h1>
      </div>
    </>
  );
};

const SearchScene = ({ variant }: { variant: Variant }) => {
  const frame = useCurrentFrame();
  const isStory = variant === "story";

  return (
    <div
      style={{
        opacity: fade(frame, 0, 20),
        transform: `translateY(${slide(frame, 0, 32)}px)`,
      }}
    >
      <h2
        style={{
          margin: 0,
          width: isStory ? 900 : 880,
          color: charcoal,
          fontSize: isStory ? 82 : 62,
          lineHeight: 1,
          fontWeight: 800,
          letterSpacing: 0,
        }}
      >
        Busca como hablarías con una persona.
      </h2>
      <div style={{ marginTop: isStory ? 62 : 48 }}>
        <SearchBar variant={variant} />
      </div>
      <p
        style={{
          marginTop: isStory ? 40 : 30,
          width: isStory ? 860 : 820,
          color: muted,
          fontSize: isStory ? 42 : 30,
          lineHeight: 1.25,
          fontWeight: 520,
        }}
      >
        Precio, instalaciones, horarios, permanencia y reseñas en un solo sitio.
      </p>
    </div>
  );
};

const ResultsScene = ({ variant }: { variant: Variant }) => {
  const isStory = variant === "story";
  return (
    <>
      <h2
        style={{
          margin: 0,
          color: charcoal,
          fontSize: isStory ? 78 : 58,
          lineHeight: 1,
          fontWeight: 820,
          letterSpacing: 0,
        }}
      >
        Compara antes de apuntarte.
      </h2>
      <div
        style={{
          marginTop: isStory ? 58 : 42,
          display: "flex",
          flexDirection: isStory ? "column" : "row",
          gap: isStory ? 22 : 18,
        }}
      >
        <ResultCard title="Gimnasio A" price="29 EUR" delay={10} variant={variant} />
        <ResultCard title="Gimnasio B" price="37 EUR" delay={24} variant={variant} />
        <ResultCard title="Gimnasio C" price="45 EUR" delay={38} variant={variant} />
      </div>
    </>
  );
};

const ClosingScene = ({ variant }: { variant: Variant }) => {
  const frame = useCurrentFrame();
  const isStory = variant === "story";
  return (
    <>
      <div style={{ opacity: fade(frame, 0, 18), transform: `translateY(${slide(frame, 0, 34)}px)` }}>
        <Logo scale={isStory ? 1.35 : 1.05} />
      </div>
      <h2
        style={{
          margin: isStory ? "82px 0 0" : "58px 0 0",
          width: isStory ? 850 : 880,
          color: charcoal,
          fontSize: isStory ? 92 : 72,
          lineHeight: 0.98,
          fontWeight: 820,
          letterSpacing: 0,
        }}
      >
        Decide con datos. Entrena donde encajas.
      </h2>
      <div style={{ marginTop: isStory ? 62 : 44, display: "grid", gap: 18 }}>
        <Pill large={isStory}>gymcat.es</Pill>
        <Pill large={isStory}>Hecho para ayudarte, no para venderte un gimnasio</Pill>
      </div>
    </>
  );
};

export const GymCatAd = ({ variant }: GymCatAdProps) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const isStory = variant === "story";
  const bg = isStory ? "gymcat-story-background.png" : "gymcat-og-background.png";
  const contentLeft = isStory ? 72 : 116;
  const contentTop = isStory ? 96 : 84;

  const pan = interpolate(frame, [0, isStory ? 450 : 900], [0, isStory ? -42 : -56], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#f7f7f5", fontFamily: "Inter, Helvetica Neue, Arial, sans-serif" }}>
      <Img
        src={staticFile(bg)}
        style={{
          position: "absolute",
          inset: 0,
          width,
          height,
          objectFit: "cover",
          transform: `scale(1.05) translateX(${pan}px)`,
          opacity: 0.86,
        }}
      />
      <AbsoluteFill
        style={{
          background: isStory
            ? "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0.28) 62%, rgba(255,255,255,0.94) 100%)"
            : "linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.92) 43%, rgba(255,255,255,0.18) 74%, rgba(255,255,255,0.02) 100%)",
        }}
      />
      <div style={{ position: "absolute", left: contentLeft, top: contentTop }}>
        <Sequence from={0} durationInFrames={isStory ? 144 : 250}>
          <Intro variant={variant} />
        </Sequence>
        <Sequence from={isStory ? 140 : 242} durationInFrames={isStory ? 150 : 260}>
          <SearchScene variant={variant} />
        </Sequence>
        <Sequence from={isStory ? 286 : 495} durationInFrames={isStory ? 108 : 222}>
          <ResultsScene variant={variant} />
        </Sequence>
        <Sequence from={isStory ? 372 : 704}>
          <ClosingScene variant={variant} />
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};
